import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { endpoint } from "../configs/Apis";
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
  Link as MuiLink,
  InputLabel
} from "@mui/material";
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import { styled } from "@mui/system";

// Styled component cho icon
const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(1),
  '& .MuiSvgIcon-root': {
    fontSize: 40,
    color: theme.palette.secondary.main
  }
}));

// Styled component cho upload avatar
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "", email: "" });
  const [avatar, setAvatar] = useState(null);
  const [fileName, setFileName] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    if (e.target.files[0]) {
      setAvatar(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    // Tạo FormData để gửi cả file và dữ liệu text
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (avatar) formData.append("avatar", avatar);

    try {
      // Import APIs để sử dụng axios đã được cấu hình đúng
      import("../configs/Apis").then(async ({ default: API }) => {
        console.log("Đang gửi request đăng ký đến:", `http://localhost:8080${endpoint.REGISTER}`);

        try {
          const response = await API.post(endpoint.REGISTER, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });

          const data = response.data;
          console.log("Kết quả đăng ký:", data);

          if (data.success) {
            setMsg("Đăng ký thành công! Hãy đăng nhập.");
            setTimeout(() => navigate("/login"), 1500);
          } else {
            setMsg(data.message || "Đăng ký thất bại");
          }
        } catch (error) {
          console.error("Lỗi đăng ký:", error);
          setMsg("Không thể kết nối đến server");
        } finally {
          setLoading(false);
        }
      });
    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      setMsg("Không thể kết nối đến server");
      setLoading(false);
    }
  };

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
          <PersonAddAltIcon />
        </IconWrapper>

        <Typography component="h1" variant="h5" gutterBottom>
          Đăng ký tài khoản
        </Typography>

        {msg && (
          <Alert
            severity={msg.includes("thành công") ? "success" : "error"}
            sx={{ width: '100%', mb: 2 }}
          >
            {msg}
          </Alert>
        )}

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
            value={form.username}
            onChange={handleChange}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Mật khẩu"
            type="password"
            id="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
          />

          <Box sx={{ mt: 2, mb: 1 }}>
            <InputLabel htmlFor="avatar-upload" sx={{ mb: 1 }}>
              Ảnh đại diện (tùy chọn)
            </InputLabel>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ textTransform: 'none' }}
            >
              {fileName ? fileName : 'Chọn ảnh đại diện'}
              <VisuallyHiddenInput
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleFile}
              />
            </Button>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Đăng ký'}
          </Button>

          <Grid container justifyContent="center">
            <Grid item>
              <MuiLink component={Link} to="/login" variant="body2">
                {"Đã có tài khoản? Đăng nhập ngay"}
              </MuiLink>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}
