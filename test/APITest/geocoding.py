import requests
import test


depart = '서울 광진구 아차산로 243'
destination = '서울 광진구 아차산로 400'

# url = "https://apis.openapi.sk.com/tmap/geo/convertAddress?version=1&searchTypCd=NtoO&reqAdd=%EA%B2%BD%EA%B8%B0%EB%8F%84%20%EC%84%B1%EB%82%A8%EC%8B%9C%20%EB%B6%84%EB%8B%B9%EA%B5%AC%20%ED%8C%90%EA%B5%90%EB%A1%9C%20264&reqMulti=S&resCoordType=WGS84GEO"
url = f"https://apis.openapi.sk.com/tmap/geo/convertAddress?version=1&searchTypCd=NtoO&reqAdd={depart}&reqMulti=S&resCoordType=WGS84GEO"
url2 = f"https://apis.openapi.sk.com/tmap/geo/convertAddress?version=1&searchTypCd=NtoO&reqAdd={destination}&reqMulti=S&resCoordType=WGS84GEO"

headers = {
    "accept": "application/json",
    "appKey": "DwANdUbYGB5RZ7G2ExDTZ6WYex1F9xe180S7287b"
}

response = requests.get(url, headers=headers)
response2 = requests.get(url2, headers=headers)

Lat1 = response.json()["ConvertAdd"]["newAddressList"]["newAddress"][0]["newLat"]
Lon1 = response.json()["ConvertAdd"]["newAddressList"]["newAddress"][0]["newLon"]
Lat2 = response2.json()["ConvertAdd"]["newAddressList"]["newAddress"][0]["newLat"]
Lon2 = response2.json()["ConvertAdd"]["newAddressList"]["newAddress"][0]["newLon"]



print(Lat1, Lon1)

result = test.get_route_info(Lat1, Lon1, Lat2, Lon2, depart, destination)
print(result.get("features", []))