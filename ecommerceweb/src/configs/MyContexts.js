import { createContext, useContext } from "react";

export const MyUserContext = createContext();
export const MyDispatcherContext = createContext();


export const useAuth = () => {
    const [user, dispatch] = useContext(MyUserContext);
    
    return {
        user,
        dispatch,
        isAuthenticated: !!user,
        
        getUserId: () => user && user.id ? user.id : null
    };
};