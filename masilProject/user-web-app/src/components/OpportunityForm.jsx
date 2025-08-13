import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const NAVER_API_KEY_ID = import.meta.env.VITE_NAVER_API_KEY_ID;
const NAVER_API_KEY = import.meta.env.VITE_NAVER_API_KEY;

export default function OpportunityForm({ editingOpportunity, onComplete }) {
  // 1. 데이터베이스 필드에 맞는 모든 state 선언
  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [description, setDescription] = useState('');
  const [participants, setParticipants] = useState('');
  const [hourlyWage, setHourlyWage] = useState('');
  const [workDays, setWorkDays] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [place, setPlace] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [tags, setTags] = useState('');
  
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. 수정 모드일 경우, 폼에 기존 데이터를 채워넣는 로직
  useEffect(() => {
    if (editingOpportunity) {
      setTitle(editingOpportunity.title || '');
      setClient(editingOpportunity.client || '');
      setDescription(editingOpportunity.description || '');
      setParticipants(editingOpportunity.participants || '');
      setHourlyWage(editingOpportunity.hourly_wage || '');
      setWorkDays(editingOpportunity.work_days || '');
      setStartTime(editingOpportunity.start_time || '');
      setEndTime(editingOpportunity.end_time || '');
      setPlace(editingOpportunity.place || '');
      setAddress(editingOpportunity.address || '');
      setLatitude(editingOpportunity.latitude || '');
      setLongitude(editingOpportunity.longitude || '');
      setTags(editingOpportunity.tags?.join(', ') || '');
    }
  }, [editingOpportunity]);

  // 2. Naver API를 직접 호출하도록 geocode 함수를 수정합니다.
  const handleGeocode = async () => {
    if (!address) {
      alert('먼저 주소를 입력해주세요.');
      return;
    }
    setIsGeocoding(true);

    const url = `/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`;

    try {
      // fetch API를 사용하여 Naver API를 직접 호출
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-NCP-APIGW-API-KEY-ID': NAVER_API_KEY_ID,
          'X-NCP-APIGW-API-KEY': NAVER_API_KEY,
        },
      });

      const data = await response.json();

      if (response.ok && data.status === 'OK' && data.addresses.length > 0) {
        setLatitude(data.addresses[0].y);
        setLongitude(data.addresses[0].x);
        alert('좌표를 성공적으로 찾았습니다.');
      } else {
        throw new Error(data.errorMessage || '해당 주소의 좌표를 찾을 수 없습니다.');
      }
    } catch (error) {
      alert(`좌표 찾기 실패: ${error.message}`);
    } finally {
      setIsGeocoding(false);
    }
  };
  
  // 4. 폼 제출 시 데이터를 Supabase에 저장(생성 또는 수정)하는 함수
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const opportunityData = {
      title,
      client,
      description,
      participants: parseInt(participants, 10) || null,
      hourly_wage: parseInt(hourlyWage, 10),
      work_days: workDays || null,
      start_time: startTime || null,
      end_time: endTime || null,
      place,
      address,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      tags: tags ? tags.split(',').map(tag => tag.trim()) : null,
    };

    let error;
    if (editingOpportunity) {
      // 수정 모드: update
      ({ error } = await supabase
        .from('opportunities')
        .update({ ...opportunityData, updated_at: new Date() })
        .eq('job_id', editingOpportunity.job_id));
    } else {
      // 생성 모드: insert
      ({ error } = await supabase
        .from('opportunities')
        .insert([opportunityData]));
    }

    if (error) {
      alert('오류 발생: ' + error.message);
    } else {
      alert(editingOpportunity ? '수정되었습니다!' : '저장되었습니다!');
      onComplete(); // 부모 컴포넌트에 작업 완료 알림
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0' }}>
      <h3>{editingOpportunity ? '소일거리 수정' : '새 소일거리 등록'}</h3>
      
      <div><input type="text" placeholder="* 사업명(제목)" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
      <div><input type="text" placeholder="클라이언트 (복지관 등)" value={client} onChange={(e) => setClient(e.target.value)} /></div>
      <div><textarea placeholder="근무 내용" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
      <div><input type="number" placeholder="모집 인원" value={participants} onChange={(e) => setParticipants(e.target.value)} /></div>
      <div><input type="number" placeholder="* 시급(원)" value={hourlyWage} onChange={(e) => setHourlyWage(e.target.value)} required /></div>
      <div><input type="text" placeholder="근무 요일 (예: 1111100)" value={workDays} onChange={(e) => setWorkDays(e.target.value)} /></div>
      <div><label>시작 시간: </label><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
      <div><label>종료 시간: </label><input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></div>
      <div><input type="text" placeholder="* 근무 지역 (예: 성내동)" value={place} onChange={(e) => setPlace(e.target.value)} required /></div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input type="text" placeholder="도로명 주소 (지오코딩용)" value={address} onChange={(e) => setAddress(e.target.value)} style={{ flex: 1 }} />
        <button type="button" onClick={handleGeocode} disabled={isGeocoding}>
          {isGeocoding ? '찾는 중...' : '좌표 찾기'}
        </button>
      </div>
      
      <div><input type="number" step="any" placeholder="* 위도 (자동 입력)" value={latitude} onChange={(e) => setLatitude(e.target.value)} required readOnly /></div>
      <div><input type="number" step="any" placeholder="* 경도 (자동 입력)" value={longitude} onChange={(e) => setLongitude(e.target.value)} required readOnly /></div>
      <div><input type="text" placeholder="태그 (콤마로 구분)" value={tags} onChange={(e) => setTags(e.target.value)} /></div>
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '저장 중...' : (editingOpportunity ? '수정하기' : '저장하기')}
      </button>
      <button type="button" onClick={onComplete}>취소</button>
    </form>
  );
}