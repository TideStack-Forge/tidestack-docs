"""对隔离基座执行真实 HTTP 权限测试；成功时会新增一条测试物料。"""
import json
import os
import uuid
from urllib.error import HTTPError
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def required(name):
    value = os.environ.get(name)
    if not value:
        raise SystemExit(f"请设置 {name}")
    return value


def request(method, authorization=None, payload=None):
    headers = {"Accept": "application/json"}
    if authorization:
        headers["Authorization"] = authorization
    body = None
    if payload is not None:
        headers["Content-Type"] = "application/json"
        body = json.dumps(payload).encode()
    req = Request(base_url + "/api/custom/materials", data=body, headers=headers, method=method)
    try:
        with opener.open(req, timeout=20) as response:
            status, body = response.status, response.read()
    except HTTPError as error:
        status, body = error.code, error.read()
    try:
        result = json.loads(body)
    except (ValueError, UnicodeDecodeError):
        raise AssertionError(f"{method} 返回非 JSON，HTTP {status}；检查实例地址和鉴权链路") from None
    return status, result


def expect(label, response, expected):
    status, result = response
    assert isinstance(result, dict), f"{label}: 响应不是标准对象"
    if expected == 0:
        assert 200 <= status < 300 and result.get("code") == 0, f"{label}: HTTP {status}，code={result.get('code')}"
    else:
        assert (status == expected and result.get("code") != 0) or (
            status == 200 and result.get("code") == expected
        ), f"{label}: 应拒绝为 {expected}，实际 HTTP {status}，code={result.get('code')}"
    print(f"通过：{label}")
    return result


if __name__ == "__main__":
    base_url = required("MATERIAL_TEST_URL").rstrip("/")
    assert urlsplit(base_url).scheme in ("http", "https"), "地址须包含 http:// 或 https://"
    assert required("MATERIAL_TEST_ALLOW_WRITE") == "yes", "仅对允许写入的隔离测试实例运行"
    reader = required("MATERIAL_READER_AUTHORIZATION")
    writer = required("MATERIAL_WRITER_AUTHORIZATION")
    denied = required("MATERIAL_DENIED_AUTHORIZATION")
    opener = build_opener(NoRedirect())
    code = "TEST-" + uuid.uuid4().hex[:12]
    payload = {"code": code, "name": "权限测试物料"}
    expect("未登录不能查询", request("GET"), 401)
    expect("未授权账号不能查询", request("GET", denied), 403)
    expect("只读账号可以查询", request("GET", reader), 0)
    expect("只读账号不能登记", request("POST", reader, payload), 403)
    created = expect("登记账号可以登记", request("POST", writer, payload), 0)
    assert created.get("data", {}).get("code") == code, "写入结果未返回当前测试物料"
    result = expect("登记后仍可读取列表", request("GET", writer), 0)
    assert isinstance(result.get("data", {}).get("items"), list), "列表未返回 data.items"
    print("请在测试实例中清理物料：" + code)
