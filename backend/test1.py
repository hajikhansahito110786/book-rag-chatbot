import os
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables from the .env file
load_dotenv()

# The OpenAI client automatically looks for the OPENAI_API_KEY environment variable
# You can also pass it explicitly as client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
client = OpenAI()

# Define a simple function for the agent's task
def run_simple_agent(prompt_content):
    """
    Sends a prompt to the OpenAI API and returns the response.
    """
    print(f"Sending prompt to the agent: '{prompt_content}'")
    
    # Create a chat completion request
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",  # You can choose a different model
        messages=[
            {"role": "system", "content": "You are a helpful assistant that writes concise responses."},
            {"role": "user", "content": prompt_content}
        ],
        max_tokens=150
    )
    
    # Extract and return the agent's response
    return response.choices[0].message.content.strip()

# Example usage
if __name__ == "__main__":
    user_prompt = "Explain the concept of a simple AI agent in one paragraph."
    agent_response = run_simple_agent(user_prompt)
    print("\nAgent Response:")
    print(agent_response)
