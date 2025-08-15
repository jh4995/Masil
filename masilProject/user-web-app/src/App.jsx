/*
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabase } from './supabaseClient';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

//추가
import ActivityListPage from './pages/ActivityListPage';


function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true); // 1. 로딩 상태 추가 (초기값 true)

  useEffect(() => {
    // 2. 최초 세션 확인이 끝나면 로딩 상태를 false로 변경
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false); // 확인 완료
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // 3. 로딩 중이라면 로딩 메시지를 표시하고 라우터를 렌더링하지 않음
  if (loading) {
    return <div>애플리케이션 로딩 중...</div>;
  }

  // 4. 로딩이 끝나면 라우터를 렌더링
  return (
    <BrowserRouter>
      <div className="App">
        <header className="App-header">
          <h1>시니어 소일거리</h1>
          {session && (
            <button onClick={() => supabase.auth.signOut()}>
              로그아웃
            </button>
          )}
        </header>
        <main>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/" element={
                <ProtectedRoute session={session}>
                    <HomePage />
                </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
                <ProtectedRoute session={session} adminOnly={true}>
                    <AdminPage />
                </ProtectedRoute>
            } />

            //추가
            <Route path="/activities" element={<ActivityListPage />} />

          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;*/

// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';

// 페이지 컴포넌트들
import HomePage from './pages/HomePage';
import SignUpForm from './components/SignUpForm';
import LoginForm from './components/LoginForm';
import ActivityListPage from './pages/ActivityListPage';
import AdminPage from './pages/AdminPage';

// 레이아웃 래퍼 컴포넌트 생성
function AppContent({ user, loading }) {
  const location = useLocation();
  
  // ActivityListPage인지 확인
  const isActivityListPage = location.pathname === '/activities';
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh' 
      }}>
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className={isActivityListPage ? "app-fullscreen" : "App"}>
      <Routes>
        {/* 로그인하지 않은 사용자용 라우트 */}
        {!user ? (
          <>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignUpForm />} />
            <Route path="/login" element={<LoginForm />} />
            {/* 로그인하지 않은 상태에서 다른 경로 접근 시 홈으로 리다이렉트 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            {/* 로그인한 사용자용 라우트 */}
            <Route path="/activities" element={<ActivityListPage />} />
            <Route path="/admin" element={<AdminPage />} />
            {/* 로그인한 상태에서 루트 경로 접근 시 활동 목록으로 리다이렉트 */}
            <Route path="/" element={<Navigate to="/activities" replace />} />
            <Route path="/signup" element={<Navigate to="/activities" replace />} />
            <Route path="/login" element={<Navigate to="/activities" replace />} />
            <Route path="*" element={<Navigate to="/activities" replace />} />
          </>
        )}
      </Routes>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 세션 변화 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <AppContent user={user} loading={loading} />
    </Router>
  );
}

export default App;