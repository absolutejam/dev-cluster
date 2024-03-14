export function base64(data: string): string {
  return Buffer.from(data, "utf-8").toString("base64");
}
