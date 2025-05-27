import React, { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Chip,
  Rating,
  Skeleton,
  Button,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import { defaultApi, endpoint, authApi } from "../configs/Apis";
import { formatCurrency } from '../utils/FormatUtils';

// Định nghĩa hàm API trực tiếp trong component
const addToCart = async (product, quantity = 1) => {
  try {
    const res = await authApi().post(endpoint.ADD_TO_CART, {
      productId: product.id,
      quantity: quantity,
    });

    // Dispatch custom event to notify components about cart update
    window.dispatchEvent(new CustomEvent("cartUpdated"));

    return res.data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

const ProductRecommendation = ({ cartItems, addToCartCallback }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        // Use direct API call instead of CartService
        const response = await defaultApi.get(endpoint.GET_RECOMMENDATIONS);
        setRecommendations(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setError("Không thể tải sản phẩm đề xuất. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [cartItems]);
  const handleAddToCart = async (product) => {
    try {
      // Use direct API function defined in this file
      await addToCart(product, 1);

      // Trigger callback to update parent component if provided
      if (addToCartCallback) {
        addToCartCallback(product);
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      // Ở đây có thể thêm thông báo lỗi cho người dùng nếu cần
    }
  };
  // Render loading skeletons
  const renderSkeletons = () => {
    return Array(4)
      .fill(0)
      .map((_, index) => (
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
          key={`skeleton-${index}`}
          data-testid={`skeleton-${index}`}
        >
          <Card
            elevation={0}
            sx={{
              height: "100%",
              borderRadius: 3,
              border: "1px solid rgba(0,0,0,0.05)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              overflow: "hidden",
            }}
          >
            <Skeleton variant="rectangular" height={180} animation="wave" />
            <CardContent>
              <Skeleton
                variant="text"
                height={24}
                width="80%"
                animation="wave"
              />
              <Skeleton
                variant="text"
                height={20}
                width="60%"
                animation="wave"
              />
              <Box
                sx={{ mt: 1, display: "flex", justifyContent: "space-between" }}
              >
                <Skeleton
                  variant="text"
                  height={32}
                  width="40%"
                  animation="wave"
                />
                <Skeleton
                  variant="circular"
                  height={36}
                  width={36}
                  animation="wave"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ));
  };

  if (error) {
    return (
      <Box sx={{ mt: 6 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: "bold", mb: 3 }}
        >
          Có thể bạn cũng thích
        </Typography>
        <Card
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            textAlign: "center",
            boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
          }}
        >
          <Typography color="error" variant="body1">
            {error}
          </Typography>
          <Button
            variant="text"
            color="primary"
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Thử lại
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
        Có thể bạn cũng thích
      </Typography>

      <Grid container spacing={3}>
        {loading ? (
          renderSkeletons()
        ) : recommendations.length > 0 ? (
          recommendations.map((product) => (
            <Grid item xs={12} sm={6} md={3} key={product.id}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  border: "1px solid rgba(0,0,0,0.05)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                  },
                  overflow: "hidden",
                }}
              >
                <CardActionArea
                  component={RouterLink}
                  to={`/products/${product.id}`}
                >
                  <CardMedia
                    component="img"
                    height="180"
                    image={product.image || "https://via.placeholder.com/300"}
                    alt={product.name}
                  />

                  {product.discount > 0 && (
                    <Chip
                      label={`-${product.discount}%`}
                      color="error"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        fontWeight: "bold",
                      }}
                    />
                  )}

                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      component="div"
                      sx={{
                        fontWeight: "medium",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        height: 48,
                      }}
                    >
                      {product.name}
                    </Typography>

                    <Box sx={{ mt: 1, display: "flex", alignItems: "center" }}>
                      <Rating
                        value={product.rating}
                        precision={0.1}
                        size="small"
                        readOnly
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        ({product.rating})
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        mt: 1,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="h6"
                          color="primary.main"
                          sx={{ fontWeight: "bold" }}
                        >                          {formatCurrency(
                            product.price ? product.price * (1 - (product.discount || 0) / 100) : 0
                          )}
                        </Typography>

                        {product.discount > 0 && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              textDecoration: "line-through",
                              display: "block",
                              mt: -0.5,
                            }}
                          >                            {formatCurrency(product.price || 0)}
                          </Typography>
                        )}
                      </Box>

                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{
                          minWidth: "auto",
                          borderRadius: "50%",
                          width: 36,
                          height: 36,
                          p: 0,
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                      >
                        <ShoppingCartIcon fontSize="small" />
                      </Button>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                textAlign: "center",
                boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
              }}
            >
              <Typography variant="body1">Chưa có sản phẩm đề xuất</Typography>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ProductRecommendation;
