import os
from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
import uuid
import bcrypt
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Import Engines and Models
from models import db, User, FarmProfile, SoilRecord, ActiveCrop, Product, Order
from engine.ml_suite import MLSuite
from engine.mandi_api import MandiAPI
from engine.economics import EconomicEngine
from engine.advisory import AdvisoryEngine
from engine.weather_api import WeatherAPI
from engine.soil_api import SoilAPI

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'grow-fasal-secret-key-123')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///grow_fasal.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)

# Initialize Intelligence Engines
ml_suite = MLSuite()
mandi_api = MandiAPI()
economics = EconomicEngine()
advisory = AdvisoryEngine()
weather_api = WeatherAPI()
soil_api = SoilAPI()

# --- ROUTES ---

@app.route('/')
def index():
    # Fetch top 10 records for the homepage preview
    mandi_records = mandi_api.get_market_prices()
    # If API key is missing or fails, mandi_records might be a dict with 'error'
    if isinstance(mandi_records, dict) and 'error' in mandi_records:
        mandi_records = []
    
    # Fallback mock data if API fails to ensure UI looks populated
    if not mandi_records:
        mandi_records = [
            {"state": "Punjab", "mandi": "Amritsar", "commodity": "Wheat", "arrival_date": datetime.today().strftime('%d/%m/%Y'), "min_price": "2100", "max_price": "2300", "modal_price": "2200"},
            {"state": "Maharashtra", "mandi": "Pune", "commodity": "Onion", "arrival_date": datetime.today().strftime('%d/%m/%Y'), "min_price": "1500", "max_price": "1800", "modal_price": "1650"},
            {"state": "Uttar Pradesh", "mandi": "Agra", "commodity": "Potato", "arrival_date": datetime.today().strftime('%d/%m/%Y'), "min_price": "800", "max_price": "1000", "modal_price": "900"},
            {"state": "Karnataka", "mandi": "Hubli", "commodity": "Cotton", "arrival_date": datetime.today().strftime('%d/%m/%Y'), "min_price": "6000", "max_price": "6500", "modal_price": "6200"},
            {"state": "Haryana", "mandi": "Karnal", "commodity": "Rice", "arrival_date": datetime.today().strftime('%d/%m/%Y'), "min_price": "3000", "max_price": "3500", "modal_price": "3200"}
        ]
        if current_user.is_authenticated and current_user.state:
            # Injecting local data for user's state
            mandi_records.insert(0, {"state": current_user.state, "mandi": "Local District Market", "commodity": "Seasonal Vegetables", "arrival_date": datetime.today().strftime('%d/%m/%Y'), "min_price": "1200", "max_price": "1500", "modal_price": "1350"})

    return render_template('index.html', mandi_records=mandi_records[:10])

@app.route('/dashboard')
@login_required
def dashboard():
    if current_user.role == 'FARMER':
        # Simplify the dashboard to just show stats
        db_crops = ActiveCrop.query.filter_by(user_id=current_user.id).all()
        active_count = len(db_crops)
        return render_template('farmer_dashboard.html', active_count=active_count)
    
    # Buyer Dashboard: Show all marketplace products
    products = Product.query.all()
    return render_template('customer_dashboard.html', products=products)

@app.route('/my-crops')
@login_required
def my_crops():
    if current_user.role != 'FARMER':
        return redirect(url_for('dashboard'))
    
    db_crops = ActiveCrop.query.filter_by(user_id=current_user.id).all()
    formatted_crops = []
    for crop in db_crops:
        das = crop.get_das()
        stage_info = advisory.get_stage_advice(crop.crop_name, das)
        
        # New Smart Advisory Integration
        smart_advice = advisory.get_smart_harvest_advice(crop.crop_name, crop.sowing_date, current_user.state, das)
        
        q_grade = advisory.calculate_quality_grade(crop)
        
        # Determine if harvest button should be enabled
        can_harvest = False
        if smart_advice['progress_pct'] >= 90 or smart_advice['alert_type'] is not None:
            can_harvest = True
            
        formatted_crops.append({
            "id": crop.id,
            "crop_name": crop.crop_name,
            "sowing_date": crop.sowing_date.strftime('%Y-%m-%d'),
            "das": das,
            "stage": stage_info,
            "quality": q_grade,
            "progress_pct": smart_advice['progress_pct'],
            "total_days": smart_advice['total_days'],
            "expected_date": smart_advice['expected_date'],
            "alert": smart_advice['alert'],
            "alert_type": smart_advice['alert_type'],
            "can_harvest": can_harvest
        })
    return render_template('my_crops.html', crops=formatted_crops)

@app.route('/mandi-trends')
def mandi_trends():
    # Pass target_commodity to template if the farmer clicked from 'My Crops'
    target_commodity = request.args.get('commodity', '')
    
    mandi_records = mandi_api.get_market_prices()
    if isinstance(mandi_records, dict) and 'error' in mandi_records:
        mandi_records = []
    
    if not mandi_records:
        mandi_records = [
            {"state": "Punjab", "mandi": "Amritsar", "commodity": "Wheat", "arrival_date": datetime.today().strftime('%d/%m/%Y'), "min_price": "2100", "max_price": "2300", "modal_price": "2200"},
            {"state": "Maharashtra", "mandi": "Pune", "commodity": "Onion", "arrival_date": datetime.today().strftime('%d/%m/%Y'), "min_price": "1500", "max_price": "1800", "modal_price": "1650"}
        ]
        if current_user.is_authenticated and current_user.state:
            mandi_records.insert(0, {"state": current_user.state, "mandi": "Local District Market", "commodity": "Seasonal Vegetables", "arrival_date": datetime.today().strftime('%d/%m/%Y'), "min_price": "1200", "max_price": "1500", "modal_price": "1350"})

    return render_template('mandi_trends.html', mandi_records=mandi_records[:20], target_commodity=target_commodity)

