interface AuthenticationBridge {
  getCurrentUser: () => { uid?: string; email?: string; displayName?: string } | null;
}

declare global {
  interface Window {
    AuthenticationManager?: AuthenticationBridge;
  }
}

export function getImportActor(): string {
  try {
    const manager = window.AuthenticationManager ?? window.parent?.AuthenticationManager;
    const user = manager?.getCurrentUser?.();
    return user?.email || user?.displayName || user?.uid || "local-user";
  } catch {
    return "local-user";
  }
}
