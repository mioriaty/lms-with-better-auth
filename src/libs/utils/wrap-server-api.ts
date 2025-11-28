function isRedirectError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }
  return (error as { digest?: string }).digest === 'NEXT_REDIRECT';
}

export async function wrapServerApi<T>(fnc: () => Promise<T>) {
  try {
    return await fnc();
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return null;
  }
}
