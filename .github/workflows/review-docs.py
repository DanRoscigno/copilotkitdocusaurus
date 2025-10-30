import os, re, textwrap, requests, time

# ---- Env / API setup
GITHUB_TOKEN = os.environ["GITHUB_TOKEN"]
OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
OWNER, REPO = os.environ["REPO_FULL"].split("/", 1)
PR_NUMBER = int(os.environ["PR_NUMBER"])
HEAD_SHA = os.environ["HEAD_SHA"]

GH = "https://api.github.com"
HEADERS_GH = {"Authorization": f"Bearer {GITHUB_TOKEN}", "Accept": "application/vnd.github+json"}
OPENAI_URL = "https://api.openai.com/v1/responses"
HEADERS_OAI = {"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"}

# ---- GitHub helpers
def gh_get(url, **params):
    r = requests.get(url, headers=HEADERS_GH, params=params, timeout=60)
    r.raise_for_status()
    return r.json()

def gh_post(url, payload):
    r = requests.post(url, headers=HEADERS_GH, json=payload, timeout=60)
    r.raise_for_status()
    return r.json()

def list_changed_files():
    files, page = [], 1
    while True:
        data = gh_get(f"{GH}/repos/{OWNER}/{REPO}/pulls/{PR_NUMBER}/files", per_page=100, page=page)
        files.extend(data)
        if len(data) < 100: break
        page += 1
    interesting = []
    for f in files:
        path = f["filename"]
        low = path.lower()
        if not low.endswith((".md", ".mdx")): continue
        if not (low.startswith("docs/en/") or low.startswith("docs/ja/") or low.startswith("docs/zh/")): continue
        interesting.append(f)
    return interesting

def parse_unified_diff_to_hunks(patch_text):
    hunks = []
    if not patch_text: return hunks
    header_re = re.compile(r"^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@")
    hunk, new_line = None, None
    for raw in patch_text.splitlines():
        m = header_re.match(raw)
        if m:
            if hunk: hunks.append(hunk)
            new_line = int(m.group(2))
            hunk = {"new_start": new_line, "lines": [], "first_added_line": None}
            continue
        if hunk is None: continue
        if raw.startswith('+'):
            hunk["lines"].append(('+', raw[1:]))
            if hunk["first_added_line"] is None: hunk["first_added_line"] = new_line
            new_line += 1
        elif raw.startswith('-'):
            hunk["lines"].append(('-', raw[1:]))
        elif raw.startswith(' '):
            hunk["lines"].append((' ', raw[1:]))
            new_line += 1
        else:
            hunk["lines"].append((' ', raw))
    if hunk: hunks.append(hunk)
    return hunks

# ---- Locale-aware system prompt
SYSTEM_BASE = textwrap.dedent("""
You are a meticulous documentation editor enforcing the Microsoft Writing Style Guide.
General priorities:
- Voice: conversational, second person (“you”), active voice, concise.
- Clarity & scanability: short sentences, lists with parallel structure.
- Punctuation & capitalization: sentence case headings; consistent capitalization; serial comma as appropriate.
- Text formatting: correct code/UI formatting (backticks for code, bold for UI labels).
- Inclusive, bias-free, global English.
- Terminology consistency: prefer Microsoft-approved terms; flag deprecated variants.
- Avoid Latin abbreviations (“e.g.”, “i.e.”) in English; prefer “for example”, “that is”.
When nothing needs changing for a hunk, respond exactly: OK.
""").strip()

SYSTEM_JA_DELTA = textwrap.dedent("""
Locale: Japanese (ja-JP)
Apply Microsoft Japanese localization norms:
- Prefer Japanese punctuation (、。) in Japanese sentences; avoid mixing with English commas/periods.
- Use full-width punctuation in Japanese text where appropriate; use half-width ASCII for code/UI tokens.
- Use 半角英数字 for programmatic identifiers, file names, options, and URLs; set them in code style.
- No spaces between Japanese characters; allow a space around embedded Latin words only when it improves readability.
- Use Arabic numerals by default; avoid trailing periods in headings.
Return suggestions in Japanese when the changed lines are Japanese.
""").strip()

SYSTEM_ZH_DELTA = textwrap.dedent("""
Locale: Chinese (Simplified) (zh-CN)
Apply Microsoft Simplified Chinese localization norms:
- Prefer full-width Chinese punctuation in Chinese sentences（，。；：！？）, and half-width ASCII for code/UI tokens.
- Don’t add spaces between Chinese characters; add a normal space around embedded Latin words or inline code when needed.
- Use Arabic numerals by default; avoid ending punctuation in headings; keep list punctuation consistent.
- Prefer standard Microsoft Chinese terms; avoid transliteration where a standard term exists.
Return suggestions in Simplified Chinese when the changed lines are Chinese.
""").strip()

def make_system_prompt(locale):
    if locale == "ja": return SYSTEM_BASE + "\n\n" + SYSTEM_JA_DELTA
    if locale == "zh": return SYSTEM_BASE + "\n\n" + SYSTEM_ZH_DELTA
    return SYSTEM_BASE

def detect_locale_from_path(path):
    low = path.lower()
    if low.startswith("docs/ja/"): return "ja"
    if low.startswith("docs/zh/"): return "zh"
    return "en"

