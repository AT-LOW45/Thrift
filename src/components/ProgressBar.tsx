import { Box } from "@mui/material";
import { useEffect, useRef } from "react";

type monotone = string;
type gradient = { from: string; to: string };
type ProgressBarProps = { fillType: monotone | gradient; fillPercentage: number | undefined };

const ProgressBar = ({ fillType, fillPercentage }: ProgressBarProps) => {
	const progressFillRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (progressFillRef.current) {
			const style = progressFillRef.current.style;
			if (style) {
				setTimeout(() => {
					style.width = `${fillPercentage}%`;
				}, 600);
			}
		}
	}, []);

	const progressFillStyles = {
		height: "100%",
		transition: "width 0.5s cubic-bezier(.37,.59,.22,.92)",
		borderRadius: "inherit",
		width: 0,
	};

	const getFillType = () => {
		if (typeof fillType === "string") {
			return { backgroundColor: fillType, ...progressFillStyles };
		}
		return "from" in fillType
			? {
					backgroundImage: `linear-gradient(to left top, ${fillType.from}, ${fillType.to})`,
					...progressFillStyles,
			  }
			: { backgroundColor: "green", ...progressFillStyles };
	};

	return (
		<Box
			sx={{
				width: "100%",
				height: "15px",
				backgroundColor: "#ddd",
				borderRadius: "10px",
			}}
		>
			<Box ref={progressFillRef} sx={getFillType()} />
		</Box>
	);
};

export default ProgressBar;
