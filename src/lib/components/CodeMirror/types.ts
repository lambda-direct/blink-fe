export interface FormatError {
    line: number;
    message: string;
}

export type CursorPosition = { line: number; col: number };

export type Formats = "json" | "env";
