import React from 'react';
import { useParams } from 'react-router-dom';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';

const ReviewPage = ({ type }) => {
  const { id } = useParams(); // Lấy ID từ URL

  return (
    <div>
      <h2>Đánh giá {type === 'product' ? 'Sản phẩm' : 'Cửa hàng'} #{id}</h2>
      <ReviewForm type={type} targetId={id} />
      <ReviewList type={type} targetId={id} />
    </div>
  );
};

export default ReviewPage;
