export function getCookieValue(cookieHeader: string | null, cookieName: string): string | null {
    if (!cookieHeader) return null;
    const cookies = cookieHeader.split("; ").reduce((acc, cookie) => {
        const [name, value] = cookie.split("=");
        acc[name] = value;
        return acc;
    }, {} as Record<string, string>);
    return cookies[cookieName] || null;
}

export function saveCookie(name:string, value:string, days:number) {
    const date = new Date();
    date.setTime(date.getTime() + (days*24*60*60*1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/;Secure;SameSite=Lax";
}

export function deleteCookie(name:string) {
    document.cookie = name + "=; Max-Age=0; path=/;Secure;SameSite=Lax";
}