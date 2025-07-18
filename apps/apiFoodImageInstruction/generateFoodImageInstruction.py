import requests
import markdown2
import datetime
from fpdf import FPDF
import json

# Example variables
server_endpoint = "https://swosy.rocket-meals.de/rocket-meals/api/items"
start_date = "2024-10-01"
end_date = "2024-10-01"

# Predefined Server Endpoints
predefinedOptions = {
    "1": "Current HTTPS",
    "2": "Test Server",
    "3": "Studi|Futter",
    "4": "SWOSY"
}

serverEndpoints = {
    "Current HTTPS": "https://swosy.rocket-meals.de/rocket-meals/api",
    "Test Server": "https://test.rocket-meals.de/rocket-meals/api",
    "Studi|Futter": "https://studi-futter.rocket-meals.de/rocket-meals/api",
    "SWOSY": "https://swosy.rocket-meals.de/rocket-meals/api"
}

def select_server_endpoint():
    print("Please select a server endpoint from the following options:")
    for key, name in predefinedOptions.items():
        print(f"{key}. {name} ({serverEndpoints[name]})")
    print("5. Enter a custom server URL")

    choice = input("Enter the number of your choice (1-5): ")

    if choice in predefinedOptions:
        selected_option = predefinedOptions[choice]
        print(f"Selected server: {selected_option}")
        return serverEndpoints[selected_option]
    elif choice == "5":
        custom_url = input("Enter the custom server URL: ")
        return custom_url
    else:
        print("Invalid choice. Please try again.")
        return select_server_endpoint()

def create_markdown_instruction_get_canteens():
    URL = f"{server_endpoint}/items/canteens?limit=-1&fields=alias,id"
    print("Get all canteens from the server from the following URL: ", URL)
    response = requests.get(URL)
    data_raw = response.json()
    data = data_raw["data"]
    #print("Data: ", data)

    print("Please select a canteen from the following options with a number:")
    amount_of_canteens = len(data)
    print("Canteens:")
    for i in range(amount_of_canteens):
        print(f"{i+1}. {data[i]['alias']} ({data[i]['id']})")
    print("Enter the number of your choice: ")
    choice = int(input())
    selected_canteen_id = data[choice-1]["id"]
    print(f"Selected canteen: {data[choice-1]['alias']} ({selected_canteen_id})")

    markdown = f'''
# Server Endpoint

The following instructions are based for the server endpoint:
```
{server_endpoint}
```

# Canteen Selection
    '''

    markdown += f'''
## Get all canteens
Make a GET request to the following endpoint:
```
{URL}
```
The response will contain a list of canteens with their alias and id. Select a canteen by its id.
    '''

    markdown += f'''
## Example Data of Canteens
```
   data = [
      ...
      {json.dumps(data[choice-1], indent=2)}
      ...
   ]
```
    '''

    # now ask the user to select the date range
    print("Please enter the start date (YYYY-MM-DD) or press Enter for today: ")
    start_date = input()
    if start_date == "":
        start_date = datetime.date.today().strftime("%Y-%m-%d")
    print("Please enter the end date (YYYY-MM-DD) or press Enter for today: ")
    end_date = input()
    if end_date == "":
        end_date = start_date
    print(f"Selected date range: {start_date} to {end_date}")
    print("Selected canteen ID: ", selected_canteen_id)

    return markdown, selected_canteen_id, start_date, end_date

