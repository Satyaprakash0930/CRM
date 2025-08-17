from flask import Blueprint, request, jsonify
import pandas as pd
import io
import json
from flask_cors import cross_origin

csv_import_bp = Blueprint('csv_import', __name__)

@csv_import_bp.route('/upload-csv', methods=['POST'])
@cross_origin()
def upload_csv():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file extension
        if not file.filename.lower().endswith(('.csv', '.xlsx', '.xls')):
            return jsonify({'error': 'Invalid file format. Please upload CSV or Excel files only.'}), 400
        
        # Read the file based on its extension
        if file.filename.lower().endswith('.csv'):
            # Read CSV file
            df = pd.read_csv(io.StringIO(file.read().decode('utf-8')))
        else:
            # Read Excel file
            df = pd.read_excel(io.BytesIO(file.read()))
        
        # Convert DataFrame to JSON
        data = df.to_dict('records')
        columns = df.columns.tolist()
        
        return jsonify({
            'success': True,
            'data': data,
            'columns': columns,
            'total_rows': len(data)
        })
    
    except Exception as e:
        return jsonify({'error': f'Error processing file: {str(e)}'}), 500

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
        
        # Convert to DataFrame for easier sorting
        df = pd.DataFrame(data)
        
        # Check if column exists
        if sort_column not in df.columns:
            return jsonify({'error': f'Column "{sort_column}" not found'}), 400
        
        # Sort the data
        ascending = sort_order.lower() == 'asc'
        df_sorted = df.sort_values(by=sort_column, ascending=ascending)
        
        # Convert back to records
        sorted_data = df_sorted.to_dict('records')
        
        return jsonify({
            'success': True,
            'data': sorted_data,
            'sorted_by': sort_column,
            'sort_order': sort_order
        })
    
    except Exception as e:
        return jsonify({'error': f'Error sorting data: {str(e)}'}), 500

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
        
        # Convert to DataFrame for easier filtering
        df = pd.DataFrame(data)
        
        # Check if column exists
        if filter_column not in df.columns:
            return jsonify({'error': f'Column "{filter_column}" not found'}), 400
        
        # Filter the data (case-insensitive partial match)
        if isinstance(filter_value, str):
            filtered_df = df[df[filter_column].astype(str).str.contains(filter_value, case=False, na=False)]
        else:
            filtered_df = df[df[filter_column] == filter_value]
        
        # Convert back to records
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

