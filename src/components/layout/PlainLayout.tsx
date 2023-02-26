import { Box, CssBaseline } from '@mui/material'
import React from 'react'
import { Outlet } from 'react-router-dom'

const PlainLayout = () => {
  return (
		<Box display='flex' sx={{ minHeight: "100vh", m: 0, backgroundColor: "#EEF4F5" }}>
			<CssBaseline />
			<Outlet></Outlet>
		</Box>
  );
}

export default PlainLayout