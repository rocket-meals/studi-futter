# Google My Map KML Helper

So as we created our map which images of buildings need to be made, we dont want re-enter these information by hand into the backend once. Therefore this small script creates a JSON file from a KML file which can be imported into the backend.

## Usage

1. Create a new map in Google My Maps
2. Export the map as KML file
3. Run the script with the KML file as argument
    ```bash
    python3 parseKmlToJsonBuildings.py <path-to-kml-file> <output-json-file>
    ```
4. Import the generated JSON file into the backend