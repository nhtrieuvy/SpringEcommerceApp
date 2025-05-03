import cookie from 'react-cookies';

const MyUserReducer = (currentState, action) => {
    // Nếu state hiện tại là undefined, trả về null
    if (currentState === undefined)
        return null;
    
    // Nếu action là undefined hoặc không có thuộc tính type, trả về state hiện tại
    if (!action || !action.type)
        return currentState;
    
    switch (action.type) {
        case 'LOGIN':
            return action.payload; 
        case 'LOGOUT':
            // Xóa toàn bộ dữ liệu phiên đăng nhập
            cookie.remove('token');
            cookie.remove('user');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return null;
        default:
            return currentState;
    }
}

export default MyUserReducer;