import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import OpportunityForm from '../components/OpportunityForm';

export default function AdminPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [editingOpportunity, setEditingOpportunity] = useState(null); // 수정 중인 데이터
  const [showForm, setShowForm] = useState(false); // 폼 표시 여부

  // 처음 로드될 때 데이터 목록을 가져옵니다.
  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error('데이터 조회 오류', error);
    else setOpportunities(data);
  };

  const handleDelete = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);

      if (error) {
        alert('삭제 오류: ' + error.message);
      } else {
        alert('삭제되었습니다.');
        fetchOpportunities(); // 목록 새로고침
      }
    }
  };
  
  // 수정 버튼 클릭 시
  const handleEdit = (opportunity) => {
    setEditingOpportunity(opportunity);
    setShowForm(true);
  };

  // 새 글 작성 버튼 클릭 시
  const handleAddNew = () => {
    setEditingOpportunity(null); // 수정 모드 해제
    setShowForm(true);
  };

  // 폼 작업 완료 시 (저장 또는 취소)
  const handleFormComplete = () => {
    setShowForm(false);
    setEditingOpportunity(null);
    fetchOpportunities(); // 목록 새로고침
  };

  return (
    <div>
      <h2>관리자 대시보드</h2>
      <button onClick={handleAddNew}>새 소일거리 등록</button>

      {/* 폼 표시/숨김 처리 */}
      {showForm && (
        <OpportunityForm 
          editingOpportunity={editingOpportunity}
          onComplete={handleFormComplete}
        />
      )}

      <hr />
      <h3>소일거리 목록</h3>
      <table border="1" style={{ width: '100%', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>제목</th>
            <th>장소</th>
            <th>태그</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {opportunities.map((op) => (
            <tr key={op.id}>
              <td>{op.title}</td>
              <td>{op.location_name}</td>
              <td>{op.tags?.join(', ')}</td>
              <td>
                <button onClick={() => handleEdit(op)}>수정</button>
                <button onClick={() => handleDelete(op.id)}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}