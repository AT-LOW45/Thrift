import { createContext, Dispatch, ReactNode, SetStateAction, useMemo, useState } from "react";

type Props = { children: ReactNode };

type DrawerCtx = {
	mobileOpen: boolean;
	setMobileOpen: Dispatch<SetStateAction<boolean>>;
	handleDrawerToggle(): void;
};

const defaultValue: DrawerCtx = {
	mobileOpen: false,
	setMobileOpen: (): void => {},
	handleDrawerToggle: (): void => {},
};

const DrawerContext = createContext<DrawerCtx>(defaultValue);

export const DrawerContextProvider = ({ children }: Props): JSX.Element => {
	const [mobileOpen, setMobileOpen] = useState(false);

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen);
	};

	const memoizedContextProps = useMemo(
		() => ({ mobileOpen, setMobileOpen, handleDrawerToggle }),
		[mobileOpen]
	);

	return <DrawerContext.Provider value={memoizedContextProps}>{children}</DrawerContext.Provider>;
};

export default DrawerContext;
