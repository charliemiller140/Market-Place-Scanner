# =================================================================
# AWS LAMBDA FUNCTION - Image Quality Analyzer Backend
# File: lambda_function.py
# =================================================================

# --- Step 1: Import Necessary Libraries ---
# 'json' is for working with JSON data.
# 'base64' is crucial for decoding the image sent from the frontend.
# 'io' allows us to treat the image data as a file in memory.
# 'PIL' (Pillow) is the powerful library we'll use for image analysis.

import json
import base64
import io
from PIL import Image

# --- Step 2: The Main Lambda Handler ---
# This is the function that AWS Lambda will run every time our API is called.
# The 'event' object contains all the request data, including the image.

def lambda_handler(event, context):
    
    # --- Step 3: Set Up CORS Headers ---
    # This is critical. These headers tell the browser that it's safe for our
    # React frontend (running on a different domain) to access this API.
    # Without this, the browser will block the request.
    
    headers = {
        "Access-Control-Allow-Origin": "*",  # Allows any domain to access
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS" # Allows POST and OPTIONS requests
    }

    # --- Step 4: Extract the Image Data from the Request ---
    # The image comes from the frontend as a base64 encoded string inside the event body.
    # We first parse the JSON body to get the string.
    
    try:
        body = json.loads(event['body'])
        image_b64_string = body['image']
    except Exception as e:
        # If the image is missing or the body is not valid JSON, return an error.
        return {
            "statusCode": 400,
            "headers": headers,
            "body": json.dumps({"error": f"Invalid request body: {str(e)}"})
        }

    # --- Step 5: Decode the Base64 Image ---
    # We must decode the base64 string back into binary data that Pillow can understand.
    
    try:
        image_data = base64.b64decode(image_b64_string)
        # We then open the binary data as an in-memory file.
        image_file = io.BytesIO(image_data)
        img = Image.open(image_file)
    except Exception as e:
        # If the data is not a valid image, return an error.
        return {
            "statusCode": 400,
            "headers": headers,
            "body": json.dumps({"error": f"Failed to decode or open image: {str(e)}"})
        }

    # --- Step 6: Perform Basic Image Analysis ---
    # Now we can use the Pillow 'img' object to get the data we need.
    
    width, height = img.size
    image_format = img.format

    # --- Step 7: Build the JSON Response ---
    # We create a dictionary that will be converted to JSON. This is the
    # "report card" for the basic (mock) analysis.
    
    report = {
      "overallScore": 78,
      "summary": "This is a basic analysis from your AWS backend. It checks for common issues like resolution and aspect ratio. The AI-powered report is handled separately by the frontend.",
      "report": [
        { "criteria": "Resolution Check (Backend)", "score": 8 if width >= 1000 else 4, "explanation": f"Image resolution is {width}px by {height}px." },
        { "criteria": "File Format (Backend)", "score": 9, "explanation": f"Image format is {image_format}." }
      ],
      "isMock": True # We set this to true to match the frontend's expectation for a basic scan
    }

    # --- Step 8: Send the Successful Response ---
    # We return a 200 OK status code, the CORS headers, and our JSON report.
    # The frontend will receive this and display it to the user.
    
    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps(report)
    }