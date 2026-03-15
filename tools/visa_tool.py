import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()


def check_visa_requirements(passport_code: str, destination_code: str) -> str:
    """
    Fetches official visa and entry requirements for relocation.
    WARNING TO AGENT: You MUST pass the 2-letter ISO Alpha-2 country codes
    (e.g., 'ID' for Indonesia, 'MY' for Malaysia) to this function, NOT the full country names.
    """
    api_key = os.getenv("RAPIDAPI_KEY")

    if not api_key:
        return _get_mock_visa(
            destination_code, "RAPIDAPI_KEY missing from environment."
        )

    url = "https://visa-requirement.p.rapidapi.com/v2/visa/check"

    payload = {
        "passport": passport_code.upper(),
        "destination": destination_code.upper(),
    }

    headers = {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": api_key,
        "X-RapidAPI-Host": "visa-requirement.p.rapidapi.com",
    }

    try:
        headers = {
            "Content-Type": "application/json",
            "X-RapidAPI-Host": "visa-requirement.p.rapidapi.com",
            "X-RapidAPI-Key": api_key,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        }

        response = requests.post(url, json=payload, headers=headers, timeout=10)

        if not response.ok:
            print(f"\n--- RAPIDAPI ERROR BODY ---")
            print(response.text)
            print(f"---------------------------\n")

        response.raise_for_status()
        data = response.json()

        dest_info = data.get("data", {}).get("destination", {})
        visa_rules = data.get("data", {}).get("visa_rules", {})

        return json.dumps(
            {
                "destination_country": dest_info.get("name", destination_code),
                "passport_validity_required": dest_info.get(
                    "passport_validity", "Standard 6 months"
                ),
                "embassy_url": dest_info.get("embassy_url", "Not provided"),
                "primary_visa_rule": visa_rules.get("primary_rule", {}),
                "status": "success",
                "source": "live_api",
            }
        )

    except Exception as e:
        print(f"[Warning] Visa API failed: {e}. Triggering fallback.")
        return _get_mock_visa(destination_code, str(e))


def _get_mock_visa(destination_code: str, error_msg: str) -> str:
    """Returns safe fallback data if the API fails to prevent the agent from crashing."""
    return json.dumps(
        {
            "destination_country": destination_code,
            "passport_validity_required": "Typically 6 months beyond intended stay",
            "embassy_url": "Please check your local embassy website",
            "primary_visa_rule": {
                "name": "Standard Entry / Visa Requirements Vary",
                "duration": "Depends on exact nationality",
            },
            "status": "success",
            "source": "mock_fallback",
            "note": f"Using fallback due to: {error_msg}",
        }
    )


if __name__ == "__main__":
    print(check_visa_requirements("ID", "MY"))
