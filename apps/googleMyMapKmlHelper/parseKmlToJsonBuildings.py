import xml.etree.ElementTree as ET
import json
import sys

def parse_kml(file_path):
    tree = ET.parse(file_path)
    root = tree.getroot()
    namespace = {'kml': 'http://www.opengis.net/kml/2.2'}
    
    placemarks = root.findall('.//kml:Placemark', namespace)
    result = []

    for placemark in placemarks:
        alias = placemark.find('kml:name', namespace).text
        coordinates_text = placemark.find('.//kml:coordinates', namespace).text.strip()
        lon, lat, _ = map(float, coordinates_text.split(','))
        
        result.append({
            "alias": alias,
            "coordinates": {
                "coordinates": [lon, lat],
                "type": "Point"
            }
        })

    return result

def write_json(data, output_file):
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python script.py <input_kml_file> <output_json_file>")
        sys.exit(1)

    input_kml_file = sys.argv[1]
    output_json_file = sys.argv[2]

    parsed_data = parse_kml(input_kml_file)
    write_json(parsed_data, output_json_file)

    print(f"Data has been successfully written to {output_json_file}")
