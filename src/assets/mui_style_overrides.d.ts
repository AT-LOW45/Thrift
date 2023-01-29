import { PaletteColor, PaletteColorOptions, TypographyVariants } from "@mui/material/styles";
import { CSSProperties } from "react";

declare module "@mui/material/styles" {
	export interface TypographyVariants {
		regularHeading: CSSProperties;
		regularSubHeading: CSSProperties;
		regularParagraph: Omit<CSSProperties, "fontSize">;
		regularLight: Pick<CSSProperties, "color" | "fontWeight" | "fontSize">;
		numberHeading: CSSProperties;
	}

	export interface Palette {
		tertiary: PaletteColor;
	}

	// allow configuration using `createTheme`
	export interface TypographyVariantsOptions {
		regularHeading: CSSProperties;
		regularSubHeading: CSSProperties;
		regularParagraph: Omit<CSSProperties, "fontSize">;
		regularLight: Pick<CSSProperties, "color" | "fontWeight" | "fontSize">;
		numberHeading: CSSProperties;
	}

	export interface PaletteOptions {
		tertiary: PaletteColorOptions;
	}
}

// Update the Typography's variant prop options
declare module "@mui/material/Typography" {
	export interface TypographyPropsVariantOverrides {
		regularHeading: true;
		regularSubHeading: true;
		regularParagraph: true;
		regularLight: true;
		numberHeading: true;
	}
}

declare module "@mui/material/Button" {
	export interface ButtonPropsColorOverrides {
		tertiary: true;
	}
}
