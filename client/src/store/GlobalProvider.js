import React, {useEffect, useState} from 'react';

export const GlobalContext = React.createContext({});

const GlobalProvider = ({ children }) => {
	const [currentSession, setCurrentSession] = useState(null);
	const [currentMenu, setCurrentMenu] = useState('dialog');
	const [currentMode, setCurrentMode] = useState('');

	useEffect(() => {
	}, []);

	return (
		<GlobalContext.Provider
			value={{
				currentSession,
				setCurrentSession,
				currentMenu,
				setCurrentMenu,
				currentMode,
				setCurrentMode
			}}
		>
			{children}
		</GlobalContext.Provider>
	);
};

export default GlobalProvider;
