import httpx
from bs4 import BeautifulSoup

async def parse_channel_html(channel: str, limit: int = 50):
    url = f"https://t.me/s/{channel}"

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }

    async with httpx.AsyncClient(timeout=15, headers=headers) as client:
        resp = await client.get(url)

    soup = BeautifulSoup(resp.text, "html.parser")

    posts = soup.select(".tgme_widget_message")
    posts = posts[-limit:]  # берем последние post_count сообщений

    result = []

    for p in posts:
        text_block = p.select_one(".tgme_widget_message_text")
        text = text_block.get_text("\n").strip() if text_block else ""

        link_tag = p.select_one("a.tgme_widget_message_date")
        link = link_tag["href"] if link_tag else ""

        date = link_tag.get_text() if link_tag else ""

        result.append({
            "text": text,
            "link": link,
            "date": date
        })

    return result
