import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import Logout from "@mui/icons-material/Logout";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import { Fragment, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function ProfileMenu() {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const navigate = useNavigate();
	const { logout } = useContext(AuthContext);

	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	const signOut = () => logout().then(() => navigate("/"));

	return (
		<Fragment>
			<Box sx={{ display: "flex", alignItems: "center", textAlign: "center" }}>
				<Tooltip title='Account settings'>
					<IconButton
						disableRipple
						color='secondary'
						sx={{
							borderRadius: "10px",
							backgroundColor: "white",
							marginLeft: "5px",
							border: "1px solid lightgray",
							"&:hover": { backgroundColor: "#f0f0f0" },
						}}
						onClick={handleClick}
					>
						<AccountCircleOutlinedIcon />
					</IconButton>
				</Tooltip>
			</Box>
			<Menu
				anchorEl={anchorEl}
				id='account-menu'
				open={open}
				onClose={handleClose}
				onClick={handleClose}
				PaperProps={{
					elevation: 0,
					sx: {
						overflow: "visible",
						filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
						mt: 1.5,
						"& .MuiAvatar-root": {
							width: 32,
							height: 32,
							ml: -0.5,
							mr: 1,
						},
						"&:before": {
							content: '""',
							display: "block",
							position: "absolute",
							top: 0,
							right: 14,
							width: 10,
							height: 10,
							bgcolor: "background.paper",
							transform: "translateY(-50%) rotate(45deg)",
							zIndex: 0,
						},
					},
				}}
				transformOrigin={{ horizontal: "right", vertical: "top" }}
				anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
			>
				<MenuItem onClick={handleClose}>
					<Avatar /> Profile
				</MenuItem>

				<Divider />

				<MenuItem onClick={signOut}>
					<ListItemIcon>
						<Logout fontSize='small' />
					</ListItemIcon>
					Logout
				</MenuItem>
			</Menu>
		</Fragment>
	);
}
