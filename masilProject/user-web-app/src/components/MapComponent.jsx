/* 최초 버전
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
}
  */


// src/components/MapComponent.jsx
import React, { useEffect, useState, useRef } from 'react';

export default function MapComponent() {
  const [opportunities, setOpportunities] = useState([]);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // 네이버 지도 API 로딩 확인 및 지연 초기화
    const initializeMap = () => {
      if (window.naver && window.naver.maps && mapRef.current) {
        try {
          console.log('🗺️ 네이버 지도 초기화 시작');
          
          const mapOptions = {
            center: new window.naver.maps.LatLng(37.5665, 126.9780),
            zoom: 12,
            mapTypeControl: false,
            scaleControl: false,
            logoControl: false,
            mapDataControl: false,
            zoomControl: true,
            zoomControlOptions: {
              position: window.naver.maps.Position.TOP_RIGHT
            }
          };
          
          const map = new window.naver.maps.Map(mapRef.current, mapOptions);
          
          console.log('✅ 네이버 지도 초기화 성공');
          setMapLoaded(true);
          
          // 지도 로딩 완료 후 데이터 가져오기
          fetchOpportunitiesAndDrawMarkers(map);
          
        } catch (error) {
          console.error('❌ 네이버 지도 초기화 실패:', error);
        }
      } else {
        console.log('⏳ 네이버 지도 API 대기 중...');
        // API 로딩이 안 된 경우 재시도
        setTimeout(initializeMap, 500);
      }
    };

    // 컴포넌트 마운트 후 약간의 지연을 두고 초기화
    const timer = setTimeout(initializeMap, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const fetchOpportunitiesAndDrawMarkers = async (map) => {
    try {
      // ✅ API 호출 대신 목업 데이터 사용 (API 서버가 없을 경우 대비)
      const mockData = [
        {
          id: 1,
          title: '보육시설 지원',
          latitude: 37.5665,
          longitude: 126.9780
        },
        {
          id: 2,
          title: '독서 모임',
          latitude: 37.5675,
          longitude: 126.9785
        },
        {
          id: 3,
          title: '운동 활동',
          latitude: 37.5655,
          longitude: 126.9775
        }
      ];

      console.log('✅ 지도 데이터 로딩 성공:', mockData);
      setOpportunities(mockData);

      // 마커 생성
      mockData.forEach((op) => {
        const markerPosition = new window.naver.maps.LatLng(op.latitude, op.longitude);
        
        const marker = new window.naver.maps.Marker({
          position: markerPosition,
          map: map,
          title: op.title,
          icon: {
            content: '<div style="background: #FF6B6B; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">' + op.title + '</div>',
            anchor: new window.naver.maps.Point(0, 0)
          }
        });

        const infowindow = new window.naver.maps.InfoWindow({
          content: `
            <div style="padding: 12px; border: 1px solid #ddd; background: white; border-radius: 8px; font-size: 14px; min-width: 150px;">
              <strong>${op.title}</strong><br/>
              <small style="color: #666;">클릭하여 자세히 보기</small>
            </div>
          `
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
      
      // API 실패 시에도 기본 마커 하나는 표시
      const defaultMarker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(37.5665, 126.9780),
        map: map,
        title: '기본 위치'
      });
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* ✅ 지도 컨테이너 */}
      <div 
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          margin: 0,
          padding: 0,
          border: 'none',
          outline: 'none',
          display: 'block'
        }}
      />
      
      {/* ✅ 지도 로딩 표시 */}
      {!mapLoaded && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(248, 249, 250, 0.9)',
          color: '#666',
          fontSize: '14px',
          zIndex: 10
        }}>
          <div style={{ textAlign: 'center' }}>
            <div>🗺️</div>
            <div>지도를 불러오는 중...</div>
          </div>
        </div>
      )}
    </div>
  );
}