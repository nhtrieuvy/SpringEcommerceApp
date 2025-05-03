import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Stack,
  Divider,
  useTheme
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';

const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: theme.palette.grey[900],
        color: 'white'
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body1">
            &copy; {new Date().getFullYear()} E-commerce Website. All rights reserved.
          </Typography>
          
          <Typography variant="body2" sx={{ mt: 1 }}>
            Follow us on:
          </Typography>
          
          <Stack 
            direction="row" 
            spacing={3} 
            justifyContent="center" 
            sx={{ mt: 2 }}
          >
            <Link href="#" color="inherit" aria-label="Facebook">
              <FacebookIcon />
            </Link>
            <Link href="#" color="inherit" aria-label="Twitter">
              <TwitterIcon />
            </Link>
            <Link href="#" color="inherit" aria-label="Instagram">
              <InstagramIcon />
            </Link>
          </Stack>
          
          <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
          
          <Typography variant="caption" color="text.secondary" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Thiết kế bởi Triệu Vỹ
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;