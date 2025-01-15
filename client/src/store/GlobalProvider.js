import React, { useEffect, useState } from 'react';

export const GlobalContext = React.createContext({});

const GlobalProvider = ({ children }) => {
	const [currentPosition, setCurrentPosition] = useState({});

	useEffect(() => {
	}, []);

	return (
		<GlobalContext.Provider
			value={{
				currentPosition,
				setCurrentPosition
			}}
		>
			{children}
		</GlobalContext.Provider>
	);
};

export default GlobalProvider;
