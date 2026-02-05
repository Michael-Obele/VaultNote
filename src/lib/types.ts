export type FileSystemItem = {
  name: string;
  path: string;
  kind: "file" | "directory";
  children?: FileSystemItem[]; // only for directories
};
