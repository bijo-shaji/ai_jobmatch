import json
import re
import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

MODEL_NAME = "gemini-3.6-flash"


def get_genai_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured in environment.")
    return genai.Client(api_key=api_key)


def clean_json_response(text):
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\n?", "", text, flags=re.IGNORECASE)
        text = re.sub(r"\n?```$", "", text)
        text = text.strip()
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1:
        text = text[start : end + 1]
    return text


def analyze_resume(resume_text):
    prompt = f"""
You are an expert technical recruiter and resume analyst.

Analyze the following resume carefully.

Return ONLY valid JSON with exactly these fields:

{{
    "summary": "A concise professional summary of the candidate.",
    "skills": [],
    "strengths": [],
    "missing_skills": [],
    "experience_level": "",
    "education": [],
    "suggestions": []
}}

Rules:
- skills must contain technical and professional skills found in the resume.
- strengths must contain the candidate's strongest areas.
- missing_skills should contain useful skills the candidate could learn based on the resume.
- experience_level should be one of:
  "Fresher", "Junior", "Mid-Level", "Senior"
- education should contain the important educational qualifications.
- suggestions should contain practical resume/career improvement suggestions.
- Do not invent information that is not reasonably supported by the resume.
- Return valid JSON only.
- Do not use Markdown code fences.

Resume:

{resume_text}
"""

    client = get_genai_client()
    
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
    except Exception:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )

    cleaned_text = clean_json_response(response.text)

    try:
        return json.loads(cleaned_text)
    except json.JSONDecodeError as exc:
        raise ValueError(
            "Gemini returned an invalid JSON response."
        ) from exc


def get_or_create_resume_analysis(resume, user):
    from ai_analysis.models import ResumeAnalysis
    from ai_analysis.services.resume_parser import extract_resume_text

    try:
        return ResumeAnalysis.objects.get(resume=resume, user=user)
    except ResumeAnalysis.DoesNotExist:
        resume_text = extract_resume_text(resume.file.path)
        if not resume_text.strip():
            raise ValueError("Could not extract text from the resume file.")

        analysis_data = analyze_resume(resume_text)

        analysis, _ = ResumeAnalysis.objects.update_or_create(
            resume=resume,
            defaults={
                "user": user,
                "summary": analysis_data.get("summary", ""),
                "skills": analysis_data.get("skills", []),
                "strengths": analysis_data.get("strengths", []),
                "missing_skills": analysis_data.get("missing_skills", []),
                "experience_level": analysis_data.get("experience_level", ""),
                "education": analysis_data.get("education", []),
                "suggestions": analysis_data.get("suggestions", []),
            },
        )
        return analysis
