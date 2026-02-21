import os
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

class ReceiptData(BaseModel):
    amount: float = Field(description="The total transaction amount on the receipt.")
    merchant: str = Field(description="The name of the business or recipient.")
    date: str = Field(description="The date of the transaction (e.g., YYYY-MM-DD), if present.")

def extract_receipt_info(image_path: str) -> ReceiptData:
    """
    Uses Gemini API to extract amount, merchant, and date from a receipt image.
    Requires GEMINI_API_KEY environment variable.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        print("Warning: GEMINI_API_KEY not set. Using mock extraction data for testing.")
        return ReceiptData(amount=15.50, merchant="Alice's Restaurant", date="2026-02-21")
        
    client = genai.Client(api_key=api_key)
    
    # Read the image file
    # We pass the raw bytes or use the File API if it's large, 
    # but for simple receipts raw bytes should be fine.
    # Actually, we can just pass the path using types.Part.from_uri or pass the loaded bytes.
    with open(image_path, "rb") as f:
        image_bytes = f.read()

    # Create the part
    image_part = types.Part.from_bytes(
        data=image_bytes,
        mime_type="image/jpeg" # assuming jpeg, but will handle dynamically if possible or trust gemini
    )
    
    prompt = "Analyze this receipt. Extract the total transaction amount, the merchant/recipient name, and the date."
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=[image_part, prompt],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ReceiptData,
        ),
    )
    
    # The response is validated against the model and returned as a JSON string matching the schema.
    # We can parse it directly into our Pydantic model.
    import json
    parsed_data = json.loads(response.text)
    return ReceiptData(**parsed_data)
