declare module "pdfkit" {
  import type { Readable } from "stream";

  interface PDFKitOptions {
    margin?: number;
    size?: string | [number, number];
    [key: string]: unknown;
  }

  interface TextOptions {
    align?: string;
    continued?: boolean;
    underline?: boolean;
    [key: string]: unknown;
  }

  class PDFDocument extends Readable {
    constructor(options?: PDFKitOptions);
    fontSize(size: number): this;
    fillColor(color: string): this;
    text(text: string, options?: TextOptions): this;
    moveDown(n?: number): this;
    end(): void;
    on(event: "data", fn: (chunk: Buffer) => void): this;
    on(event: "end" | "error", fn: (err?: Error) => void): this;
  }

  export = PDFDocument;
}
