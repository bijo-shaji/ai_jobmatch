from services.resume_parser import extract_resume_text


file_path = "../media/resumes/bijo_shaji_resume.pdf"
text = extract_resume_text(file_path)

print(text)