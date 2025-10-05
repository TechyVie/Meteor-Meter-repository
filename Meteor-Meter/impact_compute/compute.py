from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import math
import requests
import csv
import io

compute = Flask(__name__)
CORS(compute)

@compute.route('/')
def index():
    # Serve HTML template (ensure you have templates/index.html in your project)
    return render_template('index.html')

@compute.route('/api/simulate', methods=['POST'])
def getdata():
    data = request.json
    dia = float(data.get('diameter', 0))
    spd = float(data.get('speed', 0))
    lat = float(data.get('latitude', 0))
    long = float(data.get('longitude', 0))
    
    # Example Meteomatics API call for ocean depth (replace with actual API and credentials)
    url = f"https://api.meteomatics.com/2025-10-05T00Z/ocean_depth:km/{lat},{long}/csv"
    response = requests.get(url)
    water_depth = 3.5  # Default fallback value (km)
    if response.status_code == 200:
        try:
            f = io.StringIO(response.text)
            reader = csv.reader(f)
            next(reader)  # skip header
            row = next(reader)
            water_depth = float(row[1])
        except Exception:
            pass

    density = 3000  # kg/m^3, typical meteor density
    mass = (4/3) * math.pi * (dia/2)**3 * density
    energy = 0.5 * mass * spd**2

    craterdia = 1000 * (energy / 4.184e15) ** (1 / 3.4)
    shockrad = craterdia * 5
    tsunamiheight = 0.1 * water_depth * 1000  # Convert to meters
    projdis = [craterdia * 2, craterdia * 5]

    result = {
        'impactCenter': {'lat': lat, 'lon': long},
        'craterDiameter': craterdia,
        'shockRadius': shockrad,
        'energyT': energy / 4.184e9,  # Energy in Tons
        'tsunamiHeight': tsunamiheight,
        'projectileDistances': projdis
    }
    return jsonify(result)

if __name__ == '__main__':
    compute.run(debug=True)
