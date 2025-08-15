// src/components/VoiceModal.jsx
import React, { useState, useEffect } from 'react';
import './Modal.css';

export default function VoiceModal({ onClose }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const startListening = () => {
    setIsListening(true);
    // 실제 음성 인식 API 연동 시 여기에 구현
    console.log('음성 인식 시작...');
    
    // 시뮬레이션: 3초 후 음성 인식 완료
    setTimeout(() => {
      setTranscript('음성 인식 결과가 여기에 표시됩니다.');
      setIsListening(false);
    }, 3000);
  };

  const stopListening = () => {
    setIsListening(false);
    console.log('음성 인식 중지');
  };

  useEffect(() => {
    // 모달이 열리면 자동으로 음성 인식 시작
    startListening();
  }, []);

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container voice-modal">
        {/* 모달 헤더 */}
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* 음성 입력 UI */}
        <div className="voice-content">
          {/* 마이크 아이콘 */}
          <div className={`mic-icon-container ${isListening ? 'listening' : ''}`}>
            <div className="mic-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </div>
            {isListening && <div className="pulse-ring"></div>}
          </div>

          {/* 상태 텍스트 */}
          <div className="voice-status">
            <h2>{isListening ? '말씀해주세요' : '음성 인식 완료'}</h2>
            {transcript && (
              <div className="transcript">
                <p>"{transcript}"</p>
              </div>
            )}
          </div>
        </div>

        {/* 컨트롤 버튼 */}
        <div className="voice-controls">
          {isListening ? (
            <button className="btn-secondary" onClick={stopListening}>
              중지
            </button>
          ) : (
            <div className="voice-action-buttons">
              <button className="btn-secondary" onClick={onClose}>
                닫기
              </button>
              <button className="btn-primary" onClick={startListening}>
                다시 듣기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}