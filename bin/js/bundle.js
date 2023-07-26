(function () {
    'use strict';

    class BubbleMsg {
        constructor(content, pos, duration) {
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
        Shutdown() {
            Laya.Pool.recoverByClass(this.bubble.getChildAt(0));
            Laya.Pool.recoverByClass(this.bubble);
            this.bubble.removeChildren();
            this.bubble.removeSelf();
        }
    }

    var Coord = astar.Coord;
    var HoneycombSeeker = astar.HoneycombSeeker;
    var RoadNode = astar.RoadNode;
    var VisualStepType = astar.VisualStepType;
    class FindPathExample {
        constructor(root) {
            this.index = 0;
            this._root = root;
            this._gfx = new Laya.Sprite;
            this._root.addChild(this._gfx);
            this._gfx.visible = false;
            this._actor = new Laya.Sprite;
            this._actor.texture = Laya.loader.getRes("comp/actor.png");
            this._actor.pivot(this._actor.width * 0.5, this._actor.height);
            this._root.addChild(this._actor);
            this._actor.visible = false;
        }
        Move(mapData, startPoint, targetPoint) {
            console.log("move...");
            if (!mapData) {
                alert("地图数据为null!!!\n请生成地图后重试");
                return;
            }
            if (!startPoint || !startPoint.length || !targetPoint || !targetPoint.length) {
                alert("你需要添加起点和终点位置");
                return;
            }
            let seeker = new HoneycombSeeker(mapData);
            let startNode = seeker.GetRoadNodeByPosition(startPoint[0], startPoint[1]);
            let targetNode = seeker.GetRoadNodeByPosition(targetPoint[0], targetPoint[1]);
            if (!targetNode || !startNode) {
                alert(`开始节点和结束节点位置不对\nstartPoint:${startPoint[0]},${startPoint[1]}\ntargetPoint:${targetPoint[0]},${targetPoint[1]}\nmapData:${mapData.roadDataArr[0].length},${mapData.roadDataArr.length}`);
                return;
            }
            let paths = seeker.SeekPath(startNode, targetNode);
            this._actor.visible = true;
            let startPos = paths[0].position;
            this._actor.pos(startPos[0], startPos[1]);
            this.paths = paths;
            this.index = 1;
            console.log(paths);
            Laya.timer.frameLoop(1, this, this.Update);
        }
        Update() {
            let pos = this.paths[this.index].position;
            let actor = this._actor;
            let _x = pos[0] - actor.x;
            let _y = pos[1] - actor.y;
            let distance = Coord.Distance({ x: actor.x, y: actor.y }, { x: pos[0], y: pos[1] });
            let dirX = _x / distance;
            let dirY = _y / distance;
            let speed = 60;
            let newPosX = actor.x + dirX * speed * Laya.updateTimer.delta / 1000;
            let newPosY = actor.y + dirY * speed * Laya.updateTimer.delta / 1000;
            let newDistance = Coord.Distance({ x: newPosX, y: newPosY }, { x: pos[0], y: pos[1] });
            if (newDistance > distance || distance < 1e-2) {
                this.index++;
                if (this.index >= this.paths.length) {
                    Laya.timer.clear(this, this.Update);
                    new BubbleMsg("到达终点");
                }
            }
            this._actor.pos(newPosX, newPosY);
        }
        Simulation(mapData, startPoint, targetPoint) {
            console.log("simulation...");
            this._startPoint = startPoint;
            this._targetPoint = targetPoint;
            if (!mapData) {
                alert("地图数据为null!!!\n请生成地图后重试");
                return;
            }
            if (!startPoint || !startPoint.length || !targetPoint || !targetPoint.length) {
                alert("你需要添加起点和终点位置");
                return;
            }
            let seeker = new HoneycombSeeker(mapData);
            let startNode = seeker.GetRoadNodeByPosition(startPoint[0], startPoint[1]);
            let targetNode = seeker.GetRoadNodeByPosition(targetPoint[0], targetPoint[1]);
            if (!targetNode || !startNode) {
                alert(`开始节点和结束节点位置不对\nstartPoint:${startPoint[0]},${startPoint[1]}\ntargetPoint:${targetPoint[0]},${targetPoint[1]}\nmapData:${mapData.roadDataArr[0].length},${mapData.roadDataArr.length}`);
                return;
            }
            seeker.VisualSeekPathEveryStep(startNode, targetNode, { method: this.VisualStep, caller: this }, 50);
        }
        VisualStep(type, data, round) {
            if (data instanceof RoadNode) {
                if (this.lastRound && this.lastRound.length > 0) {
                    for (let i = 0; i < this.lastRound.length; i++) {
                        let r = this.lastRound[i];
                        if (r.x != this._targetPoint[0] || r.y != this._targetPoint[1])
                            this.editor.RemoveObstacles(r.x, r.y);
                    }
                }
                this.lastRound = [];
                if (round && round.length > 0) {
                    for (let i = 0; i < round.length; i++) {
                        let r = round[i];
                        this.lastRound.push(Coord.FromCoord(r));
                        this.editor.AddRound(r.x, r.y);
                    }
                }
                if (this.lastNode) {
                    this.editor.RemoveObstacles(this.lastNode.x, this.lastNode.y);
                    this.lastNode = null;
                }
                if (data.x != this._startPoint[0] || data.y != this._startPoint[1]) {
                    this.lastNode = Coord.FromCoord(data);
                    this.editor.AddCurrent(data.x, data.y);
                }
            }
            else if (type == VisualStepType.Final) {
                if (this.lastNode) {
                    this.editor.RemoveObstacles(this.lastNode.x, this.lastNode.y);
                    this.lastNode = null;
                }
                if (this.lastRound && this.lastRound.length > 0) {
                    for (let i = 0; i < this.lastRound.length; i++) {
                        let r = this.lastRound[i];
                        if (r.x != this._targetPoint[0] || r.y != this._targetPoint[1])
                            this.editor.RemoveObstacles(r.x, r.y);
                    }
                }
                this.lastRound = [];
                let path = data;
                this._gfx.visible = true;
                let gfx = this._gfx.graphics;
                let paths = [];
                for (let p of path)
                    paths.push(...p.position);
                gfx.clear(true);
                gfx.drawLines(0, 0, paths, "#ff0000", 2);
            }
        }
    }

    class HtmlUtils {
        static EnableDropFile(dropHandler) {
            dropHandler.once = false;
            function dragEnter(e) {
                e.stopPropagation();
                e.preventDefault();
            }
            function dragOver(e) {
                e.stopPropagation();
                e.preventDefault();
            }
            function drop(e) {
                e.preventDefault();
                var file = e.dataTransfer.files[0];
                var _type = file.type;
                if (_type.indexOf('image') > -1) {
                    var dataURL = URL.createObjectURL(file);
                    var img = new Image;
                    img.src = dataURL;
                    var fileName = file.name;
                    img.addEventListener("load", () => {
                        let tex2d = new Laya.Texture2D();
                        tex2d.loadImageSource(img);
                        setTimeout(() => {
                            let texture = Laya.Texture.create(tex2d, 0, 0, tex2d.width, tex2d.height);
                            Laya.loader.cacheRes(fileName, texture);
                            Laya.Loader.loadedMap[fileName] = texture;
                            dropHandler && dropHandler.runWith(fileName);
                        }, 100);
                    });
                }
                else if (_type.indexOf('json') > -1) {
                    console.log('文件：' + file.name);
                    var reader = new FileReader();
                    reader.onload = e => {
                        if (typeof reader.result == "string")
                            dropHandler.runWith(JSON.parse(reader.result));
                    };
                    reader.readAsText(file);
                }
                else {
                    console.log('文件：' + file.name);
                }
            }
            const dropBox = document;
            dropBox.addEventListener('dragenter', dragEnter, false);
            dropBox.addEventListener('dragover', dragOver, false);
            dropBox.addEventListener('drop', drop, false);
        }
        static DownloadTextFile(text, name) {
            const elementA = document.createElement('a');
            elementA.download = name;
            elementA.style.display = 'none';
            const blob = new Blob([text]);
            elementA.href = URL.createObjectURL(blob);
            document.body.appendChild(elementA);
            elementA.click();
            document.body.removeChild(elementA);
        }
        static DownloadZip(url, name) {
            window.open(url);
        }
    }

    class LogUtils {
        static Info(content, ...args) {
            console.log(`%c${content}`, "color:#eeee33;background:#000000;padding:3px 6px;", ...args);
        }
        static Warn(content, ...args) {
            console.log(`%c${content}`, "color:#ffff33;background:#000000;padding:3px 6px;", ...args);
        }
        static Error(content, ...args) {
            console.log(`%c${content}`, "color:#ff3333;background:#000000;padding:3px 6px;", ...args);
        }
    }

    var Scene = Laya.Scene;
    var REG = Laya.ClassUtils.regClass;
    var ui;
    (function (ui) {
        class MapEditorUI extends Scene {
            constructor() { super(); }
            createChildren() {
                super.createChildren();
                this.createView(MapEditorUI.uiView);
            }
        }
        MapEditorUI.uiView = { "type": "Scene", "props": { "width": 1280, "height": 720 }, "compId": 2, "child": [{ "type": "Image", "props": { "var": "img_desktopUI", "top": 0, "skin": "bg/bg2.png", "right": 0, "left": 0, "bottom": 0 }, "compId": 68 }, { "type": "Panel", "props": { "var": "scrollView", "top": 0, "right": 0, "left": 0, "bottom": 0 }, "compId": 11, "child": [{ "type": "Image", "props": { "var": "bg", "alpha": 1 }, "compId": 6 }] }, { "type": "Image", "props": { "var": "turnRightTop", "top": -4, "skin": "comp/triangleIcon.png", "scaleY": 0.3, "scaleX": 0.3, "right": -7 }, "compId": 13 }, { "type": "Image", "props": { "var": "turnLeftTop", "top": -4, "skin": "comp/triangleIcon.png", "scaleY": 0.3, "scaleX": -0.3, "left": 53 }, "compId": 14 }, { "type": "Image", "props": { "y": 724, "var": "turnLeftBottom", "skin": "comp/triangleIcon.png", "scaleY": -0.3, "scaleX": -0.3, "left": 53 }, "compId": 15 }, { "type": "Image", "props": { "y": 724, "var": "turnRightBottom", "skin": "comp/triangleIcon.png", "scaleY": -0.3, "scaleX": 0.3, "right": -7 }, "compId": 16 }, { "type": "TextInput", "props": { "y": 0, "x": 53, "width": 78, "var": "gridSize", "text": "30", "skin": "comp/textinput.png", "height": 26, "fontSize": 20, "bold": true, "sizeGrid": "9,0,10,0" }, "compId": 26 }, { "type": "Box", "props": { "y": 0, "x": 133, "var": "topMenu", "space": 4, "align": "top" }, "compId": 19, "child": [{ "type": "Button", "props": { "y": 0, "x": 4, "width": 84, "var": "btn_draw", "skin": "comp/button.png", "labelSize": 20, "labelFont": "Arial", "labelColors": "#fefefe,#ffffff,#fefefe", "label": "生成地图", "height": 26 }, "compId": 18 }, { "type": "Button", "props": { "y": 0, "x": 4, "width": 84, "var": "btn_addAbstacles", "skin": "comp/button.png", "labelSize": 20, "labelFont": "Arial", "labelColors": "#fefefe,#ffffff,#fefefe", "label": "添加障碍", "height": 26 }, "compId": 33 }, { "type": "Button", "props": { "y": 0, "x": 176, "width": 84, "var": "btn_removeAbstacles", "skin": "comp/button.png", "labelSize": 20, "labelFont": "Arial", "labelColors": "#fefefe,#ffffff,#fefefe", "label": "移除障碍", "height": 26 }, "compId": 34 }, { "type": "Button", "props": { "y": 0, "x": 176, "width": 134, "var": "btn_downloadMapdata", "skin": "comp/button.png", "sizeGrid": "14,20,14,16", "labelSize": 20, "labelFont": "Arial", "labelColors": "#fefefe,#ffffff,#fefefe", "label": "下载地图数据", "height": 26 }, "compId": 36 }, { "type": "Button", "props": { "y": 0, "x": 264, "width": 96, "var": "btn_addStart", "skin": "comp/button.png", "sizeGrid": "14,20,14,16", "labelSize": 20, "labelFont": "Arial", "labelColors": "#fefefe,#ffffff,#fefefe", "label": "添加起点", "height": 26 }, "compId": 37 }, { "type": "Button", "props": { "y": 0, "x": 264, "width": 96, "var": "btn_addTarget", "skin": "comp/button.png", "sizeGrid": "14,20,14,16", "labelSize": 20, "labelFont": "Arial", "labelColors": "#fefefe,#ffffff,#fefefe", "label": "添加终点", "height": 26 }, "compId": 38 }, { "type": "Button", "props": { "y": 0, "x": 402, "width": 96, "var": "btn_findPath", "skin": "comp/button.png", "sizeGrid": "14,20,14,16", "labelSize": 20, "labelFont": "Arial", "labelColors": "#fefefe,#ffffff,#fefefe", "label": "模拟寻路", "height": 26 }, "compId": 39 }, { "type": "Button", "props": { "y": 0, "x": 1007, "width": 130, "var": "btn_visualStep", "skin": "comp/button.png", "sizeGrid": "14,20,14,16", "labelSize": 20, "labelFont": "Arial", "labelColors": "#fefefe,#ffffff,#fefefe", "label": "查看寻路细节", "height": 26 }, "compId": 51 }, { "type": "Box", "props": { "y": 0, "x": 789, "width": 223, "scaleY": 0.5, "scaleX": 0.5, "renderType": "render", "height": 100 }, "compId": 46, "child": [{ "type": "HSlider", "props": { "y": 50, "width": 209, "var": "slider_k", "value": 50, "tick": 1, "skin": "comp/hslider.png", "showLabel": false, "min": 0, "max": 100, "height": 72, "centerX": 0, "allowClickBack": true }, "compId": 45 }, { "type": "Label", "props": { "y": 0, "x": 7, "var": "text_b", "text": "BFS", "fontSize": 30, "alpha": 1 }, "compId": 47 }, { "type": "Label", "props": { "y": 0, "var": "text_a", "text": "A", "fontSize": 30, "centerX": 0 }, "compId": 48 }, { "type": "Label", "props": { "y": 0, "var": "text_d", "text": "Dijkstra", "right": -43, "fontSize": 30 }, "compId": 49 }] }] }, { "type": "Box", "props": { "y": 694, "x": 133, "width": 1137, "var": "bottomMenu", "space": 4, "height": 26, "align": "top" }, "compId": 53, "child": [{ "type": "Button", "props": { "y": 0, "x": 4, "width": 84, "var": "btn_downAstartLib", "skin": "comp/button.png", "labelSize": 20, "labelFont": "Arial", "labelColors": "#fefefe,#ffffff,#fefefe", "label": "下载A*库", "height": 26 }, "compId": 54 }, { "type": "Button", "props": { "y": 0, "x": 4, "width": 84, "var": "btn_csdn", "skin": "comp/button.png", "labelSize": 20, "labelFont": "Arial", "labelColors": "#fefefe,#ffffff,#fefefe", "label": "使用教程", "height": 26 }, "compId": 67 }] }, { "type": "Label", "props": { "var": "text_newPlayerTip", "valign": "middle", "text": "请拖入背景图片\\n或者拖入地图JSON", "strokeColor": "#4081b9", "stroke": 8, "leading": 8, "fontSize": 64, "font": "Helvetica", "color": "#8abee7", "centerY": 0, "centerX": 0, "cacheAs": "bitmap", "bold": true, "align": "center" }, "compId": 40 }], "loadList": ["bg/bg2.png", "comp/triangleIcon.png", "comp/textinput.png", "comp/button.png", "comp/hslider.png"], "loadList3D": [] };
        ui.MapEditorUI = MapEditorUI;
        REG("ui.MapEditorUI", MapEditorUI);
    })(ui || (ui = {}));

    var RoadNode$1 = astar.RoadNode;
    var MapData = astar.MapData;
    var RoadType = astar.RoadType;
    var HexagonUtils = astar.HexagonUtils;
    var TouchBehaviorEnum;
    (function (TouchBehaviorEnum) {
        TouchBehaviorEnum[TouchBehaviorEnum["None"] = 0] = "None";
        TouchBehaviorEnum[TouchBehaviorEnum["AddObstacles"] = 1] = "AddObstacles";
        TouchBehaviorEnum[TouchBehaviorEnum["RemoveObstacles"] = 2] = "RemoveObstacles";
        TouchBehaviorEnum[TouchBehaviorEnum["AddStart"] = 3] = "AddStart";
        TouchBehaviorEnum[TouchBehaviorEnum["AddTarget"] = 4] = "AddTarget";
    })(TouchBehaviorEnum || (TouchBehaviorEnum = {}));
    class MapEditor extends ui.MapEditorUI {
        constructor() {
            super(...arguments);
            this._inited = false;
            this._behavior = TouchBehaviorEnum.None;
            this._startPoint = [];
            this._targetPoint = [];
            this._hexagonMap = [];
            this._enableTouchMap = false;
        }
        onOpened(param) {
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
                    HtmlUtils.DownloadZip("https://github.com/badApple001/astar-online-editor/raw/main/AStartSource/bin/astar_lib.zip", "astar_lib.zip");
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
                    RoadNode$1.k = k;
                    console.log("K: ", k);
                    this.text_a.alpha = k == 0.5 ? 1.0 : Math.abs(0.5 - k) * 0.5;
                    this.text_b.alpha = Math.max(0.2, Math.abs(1 - k));
                    this.text_d.alpha = Math.max(0.2, Math.abs(k));
                }, undefined, false);
                let front, back;
                for (let i = 1; i < this.topMenu.numChildren; i++) {
                    front = this.topMenu.getChildAt(i - 1);
                    back = this.topMenu.getChildAt(i);
                    back.x = front.x + front.width + 4;
                }
                for (let i = 1; i < this.bottomMenu.numChildren; i++) {
                    front = this.bottomMenu.getChildAt(i - 1);
                    back = this.bottomMenu.getChildAt(i);
                    back.x = front.x + front.width + 4;
                }
            }
        }
        onClosed(type) {
            super.onClosed(type);
            Laya.timer.clear(this, this.Update);
        }
        CreateMapData() {
            if (this._hexagonMap.length == 0) {
                alert("当前地图数据为null\n需要先点击生成地图");
                return null;
            }
            let mapData = new MapData();
            mapData.timestamp = Date.now();
            mapData.mapWidth = this.bg.width;
            mapData.mapHeight = this.bg.height;
            mapData.outerRadius = HexagonUtils.outerRadius;
            mapData.k = RoadNode$1.k;
            let roadData = [];
            for (let i = 0; i < this._hexagonMap.length; i++) {
                roadData[i] = [];
                for (let j = 0; j < this._hexagonMap[i].length; j++) {
                    roadData[i][j] = this._hexagonMap[i][j].fillColor == "#fefe00" ? RoadType.Obstacles : RoadType.Road;
                }
            }
            mapData.roadDataArr = roadData;
            return mapData;
        }
        DownloadMapData() {
            let mapData = this.CreateMapData();
            if (mapData) {
                let jsonStr = JSON.stringify(mapData);
                HtmlUtils.DownloadTextFile(jsonStr, "map_data.json");
            }
        }
        ClickDrawGrid(e) {
            if (!this.bg.skin || this.bg.skin == "") {
                alert("生成地图前,必须拖入背景图片文件");
                return;
            }
            let size = parseInt(this.gridSize.text, 10);
            if (isNaN(size)) {
                alert("格子数值不为number类型");
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
                    this._hexagonMap[i][j] = gfx.drawPoly((j + (i % 2) * 0.5) * HexagonUtils.innerRadius * 2, i * HexagonUtils.outerRadius / 2 * 3, HexagonUtils.ShareCorners(), undefined, "#fefe00", 2);
                }
            }
        }
        LoadMapByJson(jsonObj) {
            this.text_newPlayerTip.visible = false;
            HexagonUtils.outerRadius = jsonObj.outerRadius;
            RoadNode$1.k = jsonObj.k;
            console.log("hexmap outer radius: ", HexagonUtils.outerRadius);
            let gfx = this._bgGridSprite.graphics;
            this._hexagonMap = [];
            gfx.clear(true);
            let cols = jsonObj.roadDataArr[0].length;
            let lines = jsonObj.roadDataArr.length;
            for (let i = 0; i < lines; i++) {
                this._hexagonMap[i] = [];
                for (let j = 0; j < cols; j++) {
                    this._hexagonMap[i][j] = gfx.drawPoly((j + (i % 2) * 0.5) * HexagonUtils.innerRadius * 2, i * HexagonUtils.outerRadius / 2 * 3, HexagonUtils.ShareCorners(), jsonObj.roadDataArr[i][j] == RoadType.Road ? undefined : "#fefe00", "#fefe00", 2);
                }
            }
        }
        KeyDown(e) {
            if (e.keyCode == Laya.Keyboard.SPACE) {
                this._enableTouchMap = true;
                this.scrollView.mouseEnabled = true;
            }
            if (e.altKey) {
                this.bg.alpha = 0.8;
            }
        }
        KeyUp(e) {
            if (e.keyCode == Laya.Keyboard.SPACE) {
                this._enableTouchMap = false;
                this.scrollView.mouseEnabled = false;
            }
            if (!e.altKey) {
                this._gfx.clear(true);
                this.bg.alpha = 1.0;
                this.topMenu.visible = true;
                this.gridSize.visible = this.topMenu.visible;
                this._text_declaration.visible = true;
            }
        }
        Lock(e) {
            if (this._enableTouchMap)
                return;
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
        AddCurrent(cols, rows) {
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
        AddRound(cols, rows) {
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
        AddStart(cols, rows) {
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
        AddTarget(cols, rows) {
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
        AddObstacles(cols, rows) {
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
        RemoveObstacles(cols, rows) {
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
        MouseDown(e) {
            this._mouseX = e.stageX;
            this._mouseY = e.stageY;
            this._mouseMapX = this.scrollView.hScrollBar.value + this._mouseX;
            this._mouseMapY = this.scrollView.vScrollBar.value + this._mouseY;
            e.altKey && this.Lock(e);
        }
        MouseMove(e) {
            this._mouseX = e.stageX;
            this._mouseY = e.stageY;
            this._mouseMapX = this.scrollView.hScrollBar.value + this._mouseX;
            this._mouseMapY = this.scrollView.vScrollBar.value + this._mouseY;
            e.altKey && this.Lock(e);
        }
        MouseUp(e) {
            this._mouseX = e.stageX;
            this._mouseY = e.stageY;
            this._mouseMapX = this.scrollView.hScrollBar.value + this._mouseX;
            this._mouseMapY = this.scrollView.vScrollBar.value + this._mouseY;
            this._gfx.clear(true);
        }
        SetBg(skin) {
            this.bg.skin = skin;
            this.img_desktopUI.parent && this.img_desktopUI.removeSelf();
            this.text_newPlayerTip.visible = false;
            Laya.timer.once(100, this, this._SetBg);
        }
        _SetBg() {
            this.scrollView.refresh();
        }
        Update() {
            let info = this._text_declaration;
            info.text = `mouse stageX: ${this.mouseX}\nmouse stageY: ${this.mouseY}\nmouse mapX: ${Math.floor(this._mouseMapX)}\nmouse mapY: ${Math.floor(this._mouseMapY)}\n[快捷键]\n[space+🖱️]: 拖动地图`;
        }
    }

    class Entry {
        constructor() {
            Laya.stage.bgColor = "#59b7f4";
            this.editor = new MapEditor();
            this.editor.open();
            this.findpathDemp = new FindPathExample(this.editor.scrollView);
            this.findpathDemp.editor = this.editor;
            this.editor.findPathHandler = Laya.Handler.create(this.findpathDemp, this.findpathDemp.Move, undefined, false);
            this.editor.visualStepHandler = Laya.Handler.create(this.findpathDemp, this.findpathDemp.Simulation, undefined, false);
            HtmlUtils.EnableDropFile(Laya.Handler.create(this, fileName => {
                if (typeof fileName == "string")
                    this.editor.SetBg(fileName);
                else
                    this.editor.LoadMapByJson(fileName);
            }, undefined, false));
        }
    }

    class GameConfig {
        constructor() { }
        static init() {
            var reg = Laya.ClassUtils.regClass;
        }
    }
    GameConfig.width = 1280;
    GameConfig.height = 720;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "horizontal";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "MapEditor.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = false;
    GameConfig.init();

    class Main {
        constructor() {
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError(true);
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            Laya.loader.load("res/atlas/comp.atlas", Laya.Handler.create(this, () => {
                new Entry();
            }));
        }
    }
    new Main();

}());
