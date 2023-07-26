import { BubbleMsg } from "../BubbleMsg";
import { Camera2D } from "../Camera2D";
import { HtmlUtils } from "../HtmlUtils";
import { LogUtils } from "../LogUtils";
import { ui } from "../ui/layaMaxUI";
import RoadNode = astar.RoadNode;
import MapData = astar.MapData;
import RoadType = astar.RoadType;
import HexagonUtils = astar.HexagonUtils;

enum TouchBehaviorEnum {
    None,
    AddObstacles,
    RemoveObstacles,
    AddStart,
    AddTarget,
}
export class MapEditor extends ui.MapEditorUI {
    private _text_declaration: Laya.Label;
    private _gfx: Laya.Graphics;
    private _inited = false;
    private _bgGridSprite: Laya.Sprite;
    private _behavior: TouchBehaviorEnum = TouchBehaviorEnum.None;
    private _startPoint: number[] = [];
    private _targetPoint: number[] = [];
    public findPathHandler: Laya.Handler;
    public visualStepHandler: Laya.Handler;
    onOpened(param: any): void {
        super.onOpened(param);

        let edgeBottom = 0;
        this.turnLeftBottom.y = Laya.stage.height - edgeBottom;
        this.turnRightBottom.y = Laya.stage.height - edgeBottom;
        this.bottomMenu.y = Laya.stage.height - edgeBottom - this.bottomMenu.height;

        if (!this._text_declaration) {
            let declaration = this._text_declaration = new Laya.Label;
            declaration.fontSize = 20;
            declaration.color = "#ffffff";
            declaration.wordWrap = true;
            declaration.top = 100;
            declaration.right = 0;
            declaration.width = 200;
            this.addChild(declaration);
        }

        if (!this._gfx) {
            let sprite = new Laya.Sprite();
            this.addChild(sprite);
            this._gfx = sprite.graphics;
        }

        if (!this._inited) {
            this._inited = true;
            this.scrollView.hScrollBarSkin = "";
            this.scrollView.vScrollBarSkin = "";
            this.scrollView.mouseEnabled = false;
            Laya.timer.frameLoop(1, this, this.Update);
            this.on(Laya.Event.MOUSE_DOWN, this, this.MouseDown);
            this.on(Laya.Event.MOUSE_MOVE, this, this.MouseMove);
            this.on(Laya.Event.MOUSE_UP, this, this.MouseUp);

            Laya.stage.on(Laya.Event.KEY_DOWN, this, this.KeyDown);
            Laya.stage.on(Laya.Event.KEY_PRESS, this, this.KeyDown);
            Laya.stage.on(Laya.Event.KEY_UP, this, this.KeyUp);
            this.btn_addAbstacles.on(Laya.Event.CLICK, this, () => {
                if (this._hexagonMap.length == 0) {
                    alert("你需要先点击生成地图");
                    return;
                }
                this.btn_removeAbstacles.gray = false;
                this.btn_addAbstacles.gray = true;
                this._behavior = TouchBehaviorEnum.AddObstacles;
                new BubbleMsg("alt键 + 拖动鼠标\n添加障碍点", {
                    x: Laya.stage.width / 2,
                    y: Laya.stage.height / 2
                }, 3000);
            });
            this.btn_removeAbstacles.on(Laya.Event.CLICK, this, () => {
                if (this._hexagonMap.length == 0) {
                    alert("你需要先点击生成地图");
                    return;
                }
                this.btn_removeAbstacles.gray = true;
                this.btn_addAbstacles.gray = false;
                this._behavior = TouchBehaviorEnum.RemoveObstacles;
                new BubbleMsg("alt键 + 拖动鼠标\n移除障碍点", {
                    x: Laya.stage.width / 2,
                    y: Laya.stage.height / 2
                }, 3000);
            });
            this.btn_addStart.on(Laya.Event.CLICK, this, () => {
                if (this._hexagonMap.length == 0) {
                    alert("你需要先点击生成地图");
                    return;
                }
                if (this.btn_addStart.text.text == "添加起点") {
                    this.btn_addStart.text.text = "移除起点";
                    this._behavior = TouchBehaviorEnum.AddStart;
                    this.btn_addAbstacles.gray = true;
                    this.btn_removeAbstacles.gray = true;
                    new BubbleMsg("alt键 + 点击\n添加起点", {
                        x: Laya.stage.width / 2,
                        y: Laya.stage.height / 2
                    }, 3000);
                }
                else {
                    this.btn_addStart.text.text = "添加起点";
                    this._behavior = TouchBehaviorEnum.None;
                    this.btn_addAbstacles.gray = false;
                    this.btn_removeAbstacles.gray = false;
                    if (this._startPoint.length > 0) {
                        this.RemoveObstacles(this._startPoint[0], this._startPoint[1]);
                        this._startPoint.length = 0;
                        new BubbleMsg("起点已移除...", {
                            x: Laya.stage.width / 2,
                            y: Laya.stage.height / 2
                        }, 3000);
                    }
                }
            });
            this.btn_addTarget.on(Laya.Event.CLICK, this, () => {
                if (this._hexagonMap.length == 0) {
                    alert("你需要先点击生成地图");
                    return;
                }
                if (this.btn_addTarget.text.text == "添加终点") {
                    this.btn_addTarget.text.text = "移除终点";
                    this._behavior = TouchBehaviorEnum.AddTarget;
                    this.btn_addAbstacles.gray = true;
                    this.btn_removeAbstacles.gray = true;
                    new BubbleMsg("alt键 + 点击\n添加终点", {
                        x: Laya.stage.width / 2,
                        y: Laya.stage.height / 2
                    }, 3000);
                }
                else {
                    this.btn_addTarget.text.text = "添加终点";
                    this._behavior = TouchBehaviorEnum.None;
                    this.btn_addAbstacles.gray = false;
                    this.btn_removeAbstacles.gray = false;
                    if (this._targetPoint.length > 0) {
                        this.RemoveObstacles(this._targetPoint[0], this._targetPoint[1]);
                        this._targetPoint.length = 0;
                        new BubbleMsg("终点已移除...", {
                            x: Laya.stage.width / 2,
                            y: Laya.stage.height / 2
                        }, 3000);
                    }
                }
            });
            this.btn_findPath.on(Laya.Event.CLICK, this, () => {
                this.findPathHandler && this.findPathHandler.runWith([this.CreateMapData(), this._startPoint, this._targetPoint]);
            });
            this.btn_visualStep.on(Laya.Event.CLICK, this, () => {
                this.visualStepHandler && this.visualStepHandler.runWith([this.CreateMapData(), this._startPoint, this._targetPoint]);
            });
            this.btn_downloadMapdata.on(Laya.Event.CLICK, this, this.DownloadMapData);
            this.turnRightTop.on(Laya.Event.CLICK, this, () => {
                if (!this._enableTouchMap) {
                    this.scrollView.hScrollBar.value = (this.bg.width - Laya.stage.width) * 0.5;
                    this.scrollView.vScrollBar.value = 0;
                }
            });
            this.turnRightBottom.on(Laya.Event.CLICK, this, () => {
                if (!this._enableTouchMap) {
                    this.scrollView.hScrollBar.value = (this.bg.width - Laya.stage.width) * 0.5;
                    this.scrollView.vScrollBar.value = (this.bg.height - Laya.stage.height) * 0.5;
                }
            });
            this.turnLeftTop.on(Laya.Event.CLICK, this, () => {
                if (!this._enableTouchMap) {
                    this.scrollView.hScrollBar.value = 0;
                    this.scrollView.vScrollBar.value = 0;
                }
            });
            this.turnLeftBottom.on(Laya.Event.CLICK, this, () => {
                if (!this._enableTouchMap) {
                    this.scrollView.hScrollBar.value = 0;
                    this.scrollView.vScrollBar.value = (this.bg.height - Laya.stage.height) * 0.5;
                }
            });
            this.btn_downAstartLib.on(Laya.Event.CLICK, this, () => {
                HtmlUtils.DownloadZip("https://github.com/badApple001/astar-online-editor/raw/main/AStartSource/bin/astar_lib.zip","astar_lib.zip");
                LogUtils.Info("下载 A*库");
            });
            this.btn_csdn.on(Laya.Event.CLICK, this, () => {
                window.open("https://blog.csdn.net/qq_39162566/article/details/126552533");
                LogUtils.Info("前往csdn博客");
            });
            this.btn_draw.clickHandler = Laya.Handler.create(this, this.ClickDrawGrid, undefined, false);
            this._bgGridSprite = new Laya.Sprite;
            this.bg.addChild(this._bgGridSprite);
            this.slider_k.changeHandler = Laya.Handler.create(this, v => {
                let k = Math.floor(v / 100 * 10) / 10;
                RoadNode.k = k;
                console.log("K: ", k);

                this.text_a.alpha = k == 0.5 ? 1.0 : Math.abs(0.5 - k) * 0.5;
                this.text_b.alpha = Math.max(0.2, Math.abs(1 - k));
                this.text_d.alpha = Math.max(0.2, Math.abs(k));
            }, undefined, false);

            let front: Laya.Sprite, back: Laya.Sprite;
            for (let i = 1; i < this.topMenu.numChildren; i++) {
                front = this.topMenu.getChildAt(i - 1) as Laya.Sprite;
                back = this.topMenu.getChildAt(i) as Laya.Sprite;
                back.x = front.x + front.width + 4;  //4 : 间隔
            }
            for (let i = 1; i < this.bottomMenu.numChildren; i++) {
                front = this.bottomMenu.getChildAt(i - 1) as Laya.Sprite;
                back = this.bottomMenu.getChildAt(i) as Laya.Sprite;
                back.x = front.x + front.width + 4;  //4 : 间隔
            }
        }
    }

