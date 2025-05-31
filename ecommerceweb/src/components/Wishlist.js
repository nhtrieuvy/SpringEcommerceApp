import React, { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import AsyncPageWrapper from './AsyncPageWrapper';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Divider,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Breadcrumbs,
  Alert,
  Snackbar,
  Tooltip,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StoreIcon from "@mui/icons-material/Store";
import { useAuth } from "../configs/MyContexts";
import { useTheme } from "@mui/material/styles";
import { authApi, endpoint } from "../configs/Apis"; // Import authApi and endpoint
import { formatCurrency } from "../utils/FormatUtils";

const Wishlist = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Wishlist API Helper Functions (moved from Apis.js)
  const getWishlistItems = async () => {
    try {
      const res = await authApi().get(endpoint.GET_WISHLIST);
      return res.data;
    } catch (error) {
      console.error("Error fetching wishlist items:", error);
      throw error;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await authApi().delete(endpoint.REMOVE_FROM_WISHLIST(productId));
      window.dispatchEvent(new CustomEvent("wishlistUpdated"));
      return true;
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      throw error;
    }
  };
  const moveToCartFromWishlist = async (productId) => {
    try {
      const res = await authApi().post(
        endpoint.MOVE_TO_CART_FROM_WISHLIST(productId)
      );
      window.dispatchEvent(new CustomEvent("cartUpdated")); // Notify cart as well
      window.dispatchEvent(new CustomEvent("wishlistUpdated"));
      // Return true if status is OK (2xx), since backend returns ResponseEntity<Void>
      return res.status >= 200 && res.status < 300;
    } catch (error) {
      console.error("Error moving to cart from wishlist:", error);
      throw error;
    }
  };
  const moveAllToCartFromWishlist = async () => {
    try {
      const res = await authApi().post(endpoint.MOVE_ALL_TO_CART_FROM_WISHLIST);
      window.dispatchEvent(new CustomEvent("cartUpdated")); // Notify cart as well
      window.dispatchEvent(new CustomEvent("wishlistUpdated"));
      // Return true if status is OK (2xx), since backend returns ResponseEntity<Void>
      return res.status >= 200 && res.status < 300;
    } catch (error) {
      console.error("Error moving all to cart from wishlist:", error);
      throw error;
    }
  };

  // Load wishlist items
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const loadWishlistItems = async () => {
      try {
        setLoading(true);
        const items = await getWishlistItems(); // Use local function
        console.log("Wishlist items loaded:", JSON.stringify(items));
        setWishlistItems(items);
      } catch (error) {
        console.error("Error loading wishlist items:", error);
        setSnackbar({
          open: true,
          message: "Không thể tải danh sách yêu thích. Vui lòng thử lại.",
          severity: "error",
        });
        setWishlistItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadWishlistItems();

    // Listen for wishlist updates
    window.addEventListener("wishlistUpdated", loadWishlistItems);

    return () => {
      window.removeEventListener("wishlistUpdated", loadWishlistItems);
    };  }, [isAuthenticated, navigate]);
  
  // Remove item from wishlist
  const handleRemoveFromWishlist = async (productId) => {
    try {
      const success = await removeFromWishlist(productId); // Use local function

      if (success) {
        setSnackbar({
          open: true,
          message: "Sản phẩm đã được xóa khỏi danh sách yêu thích",
          severity: "success",
        });
      } else {
        throw new Error("Failed to remove item from wishlist");
      }
    } catch (error) {
      console.error("Error removing wishlist item:", error);
      setSnackbar({
        open: true,
        message: "Không thể xóa sản phẩm khỏi danh sách yêu thích",
        severity: "error",
      });
    }
  };
  // Move item to cart
  const moveToCart = async (productId) => {
    try {
      const success = await moveToCartFromWishlist(productId); // Use local function

      if (success) {
        setSnackbar({
          open: true,
          message: "Sản phẩm đã được thêm vào giỏ hàng",
          severity: "success",
        });
      } else {
        throw new Error("Failed to move item to cart");
      }
    } catch (error) {
      console.error("Error moving item to cart:", error);
      setSnackbar({
        open: true,
        message: "Không thể thêm sản phẩm vào giỏ hàng",
        severity: "error",
      });
    }
  };
  // Move all items to cart
  const moveAllToCart = async () => {
    try {
      const success = await moveAllToCartFromWishlist(); // Use local function

      if (success) {
        setSnackbar({
          open: true,
          message: "Tất cả sản phẩm đã được thêm vào giỏ hàng",
          severity: "success",
        });
      } else {
        throw new Error("Failed to move all items to cart");
      }
    } catch (error) {
      console.error("Error moving all items to cart:", error);
      setSnackbar({
        open: true,
        message: "Không thể thêm tất cả sản phẩm vào giỏ hàng",
        severity: "error",
      });
    }
  };
  // Clear wishlist
  const clearWishlist = async () => {
    try {
      // We don't have a direct clearWishlist API, so we'll remove items one by one
      const promises = wishlistItems.map((item) =>
        removeFromWishlist(item.product.id)
      ); // Use local function
      await Promise.all(promises);

      setSnackbar({
        open: true,
        message: "Danh sách yêu thích đã được xóa",
        severity: "success",
      });
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      setSnackbar({
        open: true,
        message: "Không thể xóa danh sách yêu thích",
        severity: "error",
      });
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Render empty wishlist
  const renderEmptyWishlist = () => (
    <Box sx={{ textAlign: "center", py: 6 }}>
      <FavoriteIcon
        sx={{ fontSize: 60, color: "text.secondary", opacity: 0.3, mb: 2 }}
      />
      <Typography variant="h5" gutterBottom>
        Danh sách yêu thích trống
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Bạn chưa thêm sản phẩm nào vào danh sách yêu thích
      </Typography>
      <Button
        variant="contained"
        component={RouterLink}
        to="/"
        startIcon={<StoreIcon />}
      >
        Tiếp tục mua sắm
      </Button>
    </Box>  );

  return (
    <AsyncPageWrapper isLoading={loading}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Button
          component={RouterLink}
          to="/"
          startIcon={<HomeIcon />}
          sx={{ textTransform: "none" }}
        >
          Trang chủ
        </Button>
        <Typography
          color="text.primary"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <FavoriteIcon sx={{ mr: 0.5 }} fontSize="small" />
          Danh sách yêu thích
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
          Danh sách yêu thích
        </Typography>

        <Box>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ArrowBackIcon />}
            component={RouterLink}
            to="/"
            sx={{ mr: 2 }}
          >
            Tiếp tục mua sắm
          </Button>

          {wishlistItems.length > 0 && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<ShoppingCartIcon />}
              onClick={moveAllToCart}
            >
              Thêm tất cả vào giỏ hàng
            </Button>
          )}
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <Typography>Đang tải...</Typography>
        </Box>
      ) : wishlistItems.length === 0 ? (
        renderEmptyWishlist()
      ) : (
        <>
          {/* Action buttons */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button
              variant="text"
              color="error"
              onClick={clearWishlist}
              startIcon={<DeleteIcon />}
            >
              Xóa tất cả
            </Button>
          </Box>

          {/* Wishlist items */}
          <Grid container spacing={3}>
            {wishlistItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
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
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box sx={{ position: "relative" }}>
                    {" "}
                    <CardMedia
                      component={RouterLink}
                      to={`/products/${item.product.id}`}
                      sx={{
                        height: 200,
                        backgroundSize: "contain",
                        cursor: "pointer",
                      }}
                      image={
                        item.product.image || "https://via.placeholder.com/300"
                      }
                      title={item.product.name}
                    />
                    {item.product.discount > 0 && (
                      <Chip
                        label={`-${item.product.discount}%`}
                        color="error"
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          fontWeight: "bold",
                        }}
                      />
                    )}{" "}
                    <IconButton
                      sx={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        bgcolor: "background.paper",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        "&:hover": {
                          bgcolor: "error.light",
                          color: "white",
                        },
                      }}
                      size="small"
                      onClick={() => handleRemoveFromWishlist(item.product.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <CardContent sx={{ flexGrow: 1 }}>
                    {" "}
                    <Typography
                      variant="subtitle1"
                      component={RouterLink}
                      to={`/products/${item.product.id}`}
                      sx={{
                        textDecoration: "none",
                        color: "text.primary",
                        fontWeight: "medium",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        height: 48,
                        "&:hover": {
                          color: "primary.main",
                        },
                      }}
                    >
                      {item.product.name}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {" "}
                      <Typography
                        variant="h6"
                        color="primary.main"
                        sx={{ fontWeight: "bold" }}
                      >
                        {formatCurrency(
                          item.product.price *
                            (1 - (item.product.discount || 0) / 100)
                        )}
                      </Typography>
                      {item.product.discount > 0 && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            textDecoration: "line-through",
                            display: "block",
                            mt: -0.5,
                          }}
                        >
                          {formatCurrency(item.product.price)}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<ShoppingCartIcon />}
                      onClick={() => moveToCart(item.product.id)}
                    >
                      Thêm vào giỏ hàng
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
    </AsyncPageWrapper>
  );
};

export default Wishlist;
