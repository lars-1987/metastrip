declare module "piexifjs" {
  interface TagInfo {
    name: string;
    type: number;
  }

  const piexif: {
    load(dataUrl: string): Record<string, Record<string, unknown>>;
    dump(exifObj: Record<string, Record<string, unknown>>): string;
    insert(exifBytes: string, dataUrl: string): string;
    remove(dataUrl: string): string;
    TAGS: Record<string, Record<string, TagInfo>>;
    ImageIFD: Record<string, number>;
    ExifIFD: Record<string, number>;
    GPSIFD: Record<string, number>;
    InteropIFD: Record<string, number>;
  };

  export default piexif;
}
