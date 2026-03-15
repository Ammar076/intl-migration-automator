import requests
import json


def get_exchange_rate(base_currency: str, target_currency: str, amount: float) -> str:
    """
    Fetches real-time currency exchange rates.
    Useful for expats needing to calculate living costs in their new country.
    """
    try:
        url = f"https://api.exchangerate-api.com/v4/latest/{base_currency.upper()}"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()

        target = target_currency.upper()
        if target not in data["rates"]:
            return json.dumps(
                {"error": f"Currency {target} not found.", "status": "failed"}
            )

        rate = data["rates"][target]
        converted_amount = amount * rate

        return json.dumps(
            {
                "base_currency": base_currency.upper(),
                "target_currency": target,
                "exchange_rate": rate,
                "original_amount": amount,
                "converted_amount": round(converted_amount, 2),
                "status": "success",
                "source": "live_api",
            }
        )

    except Exception as e:
        return json.dumps({"error": str(e), "status": "failed", "source": "fallback"})


# Local test
if __name__ == "__main__":
    print(get_exchange_rate("USD", "MYR", 100))
