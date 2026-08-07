# Developer Guidelines

## Project Overview

This repository contains the core logic for the Logistics Intelligence System. The main stack relies on Python, XGBoost for risk prediction, Folium for map rendering, and the TomTom API for routing.

## Development Rules

* **Specs:** Try to stick to the BMAD-METHOD framework when adding new features.

* **Agent Safety:** The custom AI agents (like the CLI evaluator) should remain read-only. Do not give them permissions to execute file-altering or destructive system commands.

* **Testing:** All new Python code needs a corresponding Pytest unit test.

* **Pipeline:** Run `pytest` locally before pushing. Let's keep the GitHub Actions CI/CD pipeline green.