import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))
from dotenv import load_dotenv
from google import genai
load_dotenv()
api_key=os.getenv('GEMINI_API_KEY')
if not api_key:
    print("GEMINI_API_KEY not found in .env")
    exit(1)
client=genai.Client(api_key=api_key)
try:
    response=client.models.generate_content(
        model='gemini-3-flash-preview',
        contents="Respond with: {'status': 'ready', 'model': 'gemini-3-flash-preview'}"
    )

    print(f"Gemini Response:\n{response.text}\n")
except Exception as e:
    print(f"Error: {e}\n")
    exit(1)