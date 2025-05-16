import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Typography, Container, Box, Grid, Card, CardContent, CardMedia, Button } from "@mui/material";
import defaultApi from '../configs/Apis';

const Home = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await defaultApi.get('/api/products');
                setProducts(response.data);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchProducts();
    }, []);

    return (
        <Container maxWidth="lg">
            <Typography variant="h3" component="h1" gutterBottom>
                Welcome to Our E-commerce Store
            </Typography>
            <Grid container spacing={4}>
                {products.map((product) => (
                    <Grid item xs={12} sm={6} md={4} key={product.id}>
                        <Card>
                            <CardMedia
                                component="img"
                                height="140"
                                image={product.image || "https://via.placeholder.com/150"}
                                alt={product.name}
                            />
                            <CardContent>
                                <Typography variant="h5" component="div">
                                    {product.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {product.description}
                                </Typography>
                            </CardContent>
                            <Button component={Link} to={`/products/${product.id}`} variant="contained" color="primary">
                                View Details
                            </Button>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default Home;