import React, { useState } from 'react';
import axios from 'axios';

const ReviewForm = ({ type, targetId }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const reviewData = {
      rating,
      comment,
      userId: 1, // hardcode user (hoặc lấy từ context/login)
    };

    if (type === 'product') reviewData.productId = targetId;
    if (type === 'store') reviewData.storeId = targetId;

    try {
      await axios.post(`/api/review/${type}`, reviewData);
      setMessage('✅ Đánh giá đã gửi!');
      setComment('');
      setRating(5);
    } catch {
      setMessage('❌ Lỗi khi gửi đánh giá.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
      <h4>Đánh giá {type === 'product' ? 'sản phẩm' : 'cửa hàng'}</h4>
      <label>Điểm (1–5): </label>
      <input type="number" min={1} max={5} value={rating} onChange={(e) => setRating(e.target.value)} required />
      <br />
      <label>Bình luận:</label>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} required />
      <br />
      <button type="submit">Gửi đánh giá</button>
      <p>{message}</p>
    </form>
  );
};

export default ReviewForm;
