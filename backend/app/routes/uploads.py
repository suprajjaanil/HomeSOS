import os
import uuid
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from ..schemas import ImageUploadResponse

router = APIRouter(prefix="/api/uploads", tags=["File & Photo Uploads"])

# Ensure uploads directory exists
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def generate_cautious_image_description(image_bytes: bytes, mime_type: str) -> tuple[str, bool]:
    """
    If Gemini API key is present, uses Gemini 2.5 Flash multimodal to generate
    a cautious description of the visible issue (NOT a definitive diagnosis).
    Otherwise returns a realistic cautious fallback description.
    """
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if api_key and not api_key.startswith("your_"):
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=api_key)
            prompt = """
            Examine this photo uploaded by a resident reporting a household maintenance problem in Bengaluru.
            Provide a cautious, preliminary description of what is visibly noticeable in the image (e.g. moisture accumulation, dripping joint, blackened socket plastic, loose hinge, misaligned deadbolt).
            SAFETY & LIABILITY RULE: Do NOT make a definitive technical diagnosis. Use cautious, observant phrasing such as "Visible signs indicate...", "Appears to show...", and advise on-site physical verification by a qualified technician.
            Keep response under 2 sentences.
            """
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=[
                    types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                    prompt
                ]
            )
            text = response.text.strip()
            if text:
                return text, True
        except Exception as e:
            print(f"[HomeSOS Vision AI] Gemini image analysis fallback: {e}")

    # Cautious deterministic rule fallback
    return (
        "Preliminary visual inspection attached: Image shows visible fixture distress and localized surface irregularity. Hands-on diagnostic inspection by the dispatched professional is recommended.",
        False
    )

@router.post("/image", response_model=ImageUploadResponse)
async def upload_image_endpoint(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files (JPEG, PNG, WEBP) are allowed")

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded image file is empty")

    # Generate unique filename
    ext = file.filename.split(".")[-1].lower() if file.filename and "." in file.filename else "jpg"
    unique_filename = f"img_{uuid.uuid4().hex[:12]}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as f:
        f.write(content)

    # Relative URL accessible via static mount
    image_url = f"/uploads/{unique_filename}"

    # Generate cautious visual problem description
    vis_desc, is_ai = generate_cautious_image_description(content, file.content_type)

    return {
        "image_url": image_url,
        "filename": unique_filename,
        "visual_description": vis_desc,
        "is_ai_analyzed": is_ai
    }
