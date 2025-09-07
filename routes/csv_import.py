from flask import Blueprint, request, jsonify
import pandas as pd
import io
from flask_cors import cross_origin
from src.models.user import db
from src.models.applicant import Applicant

csv_import_bp = Blueprint('csv_import', __name__)

# ---------------- Upload CSV & Save to DB ----------------
@csv_import_bp.route('/upload-csv', methods=['POST'])
@cross_origin()
def upload_csv():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not file.filename.lower().endswith(('.csv', '.xlsx', '.xls')):
            return jsonify({'error': 'Invalid file format. Please upload CSV or Excel files only.'}), 400
        
        if file.filename.lower().endswith('.csv'):
            df = pd.read_csv(io.StringIO(file.read().decode('utf-8')))
        else:
            df = pd.read_excel(io.BytesIO(file.read()))
        
        # ✅ Save each row to DB
        for _, row in df.iterrows():
            applicant = Applicant(
                name=row.get("Name"),
                email=row.get("Email"),
                location=row.get("Location"),
                preferred_location=row.get("Preferred Location"),
                experience_level=row.get("Experience Level"),
                designation=row.get("Designation"),
                qualification=row.get("Qualification"),
                preferred_job_domain=row.get("Preferred Job Domain"),
                skills=row.get("Skills"),
                specialist_skill=row.get("Specialist Skill"),
                years_of_experience=row.get("Years of Experience"),
                expected_salary=row.get("Expected Salary"),
                availability=row.get("Availability"),
                preferred_shift=row.get("Preferred Shift"),
                job_type=row.get("Job Type"),
                source=row.get("Source"),
                contacted=row.get("Contacted"),
                skills_count=row.get("Skills Count"),
                salary_package=row.get("Salary Package")
            )
            db.session.add(applicant)
        db.session.commit()

        # ✅ Get all saved data with IDs
        applicants = Applicant.query.all()
        data = [{
            "id": a.id,
            "Name": a.name,
            "Email": a.email,
            "Location": a.location,
            "Preferred Location": a.preferred_location,
            "Experience Level": a.experience_level,
            "Designation": a.designation,
            "Qualification": a.qualification,
            "Preferred Job Domain": a.preferred_job_domain,
            "Skills": a.skills,
            "Specialist Skill": a.specialist_skill,
            "Years of Experience": a.years_of_experience,
            "Expected Salary": a.expected_salary,
            "Availability": a.availability,
            "Preferred Shift": a.preferred_shift,
            "Job Type": a.job_type,
            "Source": a.source,
            "Contacted": a.contacted,
            "Skills Count": a.skills_count,
            "Salary Package": a.salary_package
        } for a in applicants]

        columns = [
            "Name", "Email", "Location", "Preferred Location", "Experience Level", "Designation",
            "Qualification", "Preferred Job Domain", "Skills", "Specialist Skill", "Years of Experience",
            "Expected Salary", "Availability", "Preferred Shift", "Job Type", "Source",
            "Contacted", "Skills Count", "Salary Package"
        ]

        return jsonify({
            'success': True,
            'message': 'File uploaded and data saved!',
            'data': data,
            'columns': columns,
            'total_rows': len(data)
        })

    except Exception as e:
        return jsonify({'error': f'Error processing file: {str(e)}'}), 500


# ---------------- Get Data from DB ----------------
@csv_import_bp.route('/get-data', methods=['GET'])
@cross_origin()
def get_data():
    try:
        applicants = Applicant.query.all()
        data = [{
            "id": a.id,
            "Name": a.name,
            "Email": a.email,
            "Location": a.location,
            "Preferred Location": a.preferred_location,
            "Experience Level": a.experience_level,
            "Designation": a.designation,
            "Qualification": a.qualification,
            "Preferred Job Domain": a.preferred_job_domain,
            "Skills": a.skills,
            "Specialist Skill": a.specialist_skill,
            "Years of Experience": a.years_of_experience,
            "Expected Salary": a.expected_salary,
            "Availability": a.availability,
            "Preferred Shift": a.preferred_shift,
            "Job Type": a.job_type,
            "Source": a.source,
            "Contacted": a.contacted,
            "Skills Count": a.skills_count,
            "Salary Package": a.salary_package
        } for a in applicants]

        return jsonify({
            "success": True,
            "data": data,
            "columns": [
                "Name", "Email", "Location", "Preferred Location", "Experience Level", "Designation",
                "Qualification", "Preferred Job Domain", "Skills", "Specialist Skill", "Years of Experience",
                "Expected Salary", "Availability", "Preferred Shift", "Job Type", "Source",
                "Contacted", "Skills Count", "Salary Package"
            ]
        })
    except Exception as e:
        return jsonify({'error': f'Error fetching data: {str(e)}'}), 500


