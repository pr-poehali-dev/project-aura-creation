"""
Создаёт платёж в ЮKassa для доната девушке.
Возвращает ссылку на страницу оплаты.
"""
import json
import os
import uuid
import urllib.request
import urllib.error
import base64


def handler(event: dict, context) -> dict:
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    body = json.loads(event.get("body") or "{}")
    amount = body.get("amount")
    girl_name = body.get("girl_name", "Девушке")
    message = body.get("message", "")
    return_url = body.get("return_url", "https://поехали.dev")

    if not amount or int(amount) < 1:
        return {
            "statusCode": 400,
            "headers": cors_headers,
            "body": json.dumps({"error": "Укажите сумму доната"}),
        }

    shop_id = os.environ.get("YUKASSA_SHOP_ID")
    secret_key = os.environ.get("YUKASSA_SECRET_KEY")

    if not shop_id or not secret_key:
        return {
            "statusCode": 500,
            "headers": cors_headers,
            "body": json.dumps({"error": "Платёжные ключи не настроены"}),
        }

    idempotency_key = str(uuid.uuid4())
    credentials = base64.b64encode(f"{shop_id}:{secret_key}".encode()).decode()

    description = f"Донат для {girl_name}"
    if message:
        description += f": {message[:100]}"

    payload = {
        "amount": {
            "value": f"{int(amount)}.00",
            "currency": "RUB",
        },
        "confirmation": {
            "type": "redirect",
            "return_url": return_url,
        },
        "capture": True,
        "description": description,
        "metadata": {
            "girl_name": girl_name,
            "donor_message": message,
        },
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        "https://api.yookassa.ru/v3/payments",
        data=data,
        headers={
            "Authorization": f"Basic {credentials}",
            "Content-Type": "application/json",
            "Idempotence-Key": idempotency_key,
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        return {
            "statusCode": 502,
            "headers": cors_headers,
            "body": json.dumps({"error": "Ошибка ЮKassa", "details": error_body}),
        }

    confirmation_url = result.get("confirmation", {}).get("confirmation_url")
    payment_id = result.get("id")

    return {
        "statusCode": 200,
        "headers": cors_headers,
        "body": json.dumps({
            "payment_id": payment_id,
            "confirmation_url": confirmation_url,
            "status": result.get("status"),
        }),
    }
