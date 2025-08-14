// src/components/ActivityModal.jsx
import React from 'react';
import './Modal.css';

export default function ActivityModal({ activity, onClose }) {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container">
        {/* 모달 헤더 */}
        <div className="modal-header">
          <h2 className="modal-title">{activity.name}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* 모달 콘텐츠 */}
        <div className="modal-content">
          <div className="activity-info-grid">
            <div className="info-item">
              <span className="info-label">일시:</span>
              <span className="info-value">{activity.date}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">장소:</span>
              <span className="info-value">{activity.location}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">인원:</span>
              <span className="info-value">{activity.duration}</span>
            </div>
          </div>

          {/* 추가 정보 섹션 */}
          <div className="activity-description">
            <h3>활동 내용</h3>
            <p>이 활동에 참여하여 지역사회에 도움을 줄 수 있습니다. 자세한 내용은 담당자에게 문의하시기 바랍니다.</p>
          </div>
        </div>

        {/* 모달 액션 버튼 */}
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            닫기
          </button>
          <button className="btn-primary">
            참여 신청
          </button>
        </div>
      </div>
    </div>
  );
}