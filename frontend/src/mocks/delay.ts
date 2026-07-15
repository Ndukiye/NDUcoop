export function delay<T>(value: T, ms = 400 + Math.random() * 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
