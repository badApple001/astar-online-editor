import { BubbleMsg } from "./BubbleMsg";
import { MapEditor } from "./Visual/MapEditor";

import Coord = astar.Coord;
import HoneycombSeeker = astar.HoneycombSeeker;
import MapData = astar.MapData;
import RoadNode = astar.RoadNode;
import VisualStepType = astar.VisualStepType;


export class FindPathExample {

    private _root: Laya.Sprite;
    private _gfx: Laya.Sprite;
    private _actor: Laya.Sprite;
    public editor: MapEditor;
    constructor(root: Laya.Sprite) {
        this._root = root;
        this._gfx = new Laya.Sprite;
        this._root.addChild(this._gfx);
        this._gfx.visible = false;
        this._actor = new Laya.Sprite;
        this._actor.texture = Laya.loader.getRes("comp/actor.png");
        //this._actor.loadImage("comp/actor.png");
        this._actor.pivot(this._actor.width * 0.5, this._actor.height);
        this._root.addChild(this._actor);
        this._actor.visible = false;
    }


    public Move(mapData: MapData, startPoint: number[], targetPoint: number[]) {
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
    private index = 0;
    private paths: Readonly<RoadNode[]>;
    private Update() {
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


    private _startPoint: number[];
    private _targetPoint: number[];
    Simulation(mapData: MapData, startPoint: number[], targetPoint: number[]) {
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



    lastNode: Coord;
    lastRound: Coord[];
    VisualStep(type: VisualStepType, data: RoadNode | Array<RoadNode>, round: Array<RoadNode>) {

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
            if ( data.x != this._startPoint[0] || data.y != this._startPoint[1] ) {
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
            let paths: number[] = [];
            for (let p of path)
                paths.push(...p.position);
            gfx.clear(true);
            gfx.drawLines(0, 0, paths, "#ff0000", 2);
        }
    }

}