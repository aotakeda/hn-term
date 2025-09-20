/**
 * Extracts the modal key from a key binding string.
 * For example: "space+o" → "o", "ctrl+s" → "s"
 * @param keyBinding - The key binding string (e.g., "space+o")
 * @returns The modal key part or undefined if not found
 */
export const extractModalKey = (keyBinding?: string): string | undefined => {
  if (!keyBinding) return undefined;
  const parts = keyBinding.split('+');
  return parts.length > 1 ? parts[1] : undefined;
};

/**
 * Extracts modal keys from an array of key bindings.
 * Returns the modal key from the first binding that has one.
 * @param keyBindings - Array of key binding strings
 * @returns The first modal key found or undefined
 */
export const extractModalKeyFromBindings = (keyBindings: string[]): string | undefined => {
  for (const binding of keyBindings) {
    const modalKey = extractModalKey(binding);
    if (modalKey) return modalKey;
  }
  return undefined;
};