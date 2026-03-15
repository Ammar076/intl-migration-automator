import os
import requests
import json
from dotenv import load_dotenv
from google import genai
from google.oauth2 import service_account
from google.genai import types
from tools.visa_tool import check_visa_requirements
from tools.currency_tool import get_exchange_rate

load_dotenv()


def get_vertex_client():
    key_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "migration-key.json")
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
    location = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")

    if os.path.exists(key_path):
        creds = service_account.Credentials.from_service_account_file(
            key_path, scopes=["https://www.googleapis.com/auth/cloud-platform"]
        )
        return genai.Client(
            vertexai=True,
            project=project_id,
            location=location,
            credentials=creds,
        )
    else:
        return genai.Client(vertexai=True, project=project_id, location=location)


client = get_vertex_client()


def run_visa_agent(nationality: str, destination_country: str):
    """Worker 1: Handles strict immigration rules."""
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"Check visa requirements for a citizen of {nationality} traveling to {destination_country}.",
        config=types.GenerateContentConfig(
            system_instruction="""You are a strict data parser. You have a tool to check visa rules. 
            CRITICAL: Internally convert the user's nationality and destination into 2-letter ISO Alpha-2 codes BEFORE calling the tool.
            Output ONLY factual bullet points covering:
            - Visa requirement status
            - Passport validity rules
            - Embassy URL (if available)
            Do not use conversational filler or greetings.""",
            tools=[check_visa_requirements],
            automatic_function_calling=types.AutomaticFunctionCallingConfig(
                disable=False
            ),
            temperature=0.1,
        ),
    )
    return response.text


def run_finance_agent(base_currency: str, target_currency: str, amount: float):
    """Worker 2: Handles exchange rates."""
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"Convert {amount} {base_currency} to {target_currency}.",
        config=types.GenerateContentConfig(
            system_instruction="""You are a strict financial calculator. Use your tool to get the exchange rate.
            Output ONLY factual bullet points covering:
            - The exact exchange rate
            - The final converted amount
            Do not use conversational filler or greetings.""",
            tools=[get_exchange_rate],
            automatic_function_calling=types.AutomaticFunctionCallingConfig(
                disable=False
            ),
            temperature=0.1,
        ),
    )
    return response.text


def run_housing_agent(destination_city: str, user_context: str):
    """Worker 3: Uses Google Search to find current rental costs."""
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"What is the average monthly rent for {user_context} moving to {destination_city} right now?",
        config=types.GenerateContentConfig(
            system_instruction="""You are a strict real estate data scraper. Use Google Search to find the most up-to-date average rental prices tailored strictly to the user's provided living situation.
            Output ONLY factual bullet points covering:
            - Estimated monthly rent range
            - Common utility costs
            - Neighborhood recommendations (if applicable)
            Do not use conversational filler or greetings.""",
            tools=[{"google_search": {}}],
            automatic_function_calling=types.AutomaticFunctionCallingConfig(
                disable=False
            ),
            temperature=0.1,
        ),
    )
    return response.text


def run_climate_agent(destination_city: str):
    """Worker 4: Uses Google Search to find seasonal weather."""
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"What is the year-round climate and current weather season like in {destination_city}?",
        config=types.GenerateContentConfig(
            system_instruction="""You are a strict meteorological data analyzer. Use Google Search to determine the year-round weather and current season. 
            Output ONLY factual bullet points covering: 
            - Average temperature ranges 
            - Humidity levels and precipitation
            - Recommended clothing
            Do not use conversational filler or greetings.""",
            tools=[{"google_search": {}}],
            automatic_function_calling=types.AutomaticFunctionCallingConfig(
                disable=False
            ),
            temperature=0.1,
        ),
    )
    return response.text
