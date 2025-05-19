import { createContext, useContext } from "react";

export const MyUserContext = createContext();
export const MyDispatcherContext = createContext();

// Custom hook to make it easier to use the user context
export const useAuth = () => {
    const [user, dispatch] = useContext(MyUserContext);
    
    return {
        user,
        dispatch,
        isAuthenticated: !!user,
        // Helper method to get user ID safely
        getUserId: () => user && user.id ? user.id : null
    };
};