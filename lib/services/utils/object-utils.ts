/**
 * Recursively remove undefined values from an object
 * Useful for preparing data for Firestore (which doesn't allow undefined values)
 */
export function removeUndefined(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => removeUndefined(item));
  }

  const cleaned: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = removeUndefined(obj[key]);
    }
  }
  return cleaned;
}
