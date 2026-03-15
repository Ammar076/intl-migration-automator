import os
import json
import asyncio
from functools import wraps
from google import genai
from google.genai import types
from dotenv import load_dotenv

from agents.worker_agents import (
    client,
    run_visa_agent,
    run_finance_agent,
    run_housing_agent,
    run_climate_agent,
)

load_dotenv()

current_agent_status = "Supervisor: Initializing..."


@wraps(run_visa_agent)
def run_visa_agent_log(*args, **kwargs):
    global current_agent_status
    current_agent_status = "Visa Agent: Researching immigration and permit laws..."
    return run_visa_agent(*args, **kwargs)


@wraps(run_finance_agent)
def run_finance_agent_log(*args, **kwargs):
    global current_agent_status
    current_agent_status = (
        "Finance Agent: Fetching live exchange rates and cost of living..."
    )
    return run_finance_agent(*args, **kwargs)


@wraps(run_housing_agent)
def run_housing_agent_log(*args, **kwargs):
    global current_agent_status
    current_agent_status = "Housing Agent: Scouring current rental market data..."
    return run_housing_agent(*args, **kwargs)


@wraps(run_climate_agent)
def run_climate_agent_log(*args, **kwargs):
    global current_agent_status
    current_agent_status = "Climate Agent: Checking seasonal trends and packing tips..."
    return run_climate_agent(*args, **kwargs)


def run_climate_agent_log(prompt: str) -> str:
    """
    Use this tool to check seasonal weather trends and get climate information for the destination.
    """
    global current_agent_status
    current_agent_status = "Climate Agent: Checking seasonal trends and packing tips..."
    return run_climate_agent(prompt)


def process_relocation_request(user_prompt: str) -> str:
    """
    Orchestrates the migration swarm using Gemini 2.5 Pro.
    Automatic function calling is enabled to allow the Supervisor
    to trigger workers and synthesize their outputs automatically.
    """
    system_instruction = """You are the Lead Operations Manager for the International Migration Automator.
        Your goal is to provide a comprehensive relocation plan by delegating tasks to your specialized worker agents.

        OUTPUT RULES:
        1. DO NOT write an email, letter, or introduction (No "Dear User", no "Best Regards").
        2. DO NOT use conversational filler ("I have analyzed your request...").
        3. START directly with the # Relocation Blueprint title.
        4. USE professional Markdown headers, tables, and bullet points.
        5. SYNTHESIZE all agent data into one cohesive document.
        """

    tools = [
        run_visa_agent_log,
        run_finance_agent_log,
        run_housing_agent_log,
        run_climate_agent_log,
    ]

    try:
        response = client.models.generate_content(
            model="gemini-2.5-pro",
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                tools=tools,
                automatic_function_calling=types.AutomaticFunctionCallingConfig(
                    disable=False
                ),
                temperature=0.3,
            ),
        )

        return response.text

    except Exception as e:
        return f"Error in Supervisor Orchestration: {str(e)}"


async def process_relocation_stream(user_prompt: str):
    global current_agent_status
    current_agent_status = "Supervisor: Analyzing relocation intent..."

    loop = asyncio.get_event_loop()
    task = loop.run_in_executor(None, process_relocation_request, user_prompt)

    last_status = ""

    while not task.done():
        if current_agent_status != last_status:
            yield {"status": current_agent_status, "type": "info"}
            last_status = current_agent_status
        await asyncio.sleep(0.5)

    final_report = await task
    yield {
        "status": "Supervisor: Synthesis complete. Generating report.",
        "type": "success",
    }
    yield {"report": final_report}


if __name__ == "__main__":

    async def run_test():
        print("--- Starting LIVE Relocation Swarm Test ---")
        sample_query = (
            "I am a software engineer from Indonesia moving to Kuala Lumpur, Malaysia. "
            "I'm moving with my wife and child. My monthly budget is 20,000,000 IDR. "
            "Check visa requirements, housing for a family, and the weather."
        )

        async for update in process_relocation_stream(sample_query):
            if "status" in update:
                print(f"[LIVE FEED] {update['status']}")
            elif "report" in update:
                print("\n" + "=" * 50)
                print("FINAL REPORT GENERATED:")
                print("=" * 50 + "\n")
                print(update["report"])

    asyncio.run(run_test())
