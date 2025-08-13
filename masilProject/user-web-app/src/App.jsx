import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from "./supabaseClient"; // supabase import 추가
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  // 1. App 컴포넌트가 로그인 상태(session)를 직접 관리하도록 상태 추가
  const [session, setSession] = useState(null);

  // 2. 인증 상태가 바뀔 때마다 session 상태를 업데이트하는 로직 추가
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <div className="App">
        <header className="App-header">
          <h1>시니어 소일거리</h1>

          {/* 3. session이 있을 때만 로그아웃 버튼을 표시 */}
          {session && (
            <button onClick={() => supabase.auth.signOut()}>로그아웃</button>
          )}
        </header>
        <main>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute session={session}>
                  {" "}
                  {/* session을 prop으로 전달 */}
                  <HomePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute session={session} adminOnly={true}>
                  {" "}
                  {/* session을 prop으로 전달 */}
                  <AdminPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
