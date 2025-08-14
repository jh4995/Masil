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
import React from 'react';
import './MapComponent.css';

export default function MapComponent({ activities, onActivityClick }) {
  return (
    <div className="map-wrapper">
      {/* 더미 지도 배경 */}
      <div className="dummy-map">
        {/* 그리드 패턴으로 지도 느낌 연출 */}
        <div className="map-grid"></div>
        
        {/* 활동 마커들 */}
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`activity-marker marker-${activity.type}`}
            style={{
              left: `${20 + (activity.id * 25)}%`,
              top: `${30 + (activity.id * 15)}%`
            }}
            onClick={() => onActivityClick(activity)}
          >
            <div className="marker-icon">
              {getMarkerIcon(activity.type)}
            </div>
            <div className="marker-label">{activity.name}</div>
          </div>
        ))}
        
        {/* 지도 위 텍스트 */}
        <div className="map-overlay">
          <p>사용자 맞춤 활동이 표시됩니다</p>
        </div>
      </div>
    </div>
  );
}

// 활동 타입별 아이콘 반환
function getMarkerIcon(type) {
  switch (type) {
    case 'support':
      return '🏢';
    case 'culture':
      return '📚';
    case 'exercise':
      return '🏃';
    default:
      return '📍';
  }
}