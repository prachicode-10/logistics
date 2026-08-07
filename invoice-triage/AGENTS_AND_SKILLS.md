## Custom AI Agents

### Logistics Analyst
This agent takes the raw risk classifications from our XGBoost model and suggests alternative supply chain routes based on current weather and traffic parameters. 

**Example User Query:**
"What is the recommended route for the shipment from [start location] to [end location] considering current weather and traffic conditions?"

## Custom Skills

### CLI Route Evaluator
A terminal-based tool built so human operators (or other scripts) can quickly ping route risks without needing to spin up the Folium UI. It ties directly into the core Logistics Engine.

**Usage:**
Pass the start and end coordinates to `custom_skill_cli.py` to fetch the estimated travel time, total distance, and XGBoost risk level.

**Example:**
```bash
python custom_skill_cli.py --start 20.3533 85.8266 --end 20.2666 85.8436