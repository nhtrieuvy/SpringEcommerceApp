import React, { useState } from 'react';
import { authApi } from '../configs/Apis';

const CreateStore = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sellerId, setSellerId] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const store = { name, description, seller: { id: sellerId } };
      await authApi().post('/api/stores', store);
      setMessage('Tạo cửa hàng thành công!');
      setName('');
      setDescription('');
    } catch (err) {
      setMessage('Tạo cửa hàng thất bại');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Tạo cửa hàng mới</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Tên cửa hàng"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <br /><br />
        <textarea
          placeholder="Mô tả cửa hàng"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <br /><br />
        <input
          type="text"
          placeholder="Seller ID"
          value={sellerId}
          onChange={(e) => setSellerId(e.target.value)}
          required
        />
        <br /><br />
        <button type="submit">Tạo cửa hàng</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default CreateStore;
