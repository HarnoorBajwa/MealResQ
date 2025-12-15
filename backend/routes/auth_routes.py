from flask import Blueprint, request, jsonify
from firebase_admin import auth, firestore
from config.firebase_config import db

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    name = data.get('name')
    address = data.get('address')

    if not all([email, password, role, name]):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        # Create user in Firebase Authentication
        user = auth.create_user(email=email, password=password)
        
        # Add user details to Firestore
        user_data = {'uid': user.uid, 'email': email, 'role': role, 'name': name, 'address': address}
        db.collection('users').document(user.uid).set(user_data)
        
        # Add role-specific data
        if role == 'restaurant':
            db.collection('restaurants').document(user.uid).set({'name': name, 'address': address})
        elif role == 'foodbank':
            db.collection('foodbanks').document(user.uid).set({'name': name, 'address': address})
        elif role == 'driver':
             db.collection('drivers').document(user.uid).set({'name': name, 'availability': 'available'})

        return jsonify({'message': 'User registered successfully', 'uid': user.uid}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@auth_bp.route('/login', methods=['POST'])
def login():
    # Note: Firebase handles login client-side with its SDKs. 
    # This endpoint is a placeholder for custom token generation if needed.
    # For a real app, you'd verify a token from the client.
    
    data = request.get_json()
    email = data.get('email')
    
    try:
        user = auth.get_user_by_email(email)
        custom_token = auth.create_custom_token(user.uid)
        return jsonify({'token': custom_token.decode('utf-8')})
    except Exception as e:
        return jsonify({'error': 'Invalid credentials or user not found'}), 401

