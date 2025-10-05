from flask import Flask, request, jsonify
from flask_cors import CORS
import math
import requests
import csv
import io

compute=Flask(__name__)
CORS(compute)

@compute.route('/api/simulate', methods=['POST'])
def getdata():
  data=request.json
  dia=data['diameter']
  spd=data['speed']
  lat=data['latitude']
  long=data['longitude']
  
  url="https://api.meteomatics.com/2025-10-05T00Z/ocean_depth:km/lat,lon_50,0:10/csv"
  response=requests.get(url)

  water_depth=km
  
  density=3000
  mass=(4/3) * math.pi * (dia/2)**3 * density
  energy=0.5 * mass * spd**2

  craterdia=1000*(energy/4.184e15)**(1/3.4)
  shockrad=craterdia*5
  tsunamiheight=0.1*water_depth
  
  aftercom = {
    'impactCenter': {'lat':lat, 'lon': long},
    'craterLength': craterdia,
    'shockRadius': shockrad,
    'energyMT': energy
  }
  return jsonify(aftercom)

if __name__=='__main__':
  compute.run(debug=True)

