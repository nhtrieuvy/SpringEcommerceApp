import React, { useContext, useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { endpoint } from "../configs/Apis";
import cookie from "react-cookies";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Grid,
  Link as MuiLink
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { styled } from "@mui/system";
import { MyUserContext } from "../configs/MyContexts";

// Styled component cho icon
const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(1),
  '& .MuiSvgIcon-root': {
    fontSize: 40,
    color: theme.palette.primary.main
  }
}));

export default function Login() {
  // Sử dụng destructuring trực tiếp để đảm bảo nhất quán với Header.js
  const [user, dispatch] = useContext(MyUserContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      // Import APIs để sử dụng axios đã được cấu hình đúng
      const { default: API } = await import("../configs/Apis");
      
      console.log("Đang gửi request đăng nhập đến:", `http://localhost:8080${endpoint.LOGIN}`);
      
      const response = await API.post(endpoint.LOGIN, {
        username: username,
        password: password
      });
      
      const data = response.data;
      console.log("Kết quả đăng nhập:", data);

      if (data.success && data.token) {
        console.log("Lưu token:", data.token);
        
        // Lưu token vào cả cookie và localStorage để đảm bảo
        cookie.save('token', data.token, {path: "/"});
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        dispatch({
          "type": "LOGIN",
          "payload": data.user
        });
        
        navigate("/");
      } else {
        setMsg(data.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      setMsg("Đăng nhập thất bại. Vui lòng kiểm tra lại tên đăng nhập và mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  if (user !== null) {
    return <Navigate to="/" />; // Sử dụng Navigate component thay vì navigate function
  }

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          mt: 8,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2
        }}
      >
        <IconWrapper>
          <LockOutlinedIcon />
        </IconWrapper>

        <Typography component="h1" variant="h5" gutterBottom>
          Đăng nhập
        </Typography>

        {msg && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{msg}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Tên đăng nhập"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Mật khẩu"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Đăng nhập'}
          </Button>

          <Grid container justifyContent="center">
            <Grid item>
              <MuiLink component={Link} to="/register" variant="body2">
                {"Chưa có tài khoản? Đăng ký ngay"}
              </MuiLink>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}
