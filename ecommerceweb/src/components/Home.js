import React from "react";
import { Link } from "react-router-dom";
import { 
  Typography, 
  Container, 
  Box, 
  Button, 
  Paper,
  Grid
} from "@mui/material";

const Home = () => {
    return (
        <Container maxWidth="lg">
            <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 2 }}>
                <Box textAlign="center" py={4}>
                    <Typography variant="h3" component="h1" gutterBottom>
                        Welcome to Our E-commerce Store
                    </Typography>
                    <Typography variant="h6" color="textSecondary" paragraph>
                        Shop the latest products at unbeatable prices!
                    </Typography>
                    
                    <Grid container spacing={2} justifyContent="center" mt={3}>
                        <Grid item>
                            <Button 
                                component={Link} 
                                to="/login" 
                                variant="contained" 
                                color="primary" 
                                size="large"
                            >
                                Đăng nhập
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button 
                                component={Link} 
                                to="/register" 
                                variant="contained" 
                                color="secondary" 
                                size="large"
                            >
                                Đăng ký
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
}

export default Home;