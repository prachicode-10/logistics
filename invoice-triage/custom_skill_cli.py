import argparse
from logistics_engine import TomTomDataIngestor, XGBoostRiskPredictor, RouteVisualizer

def main():
    parser = argparse.ArgumentParser(description='Logistics Engine CLI')
    parser.add_argument('--start', type=float, nargs=2, help='Start coordinates (latitude, longitude)')
    parser.add_argument('--end', type=float, nargs=2, help='End coordinates (latitude, longitude)')
    args = parser.parse_args()

    if args.start and args.end:
        start_coords = (args.start[0], args.start[1])
        end_coords = (args.end[0], args.end[1])
        ingestor = TomTomDataIngestor()
        result = ingestor.ingest_data(start_coords, end_coords)
        if result:
            print("API Connection Successful!")
            print(f"Travel Time: {result['travelTimeInSeconds']} seconds")
            print(f"Route Length: {result['lengthInMeters']} meters")
            risk_level = XGBoostRiskPredictor().predict_risk(result)
            print(f"Risk Level: {risk_level}")
            route_points = result['points']
            RouteVisualizer().visualize_route(route_points, start_coords, end_coords, risk_level, "route_map.html")
        else:
            print("API Connection Failed. Check your connection and API key.")
    else:
        parser.print_help()

if __name__ == "__main__":
    main()