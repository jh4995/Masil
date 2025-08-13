// MapComponent.js
import React, { useEffect, useRef } from 'react';

const MapComponent = () => {
  const mapElement = useRef(null);

  useEffect(() => {
    const { naver } = window;
    
    if (!mapElement.current || !naver) return;

    // 지도 초기화
    const mapOptions = {
      center: new naver.maps.LatLng(37.5665, 126.9780), // 서울시청 좌표
      zoom: 15,
      zoomControl: true,
      zoomControlOptions: {
        position: naver.maps.Position.TOP_RIGHT
      }
    };

    const map = new naver.maps.Map(mapElement.current, mapOptions);

    // 마커 추가 예시
    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(37.5665, 126.9780),
      map: map
    });

  }, []);

  return (
    <div 
      ref={mapElement} 
      style={{ width: '100%', height: '400px' }}
    />
  );
};

export default MapComponent;
