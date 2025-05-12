import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Link } from 'react-router-dom';

const ProductSearch = () => {
  const [params, setParams] = useState({
    name: '',
    minPrice: '',
    maxPrice: '',
    storeId: '',
    sortBy: 'name',
    sortDir: 'asc',
    page: 0,
    size: 20
  });

  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);

  const fetchProducts = async () => {
    try {
      const res = await API.get('/products/search', { params });
      setProducts(res.data);
      // Nếu bạn dùng Spring Boot trả về Page thì thêm:
      // setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Lỗi khi gọi API:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [params]);

  const handleChange = (e) => {
    setParams({ ...params, [e.target.name]: e.target.value, page: 0 });
  };

  const changePage = (newPage) => {
    setParams({ ...params, page: newPage });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Tìm kiếm sản phẩm</h2>

      <div style={{ marginBottom: '1rem' }}>
        <input name="name" placeholder="Tên sản phẩm" onChange={handleChange} />
        <input name="minPrice" type="number" placeholder="Giá từ" onChange={handleChange} />
        <input name="maxPrice" type="number" placeholder="Giá đến" onChange={handleChange} />
        <input name="storeId" placeholder="ID cửa hàng" onChange={handleChange} />

        <select name="sortBy" onChange={handleChange}>
          <option value="name">Sắp xếp theo tên</option>
          <option value="price">Sắp xếp theo giá</option>
        </select>

        <select name="sortDir" onChange={handleChange}>
          <option value="asc">Tăng dần</option>
          <option value="desc">Giảm dần</option>
        </select>
      </div>

      <ul>
        {products.map(p => (
          <li key={p.id}>
            <strong>{p.name}</strong> - {p.price}₫
            <br />
            <Link to={`/review/product/${p.id}`}>Xem đánh giá</Link>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: '1rem' }}>
        {[...Array(totalPages).keys()].map((p) => (
          <button key={p} onClick={() => changePage(p)} disabled={p === params.page}>
            {p + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductSearch;
