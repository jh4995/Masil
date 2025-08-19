// src/services/ApiService.js
const API_BASE_URL = 'https://jobisbe.ngrok.app/api';

class ApiService {
  
  // 🗺️ 지도용 일거리 데이터 조회 (최소 정보만)
  static async getJobsForMap() {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs?view=map&limit=100`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🗺️ 지도용 일거리 데이터 조회 성공:', data);
      return data;
    } catch (error) {
      console.error('❌ 지도용 일거리 데이터 조회 실패:', error);
      throw error;
    }
  }

  // 🤖 AI 추천 일거리 조회 (Job있으 버튼용 - main.py의 /api/recommend 엔드포인트)
  static async getRecommendedJobs(userId, query = "사용자에게 맞는 일거리를 추천해주세요") {
    try {
      console.log('🔍 추천 요청 데이터:', { user_id: userId, query: query });
      
      const requestBody = {
        user_id: userId,
        query: query
      };
      
      console.log('📤 요청 URL:', `${API_BASE_URL}/recommend`);
      console.log('📤 요청 Body:', JSON.stringify(requestBody));
      
      const response = await fetch(`${API_BASE_URL}/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('📥 응답 상태:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 서버 에러 응답:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('🤖 AI 추천 원본 응답:', data);
      
      // 응답 데이터 구조 확인 및 정리
      const jobs = data.jobs || [];
      console.log('📊 추천 일거리 개수:', jobs.length);
      
      return data; // { answer: "...", jobs: [...] } 형태
    } catch (error) {
      console.error('❌ AI 추천 일거리 조회 실패:', error);
      throw error;
    }
  }

  // 📋 특정 일거리 상세 정보 조회
  static async getJobById(jobId) {
    try {
      console.log(`📋 일거리 ${jobId} 상세정보 조회 요청`);
      
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`📥 응답 상태 (${jobId}):`, response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ 서버 에러 응답 (${jobId}):`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`📋 일거리 ${jobId} 상세정보 조회 성공:`, data);
      return data;
    } catch (error) {
      console.error(`❌ 일거리 ${jobId} 상세정보 조회 실패:`, error);
      throw error;
    }
  }

  // 🌍 사용자 위치 기반 주변 일거리 조회
  static async getNearbyJobs(latitude, longitude, radiusKm = 5) {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs?latitude=${latitude}&longitude=${longitude}&radius_km=${radiusKm}&limit=50`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🌍 주변 일거리 데이터 조회 성공:', data);
      return data;
    } catch (error) {
      console.error('❌ 주변 일거리 데이터 조회 실패:', error);
      throw error;
    }
  }

  // 📝 새로운 일거리 등록
  static async createJob(jobData) {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📝 일거리 등록 성공:', data);
      return data;
    } catch (error) {
      console.error('❌ 일거리 등록 실패:', error);
      throw error;
    }
  }
}

export default ApiService;