    onClosed(type?: any) {
        super.onClosed(type);
        Laya.timer.clear(this, this.Update);
    }

    private CreateMapData() {
        if (this._hexagonMap.length == 0) {
            alert("当前地图数据为null\n需要先点击生成地图");
            return null;
        }
        let mapData = new MapData();
        mapData.timestamp = Date.now();
        mapData.mapWidth = this.bg.width;
        mapData.mapHeight = this.bg.height;
        mapData.outerRadius = HexagonUtils.outerRadius;
        mapData.k = RoadNode.k;
        let roadData: RoadType[][] = [];
        for (let i = 0; i < this._hexagonMap.length; i++) {
            roadData[i] = [];
            for (let j = 0; j < this._hexagonMap[i].length; j++) {
                roadData[i][j] = this._hexagonMap[i][j].fillColor == "#fefe00" ? RoadType.Obstacles : RoadType.Road;
            }
        }
        mapData.roadDataArr = roadData;
        return mapData;
    }

    private DownloadMapData() {
        let mapData = this.CreateMapData();
        if (mapData) {
            let jsonStr = JSON.stringify(mapData);
            HtmlUtils.DownloadTextFile(jsonStr, "map_data.json");
        }
    }

    _hexagonMap: Laya.DrawPolyCmd[][] = [];
    private ClickDrawGrid(e: Laya.Event) {
        if (!this.bg.skin || this.bg.skin == "") {
            alert("生成地图前,必须拖入背景图片文件");
            return;
        }
        let size = parseInt(this.gridSize.text, 10);
        if (isNaN(size)) {
            alert("格子数值不为number类型")
            return;
        }
        HexagonUtils.outerRadius = size;
        console.log("hexmap outer radius: ", HexagonUtils.outerRadius);

        let gfx = this._bgGridSprite.graphics;
        this._hexagonMap = [];
        gfx.clear(true);

        let cols = Math.floor(this.bg.width / 2 / HexagonUtils.innerRadius) + 1;
        let lines = Math.floor(this.bg.height / 3 * 2 / HexagonUtils.outerRadius) + 1;
        console.log(`grid count: ${cols} x ${lines}`);
        if (cols > 4096 || lines > 4096) {
            alert("行数或者列数超过了4096，请调整格子大小！！！");
            if (lines > 4096) {
                lines = 4096;
                let outerRadius = this.bg.height / 3 * 2 / 4095;
                HexagonUtils.outerRadius = outerRadius;
                cols = Math.floor(this.bg.width / 2 / HexagonUtils.innerRadius) + 1;
            }
            if (cols > 4096) {
                cols = 4096;
                let innerRadius = this.bg.width / 2 / 4095;
                HexagonUtils.outerRadius = Math.floor(innerRadius / (0.5 * Math.sqrt(3)));
                lines = Math.floor(this.bg.height / 3 * 2 / HexagonUtils.outerRadius) + 1;
            }
            new BubbleMsg(`已为你自动调整格子大小!! \n当前格子数量: ${cols}x${lines}`, { x: Laya.stage.width, y: Laya.stage.height / 2 }, 4000);
        }

        for (let i = 0; i < lines; i++) {
            this._hexagonMap[i] = [];
            for (let j = 0; j < cols; j++) {
                this._hexagonMap[i][j] = gfx.drawPoly(
                    (j + (i % 2) * 0.5) * HexagonUtils.innerRadius * 2,
                    i * HexagonUtils.outerRadius / 2 * 3,
                    HexagonUtils.ShareCorners(), undefined, "#fefe00", 2);
            }
        }
    }
    public LoadMapByJson(jsonObj: MapData) {
        this.text_newPlayerTip.visible = false;

        HexagonUtils.outerRadius = jsonObj.outerRadius;
        RoadNode.k = jsonObj.k;
        console.log("hexmap outer radius: ", HexagonUtils.outerRadius);

        let gfx = this._bgGridSprite.graphics;
        this._hexagonMap = [];
        gfx.clear(true);

        let cols = jsonObj.roadDataArr[0].length;
        let lines = jsonObj.roadDataArr.length;

        for (let i = 0; i < lines; i++) {
            this._hexagonMap[i] = [];
            for (let j = 0; j < cols; j++) {
                this._hexagonMap[i][j] = gfx.drawPoly(
                    (j + (i % 2) * 0.5) * HexagonUtils.innerRadius * 2,
                    i * HexagonUtils.outerRadius / 2 * 3,
                    HexagonUtils.ShareCorners(), jsonObj.roadDataArr[i][j] == RoadType.Road ? undefined : "#fefe00", "#fefe00", 2);
            }
        }
    }