# ---- OpenAI batching
def openai_review_hunks(locale, hunks):
    parts = []
    for i, snip in enumerate(hunks, 1):
        parts.append(f"---\nFILE: {snip['file']}\nHUNK #{i}:\n{snip['hunk_text']}\n")
    user_prompt = (
        "Review these Markdown diff hunks for Microsoft Style Guide adherence. "
        "For EACH hunk, return: (1) one-line rationale, (2) a few bullet ‘before → after’ examples, "
        "(3) tag the guideline area in parentheses. Keep under ~120 words per hunk. "
        "If nothing to fix, reply exactly: OK.\n\n"
        + "\n".join(parts)
    )
    body = {
        "model": "o4-mini",
        "input": [
            {"role": "system", "content": make_system_prompt(locale)},
            {"role": "user", "content": user_prompt}
        ],
    }
    r = requests.post(OPENAI_URL, headers=HEADERS_OAI, json=body, timeout=120)
    r.raise_for_status()
    data = r.json()
    try:
        text = data["output"][0]["content"][0]["text"]
    except Exception:
        text = (data.get("choices", [{}])[0].get("message", {}).get("content")
                or data.get("text") or "")
    if not text: return ["OK"] * len(hunks)
    blocks = [b.strip() for b in re.split(r"\n-{3,}\n|^\s*HUNK\s*#\d+[:\s-]*\n", text, flags=re.MULTILINE) if b.strip()]
    if len(blocks) == len(hunks): return blocks
    if len(blocks) > len(hunks): return blocks[:len(hunks)]
    return [text.strip()] * len(hunks)

# ---- Links shown under every suggestion
LINKS_EN = (
    "[Writing Style Guide](https://learn.microsoft.com/en-us/style-guide/welcome/) · "
    "[Text formatting](https://learn.microsoft.com/en-us/style-guide/text-formatting/) · "
    "[Punctuation](https://learn.microsoft.com/en-us/style-guide/punctuation/) · "
    "[Avoid Latin abbreviations](https://learn.microsoft.com/en-us/style-guide/word-choice/use-us-spelling-avoid-non-english-words)"
)
LINKS_JA = (
    "[日本語ローカライズ ガイド](https://learn.microsoft.com/ja-jp/globalization/reference/microsoft-style-guides) · "
    "[Japanese Style Guide (PDF)](https://download.microsoft.com/download/a/8/2/a822a118-18d4-4429-b857-1b65ab388315/jpn-jpn-StyleGuide.pdf) · "
    "[テキスト書式](https://learn.microsoft.com/en-us/style-guide/text-formatting/) · "
    "[句読点](https://learn.microsoft.com/en-us/style-guide/punctuation/)"
)
LINKS_ZH = (
    "[本地化风格指南（列表）](https://learn.microsoft.com/en-us/globalization/reference/microsoft-style-guides) · "
    "[简体中文风格指南 (PDF)](https://download.microsoft.com/download/1/5/9/159cb91c-b61b-4385-97ca-80ccc7ff1fa0/zho-chn-StyleGuide.pdf) · "
    "[文本格式](https://learn.microsoft.com/zh-cn/style-guide/text-formatting/) · "
    "[标点符号](https://learn.microsoft.com/zh-cn/style-guide/punctuation/periods)"
)

def links_for(locale):
    return {"en": LINKS_EN, "ja": LINKS_JA, "zh": LINKS_ZH}[locale]

def create_inline_comment(path, line, body):
    payload = {"body": body, "commit_id": HEAD_SHA, "path": path, "side": "RIGHT", "line": int(line)}
    return gh_post(f"{GH}/repos/{OWNER}/{REPO}/pulls/{PR_NUMBER}/comments", payload)

def main():
    changed = list_changed_files()
    if not changed:
        print("No relevant Markdown changes in docs/en|ja|zh.")
        return

    MAX_HUNKS_TOTAL = 18
    MAX_CHARS_PER_HUNK = 1800

    buckets = {"en": [], "ja": [], "zh": []}
    anchors  = {"en": [], "ja": [], "zh": []}

    for f in changed:
        path, patch = f["filename"], f.get("patch") or ""
        locale = detect_locale_from_path(path)
        for h in parse_unified_diff_to_hunks(patch):
            if not any(k in {"+", "-"} for k,_ in h["lines"]): continue
            text_lines = []
            for kind, txt in h["lines"]:
                prefix = {"+": "+ ", "-": "- ", " ": "  "}[kind]
                text_lines.append(prefix + txt)
            hunk_text = "\n".join(text_lines)[:MAX_CHARS_PER_HUNK]
            anchor_line = h.get("first_added_line") or h["new_start"]
            buckets[locale].append({"file": path, "hunk_text": hunk_text})
            anchors[locale].append((path, anchor_line))
            total = sum(len(v) for v in buckets.values())
            if total >= MAX_HUNKS_TOTAL: break

    posted = 0
    for locale in ("en", "ja", "zh"):
        if not buckets[locale]: continue
        suggestions = openai_review_hunks(locale, buckets[locale])
        linkpack = links_for(locale)
        for (path, line), body in zip(anchors[locale], suggestions):
            if body.strip().upper() == "OK": continue
            comment_body = "Microsoft style suggestion:\n\n" + body.strip() + f"\n\n_References: {linkpack}_"
            try:
                create_inline_comment(path, line, comment_body[:6000])
                posted += 1
                time.sleep(0.3)
            except requests.HTTPError as e:
                print(f"Failed to comment on {path}:{line} -> {e}")

    if posted == 0:
        gh_post(f"{GH}/repos/{OWNER}/{REPO}/issues/{PR_NUMBER}/comments",
                {"body": "✅ No Microsoft style issues detected in changed hunks."})
        print("No issues; posted summary.")
    else:
        print(f"Posted {posted} inline comment(s).")

if __name__ == "__main__":
    main()
