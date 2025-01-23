import React, { useEffect, useState } from 'react';

export const GlobalContext = React.createContext({});

const GlobalProvider = ({ children }) => {
	const [currentSession, setCurrentSession] = useState(null);

	useEffect(() => {
	}, []);

	return (
		<GlobalContext.Provider
			value={{
				currentSession,
				setCurrentSession
			}}
		>
			{children}
		</GlobalContext.Provider>
	);
};

export default GlobalProvider;
