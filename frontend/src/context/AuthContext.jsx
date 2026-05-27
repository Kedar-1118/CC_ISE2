import { createContext, useContext, useState, useEffect } from 'react';
import { getMe, sendOtp as sendOtpApi, verifyOtp as verifyOtpApi, logout as logoutApi } from '../services/api';

const AuthContext = createContext(null);

/**
 * AuthProvider — Provides authentication state and methods to the app.
 *
 * On mount, checks for an existing session via GET /api/auth/me.
 * If a valid JWT cookie exists, the user is automatically logged in.
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data } = await getMe();
                setUser(data.data);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkSession();
    }, []);

    const sendOtp = async (email) => {
        const { data } = await sendOtpApi(email);
        return data;
    };

    const verifyOtp = async (email, otp) => {
        const { data } = await verifyOtpApi(email, otp);
        if (data.token) {
            localStorage.setItem('token', data.token);
        }
        setUser(data.data);
        return data;
    };

    const logout = async () => {
        try {
            await logoutApi();
        } finally {
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, sendOtp, verifyOtp, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
