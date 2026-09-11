export type SupportedUploadType = "pdf" | "jpeg" | "png" | "webp" | "gif";

const signatures: Record<SupportedUploadType, (buffer: Buffer) => boolean> = {
  pdf: (buffer) => buffer.subarray(0, 5).toString("ascii") === "%PDF-",
  jpeg: (buffer) => buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])),
  png: (buffer) => buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  webp: (buffer) => buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP",
  gif: (buffer) => ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString("ascii")),
};

export function hasFileSignature(buffer: Buffer, type: SupportedUploadType) {
  return signatures[type](buffer);
}

export function isExcelFile(name: string, mimeType: string) {
  const extension = name.toLowerCase().slice(name.lastIndexOf("."));
  return [".xls", ".xlsx"].includes(extension) && [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/octet-stream",
  ].includes(mimeType);
}

export function hasExcelSignature(buffer: Buffer, extension: string) {
  if (extension === ".xlsx") {
    return buffer.subarray(0, 2).equals(Buffer.from([0x50, 0x4b]));
  }
  return buffer.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
}