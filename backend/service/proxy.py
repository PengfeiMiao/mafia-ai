import httpx
from lxml import etree

from backend.util.common import remove_blank_lines


async def common_proxy(body, target_url):
    async with httpx.AsyncClient(verify=False, follow_redirects=True) as client:
        method = body.get('method', 'GET').upper()
        headers = body.get('headers', {})
        params = body.get('params', {})
        data = body.get('data', {})

        if method == 'GET':
            resp = await client.get(target_url, headers=headers, params=params)
        elif method == 'POST':
            resp = await client.post(target_url, headers=headers, params=params, json=data)
        else:
            return {"error": "Unsupported method"}

        return {
            "status_code": resp.status_code,
            "content": resp.content.decode('utf-8', errors='ignore'),
            "headers": dict(resp.headers),
        }


async def get_proxy(target_url):
    return await common_proxy({}, target_url)


async def parse_get_proxy(url: str, xpaths: list):
    previews = []
    resp = await common_proxy({}, url)
    try:
        content = resp.get('content')
        if '<?xml' in content:
            content = content[content.find('?>') + 2:]
        html_tree = etree.HTML(content)
        for xpath_ in xpaths:
            selected_html = html_tree.xpath(xpath_ + '//text()')
            previews.append('\n'.join([remove_blank_lines(elem) for elem in list(selected_html)]))
    finally:
        for (index, _) in enumerate(xpaths):
            if index >= len(previews):
                previews.append('empty')
        return previews
