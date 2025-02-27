import React, {useState} from 'react';

export const WebContext = React.createContext({});

const WebProvider = ({ children }) => {
	const [formData, setFormData] = useState({});

	return (
		<WebContext.Provider
			value={{
				formData,
				setFormData
			}}
		>
			{children}
		</WebContext.Provider>
	);
};

export default WebProvider;