# ---------------- Sort Data ----------------
@csv_import_bp.route('/sort-data', methods=['POST'])
@cross_origin()
def sort_data():
    try:
        request_data = request.get_json()
        data = request_data.get('data', [])
        sort_column = request_data.get('sort_column')
        sort_order = request_data.get('sort_order', 'asc')  # 'asc' or 'desc'
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        if not sort_column:
            return jsonify({'error': 'No sort column specified'}), 400
        
        df = pd.DataFrame(data)
        
        if sort_column not in df.columns:
            return jsonify({'error': f'Column "{sort_column}" not found'}), 400
        
        ascending = sort_order.lower() == 'asc'
        df_sorted = df.sort_values(by=sort_column, ascending=ascending)
        
        sorted_data = df_sorted.to_dict('records')
        
        return jsonify({
            'success': True,
            'data': sorted_data,
            'sorted_by': sort_column,
            'sort_order': sort_order
        })
    
    except Exception as e:
        return jsonify({'error': f'Error sorting data: {str(e)}'}), 500


# ---------------- Filter Data ----------------
@csv_import_bp.route('/filter-data', methods=['POST'])
@cross_origin()
def filter_data():
    try:
        request_data = request.get_json()
        data = request_data.get('data', [])
        filter_column = request_data.get('filter_column')
        filter_value = request_data.get('filter_value')
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        if not filter_column or filter_value is None:
            return jsonify({'error': 'Filter column and value must be specified'}), 400
        
        df = pd.DataFrame(data)
        
        if filter_column not in df.columns:
            return jsonify({'error': f'Column "{filter_column}" not found'}), 400
        
        if isinstance(filter_value, str):
            filtered_df = df[df[filter_column].astype(str).str.contains(filter_value, case=False, na=False)]
        else:
            filtered_df = df[df[filter_column] == filter_value]
        
        filtered_data = filtered_df.to_dict('records')
        
        return jsonify({
            'success': True,
            'data': filtered_data,
            'filtered_by': filter_column,
            'filter_value': filter_value,
            'total_rows': len(filtered_data)
        })
    
    except Exception as e:
        return jsonify({'error': f'Error filtering data: {str(e)}'}), 500


# ---------------- Delete Record ----------------
@csv_import_bp.route('/delete-record/<int:record_id>', methods=['DELETE'])
@cross_origin()
def delete_record(record_id):
    try:
        applicant = Applicant.query.get(record_id)
        if not applicant:
            return jsonify({"success": False, "error": "Record not found"}), 404

        db.session.delete(applicant)
        db.session.commit()
        return jsonify({"success": True, "message": f"Record {record_id} deleted"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ---------------- Update Record ----------------
@csv_import_bp.route('/update-record/<int:record_id>', methods=['PUT'])
@cross_origin()
def update_record(record_id):
    try:
        applicant = Applicant.query.get(record_id)
        if not applicant:
            return jsonify({"success": False, "error": "Record not found"}), 404

        data = request.get_json()

        # ✅ Update only existing fields
        applicant.name = data.get("Name", applicant.name)
        applicant.email = data.get("Email", applicant.email)
        applicant.location = data.get("Location", applicant.location)
        applicant.preferred_location = data.get("Preferred Location", applicant.preferred_location)
        applicant.experience_level = data.get("Experience Level", applicant.experience_level)
        applicant.designation = data.get("Designation", applicant.designation)
        applicant.qualification = data.get("Qualification", applicant.qualification)
        applicant.preferred_job_domain = data.get("Preferred Job Domain", applicant.preferred_job_domain)
        applicant.skills = data.get("Skills", applicant.skills)
        applicant.specialist_skill = data.get("Specialist Skill", applicant.specialist_skill)
        applicant.years_of_experience = data.get("Years of Experience", applicant.years_of_experience)
        applicant.expected_salary = data.get("Expected Salary", applicant.expected_salary)
        applicant.availability = data.get("Availability", applicant.availability)
        applicant.preferred_shift = data.get("Preferred Shift", applicant.preferred_shift)
        applicant.job_type = data.get("Job Type", applicant.job_type)
        applicant.source = data.get("Source", applicant.source)
        applicant.contacted = data.get("Contacted", applicant.contacted)
        applicant.skills_count = data.get("Skills Count", applicant.skills_count)
        applicant.salary_package = data.get("Salary Package", applicant.salary_package)

        db.session.commit()

        return jsonify({"success": True, "message": f"Record {record_id} updated"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
