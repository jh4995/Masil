/*
import React, { useEffect, useState } from 'react';

export default function MapComponent() {
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => {
    if (window.naver && window.naver.maps) {
      const mapOptions = {
        center: new window.naver.maps.LatLng(37.5665, 126.9780),
        zoom: 12,
      };
      const map = new window.naver.maps.Map('map', mapOptions);
      fetchOpportunitiesAndDrawMarkers(map);
    } else {
      console.error("네이버 지도 API가 로드되지 않았습니다.");
    }
  }, []);

  const fetchOpportunitiesAndDrawMarkers = async (map) => {
    try {
      const response = await fetch('http://localhost:8000/api/opportunities');
      const data = await response.json();
      setOpportunities(data);

      console.log('✅ 지도 데이터 로딩 성공:', data);

      data.forEach((op) => {
        const markerPosition = new window.naver.maps.LatLng(op.latitude, op.longitude);
        
        const marker = new window.naver.maps.Marker({
          position: markerPosition,
          map: map,
        });

        const infowindow = new window.naver.maps.InfoWindow({
            content: `<div style="padding:10px;border:1px solid black;font-size:12px;">${op.title}</div>`
        });

        window.naver.maps.Event.addListener(marker, 'click', () => {
          if (infowindow.getMap()) {
            infowindow.close();
          } else {
            infowindow.open(map, marker);
          }
        });
      });

    } catch (error) {
      console.error('❌ 지도 데이터 로딩 실패:', error);
    }
  };

  return (
    <div>
      <div id="map" style={{ width: '100%', height: '70vh' }}></div>
    </div>
  );
}*/

// src/components/MapComponent.jsx
import React, { useEffect, useRef } from 'react';

export default function MapComponent({ activities, onActivityClick }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    // 카카오 지도 API 로딩 및 초기화
    const initializeMap = () => {
      if (window.kakao && window.kakao.maps) {
        const container = mapRef.current;
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 서울 중심
          level: 3
        };
        
        mapInstance.current = new window.kakao.maps.Map(container, options);
        
        // 마커 추가
        activities.forEach(activity => {
          const markerPosition = new window.kakao.maps.LatLng(activity.lat, activity.lng);
          
          // 커스텀 마커 이미지 생성
          const markerImageSrc = getMarkerImageByType(activity.type);
          const imageSize = new window.kakao.maps.Size(40, 50);
          const imageOption = { offset: new window.kakao.maps.Point(20, 50) };
          
          const markerImage = new window.kakao.maps.MarkerImage(markerImageSrc, imageSize, imageOption);
          
          const marker = new window.kakao.maps.Marker({
            position: markerPosition,
            image: markerImage
          });
          
          marker.setMap(mapInstance.current);
          
          // 인포윈도우 추가
          const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:12px;">${activity.name}</div>`
          });
          
          window.kakao.maps.event.addListener(marker, 'click', () => {
            // 활동 클릭 시 모달 열기
            onActivityClick(activity);
          });
        });
      }
    };

    // 카카오 지도 API 스크립트 로딩
    if (!window.kakao) {
      const script = document.createElement('script');
      script.async = true;
      script.src = '//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_MAP_API_KEY&autoload=false';
      document.head.appendChild(script);
      
      script.onload = () => {
        window.kakao.maps.load(initializeMap);
      };
    } else {
      initializeMap();
    }

    return () => {
      // 클린업
      if (mapInstance.current) {
        mapInstance.current = null;
      }
    };
  }, [activities]);

  // 활동 타입에 따른 마커 이미지 반환
  const getMarkerImageByType = (type) => {
    switch (type) {
      case 'exercise':
        return 'data:image/svg+xml;base64,' + btoa(`
          <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 0C12.268 0 6 6.268 6 14C6 22 20 40 20 40S34 22 34 14C34 6.268 27.732 0 20 0Z" fill="#8BC34A"/>
            <circle cx="20" cy="14" r="8" fill="white"/>
            <text x="20" y="18" text-anchor="middle" fill="#8BC34A" font-size="12" font-weight="bold">운</text>
          </svg>
        `);
      case 'culture':
        return 'data:image/svg+xml;base64,' + btoa(`
          <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 0C12.268 0 6 6.268 6 14C6 22 20 40 20 40S34 22 34 14C34 6.268 27.732 0 20 0Z" fill="#CDDC39"/>
            <circle cx="20" cy="14" r="8" fill="white"/>
            <text x="20" y="18" text-anchor="middle" fill="#CDDC39" font-size="12" font-weight="bold">문</text>
          </svg>
        `);
      default:
        return 'data:image/svg+xml;base64,' + btoa(`
          <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 0C12.268 0 6 6.268 6 14C6 22 20 40 20 40S34 22 34 14C34 6.268 27.732 0 20 0Z" fill="#FFC107"/>
            <circle cx="20" cy="14" r="8" fill="white"/>
            <text x="20" y="18" text-anchor="middle" fill="#FFC107" font-size="12" font-weight="bold">기</text>
          </svg>
        `);
    }
  };

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        borderRadius: '8px'
      }}
    />
  );
}