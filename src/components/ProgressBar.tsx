import { Box } from "@mui/material";
import { memo, useEffect, useRef } from "react";

type monotone = string;
type gradient = { from: string; to: string };
type ProgressBarProps = { fillType: monotone | gradient };

const ProgressBar = ({ fillType }: ProgressBarProps) => {
	const progressFillRef = useRef<HTMLDivElement>(null);

	console.log("hey");

	useEffect(() => {
		if (progressFillRef !== null) {
			setTimeout(() => {
				progressFillRef.current!.style.width = "50%";
			}, 600);
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
				// maxWidth: "700px",
				height: "15px",
				backgroundColor: "#ddd",
				borderRadius: "10px",
			}}
		>
			<Box ref={progressFillRef} sx={getFillType()} />
		</Box>
	);
};

const areEqual = (prev: Readonly<ProgressBarProps>, cur: Readonly<ProgressBarProps>) => {
	console.log("check?");

	if (typeof prev.fillType === "string" && typeof cur.fillType === "string") {
		return prev.fillType === cur.fillType;
	} else if (
		typeof prev.fillType !== "string" &&
		"from" in prev.fillType &&
		typeof cur.fillType !== "string" &&
		"from" in cur.fillType
	) {
		return prev.fillType.from === cur.fillType.from && prev.fillType.to === cur.fillType.to;
	} else {
		return false;
	}
};

const MemoizedProgressBar = memo(ProgressBar, areEqual);
export default MemoizedProgressBar;
