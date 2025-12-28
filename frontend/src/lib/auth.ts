// src/lib/auth.ts
export const saveTokens = (token: string, refreshToken: string) => {
    if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
    }
};

export const clearTokens = () => {
    if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
    }
};

export const getToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("token");
    }
    return null;
};

export const logout = () => {
    clearTokens();
    if (typeof window !== "undefined") {
        window.location.href = "/user/login";
    }
};
