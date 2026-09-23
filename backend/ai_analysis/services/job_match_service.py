import json

from google.genai import types
from .ai_service import get_genai_client, clean_json_response, MODEL_NAME


def match_resume_with_job(
    resume_analysis,
    job_description,
):
    prompt = f"""
You are an expert technical recruiter.

Compare the candidate's resume analysis with the job description.

Return ONLY valid JSON with exactly these fields:

{{
    "match_score": 0,
    "matched_skills": [],
    "missing_skills": [],
    "recommendation": ""
}}

Rules:

- match_score must be a number between 0 and 100.
- matched_skills should contain skills present in both the candidate profile and job requirements.
- missing_skills should contain important job requirements that are missing from the candidate profile.
- recommendation should give a concise hiring-oriented assessment.
- Consider technical skills, experience level, and relevant qualifications.
- Do not invent skills that are not present in the candidate data.
- Return valid JSON only.
- Do not use Markdown code fences.

Candidate Resume Analysis:

Summary:
{resume_analysis.summary}

Skills:
{resume_analysis.skills}

Strengths:
{resume_analysis.strengths}

Experience Level:
{resume_analysis.experience_level}

Education:
{resume_analysis.education}

Job Description:

{job_description}
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