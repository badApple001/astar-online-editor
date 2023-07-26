export class TextureUtils {



    public static getWhite(w: number, h: number, readEnable = false, hasAlphaChannel = false): Laya.Texture {
        let texture2d = new Laya.Texture2D(w, h, hasAlphaChannel ? Laya.TextureFormat.R8G8B8A8 : Laya.TextureFormat.R8G8B8, false, readEnable);
        let buffer = new ArrayBuffer(w * h * 4);
        let colors = new Uint8Array(buffer);
        for (let i = 0; i < w * h * 4; i++) {
            colors[i] = 255;
        }
        texture2d.setPixels(colors);
        return new Laya.Texture(texture2d);
    }

    

}