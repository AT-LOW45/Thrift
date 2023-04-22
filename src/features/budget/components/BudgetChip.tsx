import { Box } from "@mui/material";
import { z as zod } from "zod";
import { SvgIconComponent } from "@mui/icons-material";
import FastfoodOutlinedIcon from "@mui/icons-material/FastfoodOutlined";
import LoopOutlinedIcon from "@mui/icons-material/LoopOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import GroupsIcon from "@mui/icons-material/Groups";
import SchoolIcon from "@mui/icons-material/School";
import CelebrationIcon from "@mui/icons-material/Celebration";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import HardwareIcon from "@mui/icons-material/Hardware";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import HomeIcon from "@mui/icons-material/Home";

export const ChipOptionsSchema = zod.union([
	zod.literal("groceries"),
	zod.literal("entertainment"),
	zod.literal("repeat"),
	zod.literal("crowdfund"),
	zod.literal("education"),
	zod.literal("food"),
	zod.literal("healthcare"),
	zod.literal("transportation"),
	zod.literal("hardware"),
	zod.literal("gift"),
	zod.literal("home improvement")
]);
export type ChipOptions = zod.infer<typeof ChipOptionsSchema>;
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
		primaryHue: "#e68305",
		secondaryHue: "#edd7bb",
		icon: CelebrationIcon,
	},
	education: {
		primaryHue: "#65BE45",
		secondaryHue: "#D5FD96",
		icon: SchoolIcon,
	},
	repeat: {
		primaryHue: "#0AA780",
		secondaryHue: "#8CE4CF",
		icon: LoopOutlinedIcon,
	},
	crowdfund: {
		primaryHue: "#1054e6",
		secondaryHue: "#97b1e8",
		icon: GroupsIcon,
	},
	food: {
		primaryHue: "#baab06",
		secondaryHue: "#ede695",
		icon: FastfoodOutlinedIcon,
	},
	healthcare: {
		primaryHue: "#D12929",
		secondaryHue: "#FFC1AD",
		icon: HealthAndSafetyIcon,
	},
	transportation: {
		primaryHue: "#0bd4b9",
		secondaryHue: "#98e3d9",
		icon: DirectionsCarIcon,
	},
	hardware: {
		primaryHue: "#18cc9f",
		secondaryHue: "#9ce6d3",
		icon: HardwareIcon,
	},
	gift: {
		primaryHue: "#d19b06",
		secondaryHue: "#f7d881",
		icon: CardGiftcardIcon,
	},
	"home improvement": {
		primaryHue: "#bd13e8",
		secondaryHue: "#d192e0",
		icon: HomeIcon,
	},
};

export const budgetTypes = Object.keys(variants).filter(
	(val) => val !== "crowdfund" && val !== "repeat"
);

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
