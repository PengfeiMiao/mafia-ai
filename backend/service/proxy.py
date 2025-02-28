import httpx


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