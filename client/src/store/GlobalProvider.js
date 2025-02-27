import React, { useEffect, useState } from 'react';

export const GlobalContext = React.createContext({});

const GlobalProvider = ({ children }) => {
	const [currentSession, setCurrentSession] = useState(null);
	const [currentMenu, setCurrentMenu] = useState('dialog');
	const [toggle, setToggle] = useState(true);

	const onToggle = (delay=1200) => {
		setToggle(false);
		setTimeout(() => {
			setToggle(true);
		}, delay);
	};

	useEffect(() => {
	}, []);

	return (
		<GlobalContext.Provider
			value={{
				currentSession,
				setCurrentSession,
				currentMenu,
				setCurrentMenu,
				toggle,
				onToggle
			}}
		>
			{children}
		</GlobalContext.Provider>
	);
};

export default GlobalProvider;

export const useDelayToggle = () => {
	const context = React.useContext(GlobalContext);
	if (!context) {
		throw new Error("useDelayToggle must be used within a GlobalProvider");
	}
	return context;
};
