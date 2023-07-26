export class LogUtils {


    public static Info(content: string, ...args: any[]) {
        console.log(`%c${content}`, "color:#eeee33;background:#000000;padding:3px 6px;", ...args);
    }

    public static Warn(content: string, ...args: any[]) {
        console.log(`%c${content}`, "color:#ffff33;background:#000000;padding:3px 6px;", ...args);
    }

    public static Error(content: string, ...args: any[]) {
        console.log(`%c${content}`, "color:#ff3333;background:#000000;padding:3px 6px;", ...args);
    }
}