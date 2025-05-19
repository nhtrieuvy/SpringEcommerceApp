import React, { useState } from 'react';
import { authApi } from '../configs/Apis';

const CreateProduct = () => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    quantity: '',
    category: '',
    storeId: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const product = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity),
        image: form.image,
        category: { id: form.category },
        store: { id: form.storeId }
      };

      await authApi().post('/api/products', product);
      setMessage('Đăng sản phẩm thành công!');
      setForm({ name: '', description: '', price: '', image: '', quantity: '', category: '', storeId: '' });
    } catch (err) {
      setMessage('Lỗi khi đăng sản phẩm');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Đăng sản phẩm mới</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Tên sản phẩm" value={form.name} onChange={handleChange} required /><br /><br />
        <textarea name="description" placeholder="Mô tả" value={form.description} onChange={handleChange} /><br /><br />
        <input name="price" type="number" placeholder="Giá" value={form.price} onChange={handleChange} required /><br /><br />
        <input name="image" placeholder="Link ảnh" value={form.image} onChange={handleChange} /><br /><br />
        <input name="quantity" type="number" placeholder="Số lượng" value={form.quantity} onChange={handleChange} /><br /><br />
        <input name="category" placeholder="ID danh mục" value={form.category} onChange={handleChange} /><br /><br />
        <input name="storeId" placeholder="ID cửa hàng" value={form.storeId} onChange={handleChange} required /><br /><br />
        <button type="submit">Đăng sản phẩm</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default CreateProduct;
