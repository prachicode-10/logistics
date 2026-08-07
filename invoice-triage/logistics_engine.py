import os
import pandas as pd
import xgboost as xgb
import numpy as np
import folium
import requests

class TomTomDataIngestor:
    def __init__(self):
        self.api_key = os.environ.get('TOMTOM_API_KEY', 'WH3hDCw1zwxiMoCDLCi0x8Epj3P79IpE')

    def ingest_data(self, start_coords, end_coords):
        try:
            url = f"https://api.tomtom.com/routing/1/calculateRoute/{start_coords[0]},{start_coords[1]}:{end_coords[0]},{end_coords[1]}/json?key={self.api_key}"
            response = requests.get(url)
            response.raise_for_status()
            json_response = response.json()
            
            travel_time = json_response['routes'][0]['summary']['travelTimeInSeconds']
            length = json_response['routes'][0]['summary']['lengthInMeters']
            
            points_list = [(point['latitude'], point['longitude']) for point in json_response['routes'][0]['legs'][0]['points']]
            
            return {'travelTimeInSeconds': travel_time, 'lengthInMeters': length, 'points': points_list}
        except requests.exceptions.RequestException as e:
            print(f"TomTom API Error: {e}")
            return None

class XGBoostRiskPredictor:
    def __init__(self):
        self.model = xgb.XGBClassifier(eval_metric='mlogloss')
        self._train_dummy_model()

    def _train_dummy_model(self):
        np.random.seed(42)
        lengths = np.random.randint(5000, 20000, 100)
        times = lengths / np.random.uniform(5, 15, 100)
        weather = np.random.randint(1, 4, 100)
        
        # 0: Low Risk, 1: Medium Risk, 2: High Risk
        risk_labels = np.random.choice([0, 1, 2], size=100)

        df = pd.DataFrame({
            'lengthInMeters': lengths,
            'travelTimeInSeconds': times,
            'weatherFactor': weather,
            'risk_label': risk_labels
        })

        X = df[['lengthInMeters', 'travelTimeInSeconds', 'weatherFactor']]
        y = df['risk_label']
        
        self.model.fit(X, y)

    def predict_risk(self, route_data, weather_factor=1):
        if not route_data:
            return "Unknown Risk"

        input_df = pd.DataFrame([{
            'lengthInMeters': route_data['lengthInMeters'],
            'travelTimeInSeconds': route_data['travelTimeInSeconds'],
            'weatherFactor': weather_factor
        }])

        prediction = self.model.predict(input_df)[0]
        risk_mapping = {0: 'Low Risk', 1: 'Medium Risk', 2: 'High Risk'}
        return risk_mapping.get(prediction, 'Unknown Risk')

class RouteVisualizer:
    def visualize_route(self, route_points, start_coords, end_coords, risk_level, output_file="route_map.html"):
        color_map = {'Low Risk': 'green', 'Medium Risk': 'orange', 'High Risk': 'red'}
        route_color = color_map.get(risk_level, 'gray')
        
        m = folium.Map(location=start_coords, zoom_start=12)
        folium.PolyLine(route_points, color=route_color, weight=5, opacity=0.8).add_to(m)
        folium.Marker(start_coords, icon=folium.Icon(color='green', icon='play')).add_to(m)
        folium.Marker(end_coords, icon=folium.Icon(color='red', icon='stop')).add_to(m)
        
        m.save(output_file)
        print(f"Map generated: {output_file}")

if __name__ == "__main__":
    ingestor = TomTomDataIngestor()
    predictor = XGBoostRiskPredictor()
    visualizer = RouteVisualizer()
    
    start = (20.3533, 85.8266)
    end = (20.2666, 85.8436)
    
    print("Fetching route data...")
    result = ingestor.ingest_data(start, end)
    
    if result:
        print(f"Travel Time: {result['travelTimeInSeconds']}s | Distance: {result['lengthInMeters']}m")
        risk = predictor.predict_risk(result)
        print(f"Predicted Route Risk: {risk}")
        
        visualizer.visualize_route(result['points'], start, end, risk)
    else:
        print("Failed to build route. Check network or TomTom limits.")