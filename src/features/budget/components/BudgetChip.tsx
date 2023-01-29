import { SvgIconComponent } from "@mui/icons-material";
import FastfoodOutlinedIcon from "@mui/icons-material/FastfoodOutlined";
import LoopOutlinedIcon from "@mui/icons-material/LoopOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { Box } from "@mui/material";

export type ChipOptions = "groceries" | "entertainment" | "repeat";
type ChipVariant = {
	primaryHue: string;
	secondaryHue: string;
	icon: SvgIconComponent;
};
type ChipVariantList = Record<ChipOptions, ChipVariant>;
type ChipVariantHueList = Record<ChipOptions, Omit<ChipVariant, "icon">>;
type BudgetChipProps = { option: ChipOptions };

/**
 * primaryHue - darker
 * secondaryHue - lighter
 */
const variants: ChipVariantList = {
	groceries: {
		primaryHue: "#7329D1",
		secondaryHue: "#B9ADFF",
		icon: ShoppingCartOutlinedIcon,
	},
	entertainment: {
		primaryHue: "#D12929",
		secondaryHue: "#FFC1AD",
		icon: FastfoodOutlinedIcon,
	},
	repeat: {
		primaryHue: "#0AA780",
		secondaryHue: "#8CE4CF",
		icon: LoopOutlinedIcon,
	},
};

export const chipVariantHueList = Object.fromEntries(
	Object.entries(variants).map(([type, properties]) => {
		const { icon, ...hues } = properties;
		return [type, hues];
	})
) as ChipVariantHueList;

const BudgetChip = ({ option }: BudgetChipProps) => {
	const selectedOption = variants[option];
	const SelectedIcon = variants[option].icon;

	return (
		<Box
			component='span'
			sx={{
				backgroundColor: selectedOption.secondaryHue,
				width: "fit-content",
				height: "fit-content",
				padding: "15px 15px",
				display: "flex",
				borderRadius: "8px",
				boxShadow: "0 3px 6px 2px lightgray",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<SelectedIcon sx={{ color: selectedOption.primaryHue }} />
		</Box>
	);
};

export default BudgetChip;
