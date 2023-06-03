import React, {createContext, useState, ReactNode} from 'react';

interface SessionContextProps {
    username: string;
    user_uid: string;
    setSessionData: (username: string, userUid: string) => void;
}

export const SessionContext = createContext<SessionContextProps>({
    username: '',
    user_uid: '',
    setSessionData: () => {
    },
});

interface SessionProviderProps {
    children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({children}) => {
    const [username, setUsername] = useState('');
    const [userUid, setUserUid] = useState('');

    const setSessionData = (username: string, userUid: string) => {
        setUsername(username);
        setUserUid(userUid);
    };

    return (
        <SessionContext.Provider value={{username, user_uid: userUid, setSessionData}}>
            {children}
        </SessionContext.Provider>
    );
};