    _enableTouchMap = false;
    private KeyDown(e: Laya.Event) {
        if (e.keyCode == Laya.Keyboard.SPACE) {
            this._enableTouchMap = true;
            this.scrollView.mouseEnabled = true;
        }
        if (e.altKey) {
            this.bg.alpha = 0.8;
        }
    }
    private KeyUp(e: Laya.Event) {
        if (e.keyCode == Laya.Keyboard.SPACE) {
            this._enableTouchMap = false;
            this.scrollView.mouseEnabled = false;
        }
        if (!e.altKey) {
            this._gfx.clear(true);
            this.bg.alpha = 1.0;
            this.topMenu.visible = true; this.gridSize.visible = this.topMenu.visible;
            this._text_declaration.visible = true;
        }
    }

    _mouseX: number;
    _mouseY: number;
    _mouseMapX: number;
    _mouseMapY: number;
    private Lock(e: { stageX: number, stageY: number }) {
        if (this._enableTouchMap) return;

        this._gfx.clear(true);
        this._gfx.drawLine(0, e.stageY, Laya.stage.width, e.stageY, "#ff0000", 2);
        this._gfx.drawLine(e.stageX, 0, e.stageX, Laya.stage.height, "#ff0000", 2);

        this.topMenu.visible = e.stageY > 40;
        this.gridSize.visible = this.topMenu.visible;
        this._text_declaration.visible = e.stageX < this._text_declaration.x || e.stageY > (this._text_declaration.y + this._text_declaration.height);
        let pos = HexagonUtils.GetWorldPointByPixel(this._mouseMapX, this._mouseMapY);

        switch (this._behavior) {
            case TouchBehaviorEnum.AddObstacles:
                this.AddObstacles(pos[0], pos[1]);
                break;
            case TouchBehaviorEnum.AddStart:
                this.AddStart(pos[0], pos[1]);
                break;
            case TouchBehaviorEnum.AddTarget:
                this.AddTarget(pos[0], pos[1]);
                break;
            case TouchBehaviorEnum.RemoveObstacles:
                this.RemoveObstacles(pos[0], pos[1]);
                break;
            default:
                console.log(pos);
                break;
        }
    }

