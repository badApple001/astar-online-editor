export class BubbleMsg {

    private bubble: Laya.Image;
    /**
     * 弹出提示
     * @param content 冒泡提示内容
     * @param pos 位置
     * @param duration 持续时间
     */
    constructor(content: string, pos?: { x: number, y: number }, duration?: number) {
        pos = pos || { x: Laya.stage.width / 2, y: Laya.stage.height / 2 };
        duration = duration || 3000;

        let label = Laya.Pool.createByClass(Laya.Label);
        let img = Laya.Pool.createByClass(Laya.Image);
        img.skin = "comp/label.png";
        img.x = pos.x;
        img.y = pos.y;
        img.addChild(label);
        img.anchorX = img.anchorY = 0.5;
        label.centerX = label.centerY = 0;
        label.fontSize = 32;
        label.text = content;
        img.width = label.get_width() + 20;
        img.height = label.get_height() + 4;
        Laya.stage.addChild(img);
        this.bubble = img;
        Laya.Tween.to(img, {
            y: img.y - 200
        }, duration, Laya.Ease.circOut);
        Laya.timer.once(duration, this, this.Shutdown);
    }

    private Shutdown() {
        Laya.Pool.recoverByClass(this.bubble.getChildAt(0));
        Laya.Pool.recoverByClass(this.bubble);
        this.bubble.removeChildren();
        this.bubble.removeSelf();
    }
}