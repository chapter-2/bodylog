export const useAuth = () => {
    const user = useState<any>('user', () => null);
    const isAuthenticated = computed(() => !!user.value);
    
    const authCookie = useCookie('auth_token', {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax'
    });

    const checkAppStatus = async (): Promise<boolean> => {
        try {
            const res = await $fetch('/api/auth/status');
            // @ts-ignore
            return res.isSetup;
        } catch {
            return true; // Default ke aman (login) jika error
        }
    };

    const checkAuth = async () => {
        if (!authCookie.value) {
            user.value = null;
            return false;
        }
        try {
            const response = await $fetch('/api/auth/me');
            // @ts-ignore
            user.value = response.user;
            return true;
        } catch (error) {
            user.value = null;
            authCookie.value = null; 
            return false;
        }
    };

    if (process.client) {
        checkAuth();
    }

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            const response = await $fetch('/api/auth/login', {
                method: 'POST',
                body: { username, password } 
            });

            // @ts-ignore
            if (response.success) {
                // @ts-ignore
                authCookie.value = response.token;
                // @ts-ignore
                user.value = response.user;
                return true;
            }
            return false;
        } catch (error: any) {
            authCookie.value = null; 
            throw new Error(error.data?.message || "Login failed");
        }
    };

    const setupAccount = async (username: string, password: string): Promise<boolean> => {
        try {
            const response = await $fetch('/api/auth/setup', {
                method: 'POST',
                body: { username, password } 
            });

            // @ts-ignore
            if (response.success) {
                // @ts-ignore
                authCookie.value = response.token;
                // @ts-ignore
                user.value = response.user;
                return true;
            }
            return false;
        } catch (error: any) {
            authCookie.value = null;
            throw new Error(error.data?.message || "Setup failed");
        }
    };

    const logout = () => {
        user.value = null;
        authCookie.value = null;
        navigateTo('/login');
    };

    const secureFetch = async (url: string, options: any = {}) => {
        if (!authCookie.value) {
            throw createError({ statusCode: 401, message: "Unauthorized" });
        }
        return await $fetch(url, options);
    };

    return {
        user,
        isAuthenticated,
        checkAppStatus,
        checkAuth,
        login,
        setupAccount,
        logout,
        secureFetch
    };
};
