export function generateUniqueId(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const timestamp = Date.now().toString().slice(-4); // Kotlin'deki takeLast(4)
  const randomPart = Array.from({ length: 10 }, () =>
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join('');
  return timestamp + randomPart;
}