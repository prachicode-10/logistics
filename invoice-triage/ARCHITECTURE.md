# System Architecture

The Logistics Risk & Routing System provides automated route evaluation and delay risk prediction for delivery logistics. It fetches real-time traffic and routing parameters via the TomTom API and passes route metrics through a trained XGBoost model to classify delay probabilities.

When high risk is detected on a primary route, the triage engine queries alternative paths and renders an interactive Folium map color-coding the risk levels and alternate paths.

# Pipeline Architecture

```mermaid
graph LR
    A[TomTom API] -->|Traffic & Route Data| B[XGBoost Model]
    B -->|Risk Classification| C[Triage Engine]
    C -->|Route Coordinates| D[Folium Map Generator]
    D -->|Interactive HTML| E[User / Operator]