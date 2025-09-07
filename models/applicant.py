from src.models.user import db

class Applicant(db.Model):
    __tablename__ = "applicants"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255))
    email = db.Column(db.String(255))
    location = db.Column(db.String(100))
    preferred_location = db.Column(db.String(100))
    experience_level = db.Column(db.String(100))
    designation = db.Column(db.String(255))
    qualification = db.Column(db.String(255))
    preferred_job_domain = db.Column(db.String(255))
    skills = db.Column(db.Text)
    specialist_skill = db.Column(db.String(255))
    years_of_experience = db.Column(db.Integer)
    expected_salary = db.Column(db.BigInteger)
    availability = db.Column(db.String(100))
    preferred_shift = db.Column(db.String(100))
    job_type = db.Column(db.String(100))
    source = db.Column(db.String(100))
    contacted = db.Column(db.String(50))
    skills_count = db.Column(db.Integer)
    salary_package = db.Column(db.String(100))
