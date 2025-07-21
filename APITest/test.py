import requests

url = "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&callback=function"

payload = {
    "startX": 126.92365493654832,
    "startY": 37.556770374096615,
    "angle": 20,
    "speed": 30,
    "endPoiId": "10001",
    "endX": 126.92432158129688,
    "endY": 37.55279861528311,
    "passList": "126.92774822,37.55395475_126.92577620,37.55337145",
    "reqCoordType": "WGS84GEO",
    "startName": "%EC%B6%9C%EB%B0%9C",
    "endName": "%EB%8F%84%EC%B0%A9",
    "searchOption": "0",
    "resCoordType": "WGS84GEO",
    "sort": "index",
}
headers = {
    "accept": "application/json",
    "content-type": "application/json",
    "appKey": "DwANdUbYGB5RZ7G2ExDTZ6WYex1F9xe180S7287b",
}

response = requests.post(url, json=payload, headers=headers)

# print(response.text)


def get_route_info(Lat1, Lon1, Lat2, Lon2, depart, destination):
    url = (
        "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&callback=function"
    )

    payload = {
        "startX": Lon1,
        "startY": Lat1,
        "endX": Lon2,
        "endY": Lat2,
        "startName": depart,
        "endName": destination,
        "reqCoordType": "WGS84GEO",
        "resCoordType": "WGS84GEO",
        "sort": "index",
    }

    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "appKey": "DwANdUbYGB5RZ7G2ExDTZ6WYex1F9xe180S7287b",
    }

    response = requests.post(url, json=payload, headers=headers)
    return response.json()
