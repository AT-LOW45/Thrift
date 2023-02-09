import { createContext, ReactNode, useMemo, useState } from "react";

type Props = { children: ReactNode };

type DrawerCtx = {
	mobileOpen: boolean;
	modalOpen: boolean;
	handleModalToggle(): void
	handleDrawerToggle(): void;
};

const DrawerContext = createContext<DrawerCtx>({} as DrawerCtx);

export const DrawerContextProvider = ({ children }: Props): JSX.Element => {
	const [mobileOpen, setMobileOpen] = useState(false);
	const [modalOpen, setModalOpen] = useState(false)

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen);
	};

	const handleModalToggle = () => {
		setModalOpen(open => !open)
	}

	const memoizedContextProps = useMemo(
		() => ({ mobileOpen, handleDrawerToggle, modalOpen, handleModalToggle }),
		[mobileOpen, modalOpen]
	);

	return <DrawerContext.Provider value={memoizedContextProps}>{children}</DrawerContext.Provider>;
};

export default DrawerContext;