@app.route('/api/mandi/nearest', methods=['POST'])
@login_required
def get_nearest_mandi():
    data = request.json
    lat = float(data.get('lat', 0.0))
    lon = float(data.get('lon', 0.0))
    commodity = data.get('commodity', 'Wheat')
    
    nearest = mandi_api.get_nearest_mandis(lat, lon, commodity, limit=3)
    return jsonify({"status": "success", "markets": nearest})

@app.route('/weather')
def weather():
    forecast = weather_api.get_6_month_forecast()
    return render_template('weather.html', forecast=forecast)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        phone = request.form.get('phone')
        password = request.form.get('password')
        user = User.query.filter_by(phone=phone).first()
        
        if user and bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            login_user(user)
            return redirect(url_for('dashboard'))
        
        flash("Invalid credentials for system access.")
        return render_template('login.html', error="Invalid credentials")
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        phone = request.form.get('phone')
        password = request.form.get('password')
        name = request.form.get('name')
        role = request.form.get('role', 'FARMER')
        state = request.form.get('state')
        district = request.form.get('district')
        village = request.form.get('village')
        
        if User.query.filter_by(phone=phone).first():
            return render_template('register.html', error="System ID Already Registered")
        
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        new_user = User(
            id=str(uuid.uuid4()),
            phone=phone,
            password=hashed,
            name=name,
            role=role,
            state=state,
            district=district,
            village=village
        )
        db.session.add(new_user)
        db.session.commit()
        
        login_user(new_user)
        return redirect(url_for('dashboard'))
        
    return render_template('register.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

# --- API ENDPOINTS ---

@app.route('/api/predict/crops/smart', methods=['POST'])
@login_required
def predict_crops_smart():
    data = request.json
    lat = float(data.get('lat', 20.5937)) # Default Central India
    lon = float(data.get('lon', 78.9629))
    
    # 1. Fetch Precise Soil via ISRIC SoilGrids
    soil_profile = soil_api.get_soil_profile(lat, lon)
    
    # 2. Fetch Average Weather via Open-Meteo
    forecast = weather_api.get_6_month_forecast(lat, lon)
    # Average temp over the upcoming season
    avg_temp = sum(forecast['temperature_c'][:12]) / 12 if len(forecast['temperature_c']) >= 12 else 25.0
    # Average rainfall over upcoming season (first 3 months / 12 weeks accumulated approx)
    avg_rain = sum(forecast['rainfall_mm'][:12]) / 12 * 30 # Rough monthly proxy
    
    # Default Humidity based on rainfall (simple proxy since generic ML datasets expect ~80%)
    hum = 80.0 if avg_rain > 100 else 50.0
    
    # 3. Predict [N, P, K, temperature, humidity, ph, rainfall]
    features = [
        soil_profile['N'], 
        soil_profile['P'], 
        soil_profile['K'], 
        avg_temp, hum, 
        soil_profile['ph'], 
        avg_rain
    ]
    
    recommendations = ml_suite.predict_top_crops(features)
    
    # Get Economics for the top recommendation
    top_crop = recommendations[0]['crop']
    economic_data = economics.get_profitability_analysis(
        current_user.state, top_crop, 22.0, 3800.0 # Hypothetical yield/price
    )
    
    return jsonify({
        "status": "success",
        "recommendations": recommendations,
        "economics": economic_data
    })

@app.route('/api/sow', methods=['POST'])
@login_required
def sow_crop():
    data = request.json
    new_crop = ActiveCrop(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        crop_name=data.get('crop_name'),
        sowing_date=datetime.utcnow(),
        status='GROWING'
    )
    db.session.add(new_crop)
    db.session.commit()
    return jsonify({"status": "success"})

@app.route('/api/harvest/<crop_id>', methods=['POST'])
@login_required
def harvest_crop(crop_id):
    crop = ActiveCrop.query.get(crop_id)
    if not crop:
        return jsonify({"status": "error", "message": "Crop not found"}), 404
        
    # Calculate Quality Grade
    grade = advisory.calculate_quality_grade(crop)
    
    # Create Market Product
    new_product = Product(
        id=str(uuid.uuid4()),
        farmer_id=current_user.id,
        name=crop.crop_name,
        price_per_kg=22.0, # Placeholder
        quantity_available=1000.0, # Placeholder
        quality_grade=grade,
        created_at=datetime.utcnow()
    )
    
    db.session.add(new_product)
    db.session.delete(crop) # Move from active to products
    db.session.commit()
    
    return jsonify({"status": "success", "grade": grade})

@app.route('/api/mandi/forecast', methods=['GET'])
@login_required
def mandi_forecast():
    commodity = request.args.get('commodity', 'Wheat')
    # Fetch historical simulation around Mandi price
    trend = mandi_api.get_price_series(current_user.state, commodity)
    return jsonify({"trend": trend})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Seed initial data for testing
        if not User.query.filter_by(phone='0000').first():
            hashed = bcrypt.hashpw('admin'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            admin = User(id='test-farmer-id', phone='0000', password=hashed, name='Demo Farmer', role='FARMER', state='Punjab')
            db.session.add(admin)
            # Add an active crop for demo
            db.session.add(ActiveCrop(id='test-crop-id', user_id='test-farmer-id', crop_name='Rice', 
                                    sowing_date=datetime.utcnow(), status='GROWING'))
            db.session.commit()

    app.run(debug=True, port=5000)
