"""Builds index.html, a single self-contained page, from src/ and the design system.

Tokens come from design-system/tokens.json and component styles from
design-system/components/bundle.css, so the page stays in step with the system.
Run: python3 sdlc-adlc-guide/build.py
"""
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
DS = HERE.parent / "design-system"
SRC = HERE / "src"
JS_ORDER = ["helpers.js", "terms.js", "sdlc.js", "adlc.js", "compare.js", "app.js"]


def tokens_css():
    data = json.loads((DS / "tokens.json").read_text())
    colors = data["color"]["tokens"]
    by_name = {t["name"]: t["value"] for t in colors}

    def resolve(value, theme):
        m = re.fullmatch(r"\{(.+)\}", value)
        return resolve(by_name[m.group(1)][theme], theme) if m else value

    def block(theme):
        lines = [f"--{t['name']}:{resolve(t['value'][theme], theme)};" for t in colors]
        for s in data["shadow"]["tokens"]:
            v = s["value"]
            lines.append(f"--{s['name']}:{v[theme] if isinstance(v, dict) else v};")
        return "".join(lines)

    fixed = []
    for role, stack in data["type"]["families"].items():
        fixed.append(f"--font-{role}:{stack};")
    for group in ("radius", "spacing", "layout"):
        for t in data[group]["tokens"]:
            fixed.append(f"--{t['name']}:{t['value']};")

    dark, light = block("dark"), block("light")
    return (
        "/* Tokens generated from design-system/tokens.json. Dark-first: dark on bare :root. */\n"
        f":root{{{dark}{''.join(fixed)}color-scheme:dark}}\n"
        f"@media (prefers-color-scheme: light){{:root:not([data-theme=\"dark\"]){{{light}color-scheme:light}}}}\n"
        f":root[data-theme=\"light\"]{{{light}color-scheme:light}}\n"
        f":root[data-theme=\"dark\"]{{{dark}color-scheme:dark}}\n"
    )


def bundle_css():
    css = (DS / "components" / "bundle.css").read_text()
    # The font @import is replaced by a <link> in the page head.
    return re.sub(r"@import url\([^)]*\);\s*", "", css, count=1)


def main():
    page = (SRC / "page.html").read_text()
    css = tokens_css() + bundle_css() + (SRC / "page.css").read_text()
    js = "\n".join((SRC / name).read_text() for name in JS_ORDER)
    out = page.replace("/*@CSS*/", css).replace("/*@JS*/", js)
    (HERE / "index.html").write_text(out)
    print(f"wrote {HERE / 'index.html'} ({len(out.encode()):,} bytes)")


if __name__ == "__main__":
    main()
