/*
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function SignUpForm() {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async (event) => {
    event.preventDefault();
    setLoading(true);

    const processedPhone = phone.replace(/[^0-9]/g, ''); // 숫자만 추출
    // 맨 앞 '0'을 제거하고 +82를 붙입니다.
    const formattedPhone = `+82${processedPhone.startsWith('0') ? processedPhone.substring(1) : processedPhone}`;

    const { error } = await supabase.auth.signUp({
      phone: formattedPhone,
      password: password,
    });

    if (error) {
      alert(error.error_description || error.message);
    } else {
      alert('가입이 완료되었습니다! 이제 로그인 해주세요.');
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>회원가입</h2>
      <form onSubmit={handleSignUp}>
        <div>
          <input
            type="tel"
            placeholder="전화번호 ('-' 제외)"
            value={phone}
            required
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <button type="submit" disabled={loading}>
            {loading ? '가입 중...' : '가입하기'}
          </button>
        </div>
      </form>
    </div>
  );
}*/

import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import './AuthForms.css';

export default function SignUpForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    
    // 비밀번호 확인 검증
    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    const processedPhone = formData.phone.replace(/[^0-9]/g, ''); // 숫자만 추출
    // 맨 앞 '0'을 제거하고 +82를 붙입니다.
    const formattedPhone = `+82${processedPhone.startsWith('0') ? processedPhone.substring(1) : processedPhone}`;

    const { error } = await supabase.auth.signUp({
      phone: formattedPhone,
      password: formData.password,
      options: {
        data: {
          name: formData.name,
          nickname: formData.nickname
        }
      }
    });

    if (error) {
      alert(error.error_description || error.message);
    } else {
      alert('가입이 완료되었습니다! 이제 로그인 해주세요.');
    }
    setLoading(false);
  };

  const handleLogin = () => {
    // 로그인 페이지로 이동하는 로직 (라우터 설정에 따라 수정 필요)
    window.location.href = '/login';
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <button className="back-btn" onClick={goBack} type="button">
          ←
        </button>
        <h2 className="auth-title">회원가입</h2>
      </div>
      
      <form className="auth-form" onSubmit={handleSignUp}>
        <input
          type="text"
          placeholder="이름"
          className="auth-input"
          value={formData.name}
          required
          onChange={(e) => handleInputChange('name', e.target.value)}
        />
        
        <input
          type="text"
          placeholder="닉네임"
          className="auth-input"
          value={formData.nickname}
          required
          onChange={(e) => handleInputChange('nickname', e.target.value)}
        />
        
        <input
          type="tel"
          placeholder="전화번호 ('-' 제외)"
          className="auth-input"
          value={formData.phone}
          required
          onChange={(e) => handleInputChange('phone', e.target.value.replace(/[^0-9]/g, ''))}
        />
        
        <input
          type="password"
          placeholder="비밀번호"
          className="auth-input"
          value={formData.password}
          required
          onChange={(e) => handleInputChange('password', e.target.value)}
        />
        
        <input
          type="password"
          placeholder="비밀번호 재확인"
          className="auth-input"
          value={formData.confirmPassword}
          required
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
        />
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-outline-small"
            onClick={handleLogin}
            disabled={loading}
          >
            로그인
          </button>
          <button 
            type="submit" 
            className="btn-primary-small"
            disabled={loading}
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </div>
      </form>
    </div>
  );
}