import React, { useEffect, useState } from 'react';
import defaultApi from '../configs/Apis';

const ReviewList = ({ type, targetId }) => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    defaultApi.get(`/api/review/${type}/${targetId}`)
      .then(res => setReviews(res.data))
      .catch(() => console.error('Lỗi lấy đánh giá'));
  }, [type, targetId]);

  return (
    <div>
      <h4>Danh sách đánh giá:</h4>
      {reviews.length === 0 && <p>Chưa có đánh giá nào.</p>}
      {reviews.map((r, i) => (
        <div key={i} style={{ borderBottom: '1px solid #ccc', padding: 8 }}>
          <strong>⭐ {r.rating}</strong>
          <p>{r.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
