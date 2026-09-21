#!/usr/bin/env python3
"""Build the self-contained /oracle/ package for astro-marinka.ru."""

from pathlib import Path
import shutil


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "dist" / "oracle"


def main() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    assets = OUT / "assets"
    fonts = assets / "fonts"
    fonts.mkdir(parents=True)

    html = (ROOT / "oracle" / "index.html").read_text(encoding="utf-8")
    html = html.replace('href="/assets/style.css"', 'href="/oracle/assets/style.css"')
    html = html.replace('/assets/oracle-standalone.css', '/oracle/assets/oracle-standalone.css')
    html = html.replace('src="/assets/site.js"', 'src="/oracle/assets/site.js"')
    html = html.replace('src="/assets/oracle.js', 'src="/oracle/assets/oracle.js')
    html = html.replace('src="/assets/oracle-scroll.js', 'src="/oracle/assets/oracle-scroll.js')
    html = html.replace('src="/assets/oracle-marina.jpg"', 'src="/oracle/assets/oracle-marina.jpg"')
    html = html.replace('/assets/marina-logo.png', '/oracle/assets/marina-logo.png')
    html = html.replace('src="/assets/iching-coin-', 'src="/oracle/assets/iching-coin-')
    html = html.replace('href="/politika-konfidencialnosti/"', 'href="/oracle/politika-konfidencialnosti/"')
    html = html.replace('href="/soglasie-na-obrabotku-dannyh/"', 'href="/oracle/soglasie-na-obrabotku-dannyh/"')
    (OUT / "index.html").write_text(html, encoding="utf-8")

    for slug in ("politika-konfidencialnosti", "soglasie-na-obrabotku-dannyh"):
        legal_html = (ROOT / slug / "index.html").read_text(encoding="utf-8")
        legal_html = legal_html.replace('/assets/', '/oracle/assets/')
        legal_html = legal_html.replace(
            f'https://astro-marinka.ru/{slug}/',
            f'https://astro-marinka.ru/oracle/{slug}/',
        )
        legal_html = legal_html.replace('href="/politika-konfidencialnosti/"', 'href="/oracle/politika-konfidencialnosti/"')
        legal_html = legal_html.replace('href="/soglasie-na-obrabotku-dannyh/"', 'href="/oracle/soglasie-na-obrabotku-dannyh/"')
        legal_out = OUT / slug
        legal_out.mkdir()
        (legal_out / "index.html").write_text(legal_html, encoding="utf-8")

    css = (ROOT / "assets" / "style.css").read_text(encoding="utf-8")
    css = css.replace("url('/assets/fonts/", "url('/oracle/assets/fonts/")
    (assets / "style.css").write_text(css, encoding="utf-8")
    shutil.copy2(ROOT / "assets" / "oracle-standalone.css", assets / "oracle-standalone.css")

    js = (ROOT / "assets" / "oracle.js").read_text(encoding="utf-8")
    js = js.replace("'/assets/iching-coin-", "'/oracle/assets/iching-coin-")
    (assets / "oracle.js").write_text(js, encoding="utf-8")
    shutil.copy2(ROOT / "assets" / "oracle-scroll.js", assets / "oracle-scroll.js")

    for name in ("site.js", "oracle-marina.jpg", "marina-logo.png", "iching-coin-yang.png", "iching-coin-yin.png"):
        shutil.copy2(ROOT / "assets" / name, assets / name)
    for name in ("onest.woff", "oswald.woff"):
        shutil.copy2(ROOT / "assets" / "fonts" / name, fonts / name)


if __name__ == "__main__":
    main()
