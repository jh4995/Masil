import React, { useState } from 'react';
import LoginForm from '../components/LoginForm'; // LoginForm을 components 폴더로 이동
import SignUpForm from '../components/SignUpForm'; // SignUpForm을 components 폴더로 이동

export default function LoginPage() {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div>
      {isLoginView ? <LoginForm /> : <SignUpForm />}
      <button onClick={() => setIsLoginView(!isLoginView)}>
        {isLoginView ? '회원가입 하러가기' : '로그인 하러가기'}
      </button>
    </div>
  );
}