def create_markdown_instruction_get_foodoffers_with_image(selected_canteen_id, start_date, end_date):
    print("Get all food offers with image from the server")
    print("Selected canteen ID: ", selected_canteen_id)
    print("Selected date range: ", start_date, " to ", end_date)

    URL_WITH_PLACEHOLDER = f"{server_endpoint}/items/foodoffers?fields=id,food.image,food.alias,food.id,alias,date&filter={{\"_and\":[{{\"_or\":[{{\"_and\":[{{\"date\":{{\"_gte\":\"<DATE_START_YYYY_MM_DD>\"}}}},{{\"date\":{{\"_lte\":\"<DATE_END_YYYY_MM_DD>\"}}}}]}},{{\"date\":{{\"_null\":true}}}}]}},{{\"canteen\":{{\"_eq\":\"<CANTEEN_ID>\"}}}}]}}&limit=-1"
    URL = f"{server_endpoint}/items/foodoffers?fields=id,food.image,food.alias,food.id,alias,date&filter={{\"_and\":[{{\"_or\":[{{\"_and\":[{{\"date\":{{\"_gte\":\"{start_date}\"}}}},{{\"date\":{{\"_lte\":\"{end_date}\"}}}}]}},{{\"date\":{{\"_null\":true}}}}]}},{{\"canteen\":{{\"_eq\":\"{selected_canteen_id}\"}}}}]}}&limit=-1"
    markdown = '''
# Food Offer Selection
    '''

    markdown += f'''
## Get all food offers with image

This instruction is based on the selected canteen ID:
```
{selected_canteen_id}
```
and the selected date range:
```
{start_date} to {end_date}
```

For other canteens or date ranges, please adjust the filter in the URL accordingly. This is the URL with the placeholders:
```
{URL_WITH_PLACEHOLDER}
```



Make a GET request to the following endpoint for our selected canteen and date range in this example:
```
{URL}
```
The response will contain a list of food offers with their images. Select a food offer by its id.
    '''

    print("Get all food offers with image from the server from the following URL: ", URL)
    response = requests.get(URL)
    data_raw = response.json()
    data = data_raw["data"]
    #print("Data: ", data)
    print("Please select a food offer from the following options with a number:")
    amount_of_foodoffers = len(data)
    print("Food Offers:")
    for i in range(amount_of_foodoffers):
        print(f"{i+1}. {data[i]['food']['alias']} ({data[i]['id']})")
    print("Enter the number of your choice: ")
    choice = int(input())
    image_id = data[choice-1]["food"]["image"]
    print(f"Selected food offer: {data[choice-1]['food']['alias']} ({image_id})")
    
    markdown += f'''
## Example Data of Food Offers
```
   data = [
      ...
      {json.dumps(data[choice-1], indent=2)}
      ...
   ]
```
    '''
    
    markdown += f'''
## Example Image ID
```
   image_id = {image_id}
```
    '''

    return markdown, image_id

def create_markdown_instruction_get_image(image_id):
    print("Get the image with the following image ID: ", image_id)
    # https://swosy.rocket-meals.de/rocket-meals/api/assets/c54d549f-1aaa-487c-ac6e-4fc1fe206dcb?fit=cover&width=512&height=512&quality=100

    URL_WITH_PLACEHOLDER = f"{server_endpoint}/assets/<IMAGE_ID>?fit=cover&width=512&height=512&quality=100"
    URL = f"{server_endpoint}/assets/{image_id}?fit=cover&width=512&height=512&quality=100"

    markdown = '''
# Image Selection
    '''

    markdown += f'''

This instruction is based on the selected image ID:
```
{image_id}
```

For other images, please adjust the image ID in the URL accordingly. This is the URL with the placeholders:
```
{URL_WITH_PLACEHOLDER}
```

## Get the image with the selected example image ID
Make a GET request to the following endpoint:
```
{URL}
```
The response will contain the image.
Further transformations can be done by adding parameters to the URL, which are documented here: https://docs.directus.io/reference/files.html#custom-transformations
    '''

    return markdown

if __name__ == "__main__":
    server_endpoint = select_server_endpoint()

    markdown, selected_canteen_id, start_date, end_date = create_markdown_instruction_get_canteens()
    foodoffers_markdown, image_id = create_markdown_instruction_get_foodoffers_with_image(selected_canteen_id, start_date, end_date)
    markdown += foodoffers_markdown
    markdown += create_markdown_instruction_get_image(image_id)
    print("-----------------------------------")

    print(markdown)
