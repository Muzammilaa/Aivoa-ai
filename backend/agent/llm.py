from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()

def create_groq_client():
    """Create and return a Groq client using the API key from .env"""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in environment variables")
    return Groq(api_key=api_key)

def test_groq_call():
    """Test the Groq connection with a simple prompt to gemma2-9b-it"""
    client = create_groq_client()
    
    response = client.chat.completions.create(
        model="gemma2-9b-it",
        messages=[
            {"role": "user", "content": "Hello! Please respond with a simple greeting to confirm the connection is working."}
        ],
        temperature=0.5,
        max_tokens=100
    )
    
    return response.choices[0].message.content