    public AddCurrent(cols: number, rows: number) {
        if (this._hexagonMap.length > 0) {
            let lines = this._hexagonMap[rows];
            if (lines) {
                let drawPolyCmd = lines[cols];
                if (drawPolyCmd) {
                    drawPolyCmd.fillColor = "#00ff33";
                }
            }
        }
    }
    public AddRound(cols: number, rows: number) {
        if (cols == this._targetPoint[0] && rows == this._targetPoint[1]) {
            return;
        }
        if (this._hexagonMap.length > 0) {
            let lines = this._hexagonMap[rows];
            if (lines) {
                let drawPolyCmd = lines[cols];
                if (drawPolyCmd) {
                    drawPolyCmd.fillColor = "#333333";
                }
            }
        }
    }
    private AddStart(cols: number, rows: number) {
        if (this._startPoint.length > 0) {
            this.RemoveObstacles(this._startPoint[0], this._startPoint[1]);
            this._startPoint.length = 0;
        }
        if (this._hexagonMap.length > 0) {
            let lines = this._hexagonMap[rows];
            if (lines) {
                let drawPolyCmd = lines[cols];
                if (drawPolyCmd) {

                    if (drawPolyCmd.fillColor == "#fefe00") {
                        this._startPoint = [];
                        new BubbleMsg("起点和终点不能在障碍区!", {
                            x: Laya.stage.width / 2,
                            y: Laya.stage.height / 2
                        }, 3000);
                        return;
                    }
                    drawPolyCmd.fillColor = "#0000ff";
                    this._startPoint = [cols, rows];
                }
            }
        }
    }
    private AddTarget(cols: number, rows: number) {
        if (this._targetPoint.length > 0) {
            this.RemoveObstacles(this._targetPoint[0], this._targetPoint[1]);
            this._targetPoint.length = 0;
        }
        if (this._hexagonMap.length > 0) {
            let lines = this._hexagonMap[rows];
            if (lines) {
                let drawPolyCmd = lines[cols];
                if (drawPolyCmd) {
                    if (drawPolyCmd.fillColor == "#fefe00") {
                        this._startPoint = [];
                        new BubbleMsg("起点和终点不能在障碍区!", {
                            x: Laya.stage.width / 2,
                            y: Laya.stage.height / 2
                        }, 3000);
                        return;
                    }
                    this._targetPoint = [cols, rows];
                    drawPolyCmd.fillColor = "#ff00ff";
                }
            }
        }
    }
    private AddObstacles(cols: number, rows: number) {
        if (this._hexagonMap.length > 0) {
            let lines = this._hexagonMap[rows];
            if (lines) {
                let drawPolyCmd = lines[cols];
                if (drawPolyCmd) {
                    drawPolyCmd.fillColor = "#fefe00";
                }
            }
        }
    }
    public RemoveObstacles(cols: number, rows: number) {
        if (this._hexagonMap.length > 0) {
            let lines = this._hexagonMap[rows];
            if (lines) {
                let drawPolyCmd = lines[cols];
                if (drawPolyCmd) {
                    drawPolyCmd.fillColor = undefined;
                }
            }
        }
    }
    private MouseDown(e: Laya.Event) {
        this._mouseX = e.stageX;
        this._mouseY = e.stageY;
        this._mouseMapX = this.scrollView.hScrollBar.value + this._mouseX;
        this._mouseMapY = this.scrollView.vScrollBar.value + this._mouseY;
        e.altKey && this.Lock(e);
    }
    private MouseMove(e: Laya.Event) {
        this._mouseX = e.stageX;
        this._mouseY = e.stageY;
        this._mouseMapX = this.scrollView.hScrollBar.value + this._mouseX;
        this._mouseMapY = this.scrollView.vScrollBar.value + this._mouseY;
        e.altKey && this.Lock(e);
    }
    private MouseUp(e: Laya.Event) {
        this._mouseX = e.stageX;
        this._mouseY = e.stageY;
        this._mouseMapX = this.scrollView.hScrollBar.value + this._mouseX;
        this._mouseMapY = this.scrollView.vScrollBar.value + this._mouseY;
        this._gfx.clear(true);
    }

    SetBg(skin: string) {
        this.bg.skin = skin;
        this.img_desktopUI.parent && this.img_desktopUI.removeSelf();
        this.text_newPlayerTip.visible = false;
        Laya.timer.once(100, this, this._SetBg);
    }

    private _SetBg() {
        this.scrollView.refresh();
    }

    private Update() {
        let info = this._text_declaration;
        info.text = `mouse stageX: ${this.mouseX}\nmouse stageY: ${this.mouseY}\nmouse mapX: ${Math.floor(this._mouseMapX)}\nmouse mapY: ${Math.floor(this._mouseMapY)}\n[快捷键]\n[space+🖱️]: 拖动地图`;
    }

}

