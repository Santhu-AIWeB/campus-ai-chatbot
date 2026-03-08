import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            try {
                // Decode JWT payload (base64)
                const payload = JSON.parse(atob(token.split('.')[1]));
                // Check expiry
                if (payload.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    setUser({
                        id: payload.sub,
                        role: payload.role,
                        name: payload.name,
                        email: payload.email,
                        semester: payload.semester
                    });
                }
            } catch {
                logout();
            }
        }
    }, [token]);

    const login = (newToken, role) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        try {
            const payload = JSON.parse(atob(newToken.split('.')[1]));
            setUser({
                id: payload.sub,
                role,
                name: payload.name,
                email: payload.email,
                semester: payload.semester
            });
        } catch { }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
