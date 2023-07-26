module astar {
    export enum VisualStepType {

        Final = 1, //寻路完成  附带寻路结果的数组
        Step,//一步
    }
    export abstract class Seeker {
        //地图数据
        mapData: MapData;
        currentMap: Array<Array<RoadNode>>;
        protected openList: RoadNode[] = [];
        protected roundList: RoadNode[] = [];
        protected trackList: RoadNode[] = [];
        protected closeSet: { [key: number]: boolean } = {};
        protected openSet: { [key: number]: boolean } = {};
        protected AddClosed(r: RoadNode) {
            this.closeSet[r.key] = true;
            this.RemoveOpen(r);
        }
        protected IsClosed(r: RoadNode) {
            return this.closeSet[r.key];
        }
        protected AddOpen(r: RoadNode) {
            this.openSet[r.key] = true;
            this.closeSet[r.key] = false;
            ArrayUtils.Add(this.openList, r);
        }
        protected IsOpened(r: RoadNode) {
            return this.openSet[r.key];
        }
        protected RemoveOpen(r: RoadNode) {
            this.openSet[r.key] = false;
            ArrayUtils.Remove(this.openList, r);
        }
        protected abstract GetRoundNodeArray(r: Coord, startNode: RoadNode, targetNode: RoadNode): Array<RoadNode>;
        protected GetMinCostNode(list: RoadNode[]): RoadNode | null {
            let current = list[0];
            for (let r of list) {
                if (r.F < current.F) {
                    current = r;
                }
            }
            return current;
        }
        //构造方法中约束子类参数
        constructor(mapData: MapData) {
            this.mapData = mapData;
            HexagonUtils.outerRadius = mapData.outerRadius;
            let roadData = mapData.roadDataArr;
            let map = this.currentMap = [];
            for (let i = 0; i < roadData.length; i++) {
                map[i] = [];
                for (let j = 0; j < roadData[i].length; j++) {
                    map[i][j] = new RoadNode(j, i, roadData[i][j]);
                }
            }
        }


        /**
         * 获取路点
         * @param x 
         * @param y 
         * @returns RoadNode | null
         */
        public GetRoadNodeByPosition(x: number, y: number): RoadNode | null {
            if (y >= 0 && y < this.currentMap.length) {
                let lines = this.currentMap[y];
                if (x >= 0 && x < lines.length) {
                    return lines[x];
                }
            }
            return null;
        }

        /**
         * 寻路
         * @param startNode 
         * @param targetNode
         * @return 最短路径数组 | [] 
         */
        public abstract SeekPath(startNode: RoadNode, targetNode: RoadNode): Readonly<Array<RoadNode>>;

        /**
         * 通过地图坐标寻路
         * @param startNode 
         * @param targetNode
         * @return 最短路径数组 | [] 
         */
        public abstract SeekPathByPixel(begin: { x: number, y: number }, end: { x: number, y: number }): Readonly<Array<RoadNode>>;

        /**
         * 如果没有寻到目标，则返回离目标最近的路径
         * @param startNode
         * @param targetNode 
         * @return 起点到终点路径[] ｜ 起点到离终点最近的位置[]
         */
        public abstract SeekPathNear(startNode: RoadNode, targetNode: RoadNode): Readonly<Array<RoadNode>>;

        /**
         * 通过一个node 回溯到其root节点
         * 一般情况下 root节点就是起点  node传入的是终点
         * 但是 如果寻路不成功 回溯的就是离目标点最近的点到起点的路径
         * @param node 
         * @param 寻路结果
         */
        protected abstract TrackPath(node: RoadNode): Array<RoadNode>;

        /**
         * 检查每一步寻路状态
         * 每一步
         * @param startNode 
         * @param targetNode 
         * @param callback  参数列表 arg0:VisualStepType 阶段类型 arg1:附带数据
         * @param target 
         * @param time  默认值是100
         */
        public abstract VisualSeekPathEveryStep(startNode: RoadNode, targetNode: RoadNode, handler: { method: Function, caller: any }, time?: number): void;

    }
    const honeyRound1: number[][] = [
        [-1, 0],
        [0, -1],
        [1, -1],
        [1, 0],
        [1, 1],
        [0, 1]
    ];
    const honeyRound2: number[][] = [
        [-1, 0],
        [-1, -1],
        [0, -1],
        [1, 0],
        [0, 1],
        [-1, 1]
    ];
    export class HoneycombSeeker extends Seeker {


        constructor(mapData: MapData) {
            super(mapData);
        }

        /**
         * 寻路前检测
         * @param startNode 
         * @param targetNode 
         * @returns true | false
         */
        private CheckValid(startNode, targetNode): boolean {

            //检测地图的有效性
            if (!this.mapData || this.currentMap.length == 0) {
                LogUtils.Warn("地图数据为空!!");
                return false;
            }

            //检测起点和终点的有效性
            if (!startNode || !targetNode) {
                LogUtils.Warn("起点和终点不能为null!!", startNode, targetNode);
                return false;
            }

            //终点不能在障碍物上
            if (targetNode.type == RoadType.Obstacles) {
                LogUtils.Warn("终点不可到达!!", startNode, targetNode);
                return false;
            }

            return true;
        }


        /**
         * 获取周围的节点
         * 可以行走路点 && 不在关闭列表
         * @param current 
         * @returns 
         */
        protected GetRoundNodeArray(current: RoadNode, startNode: RoadNode, targetNode: RoadNode) {
            let roundList = this.roundList;
            roundList.length = 0;
            let honeyRound = current.y % 2 == 0 ? honeyRound2 : honeyRound1;
            for (let offset of honeyRound) {
                let lines = this.currentMap[offset[1] + current.y];
                if (lines) {
                    let node = lines[offset[0] + current.x];
                    if (node && node.type == RoadType.Road && !this.IsClosed(node)) {
                        node.CalcCost(startNode, targetNode);
                        roundList.push(node);
                    }
                }
            }
            return roundList;
        }

        /**
         * 通过地图坐标寻路
         * @param startNode 
         * @param targetNode
         * @return 最短路径数组 | [] 
         */
        public SeekPathByPixel(begin: { x: number, y: number }, end: { x: number, y: number }): Readonly<Array<RoadNode>> {
            let startNode = this.GetRoadNodeByPosition(begin.x, begin.y);
            let targetNode = this.GetRoadNodeByPosition(end.x, end.y);
            return this.SeekPath(startNode, targetNode);
        }

        /**
        * 寻路
        * @param startNode 
        * @param targetNode
        * @return 最短路径数组 | [] 
        */
        public SeekPath(startNode: RoadNode, targetNode: RoadNode): Readonly<Array<RoadNode>> {
            //初始化
            let openList = this.openList, roundList = this.roundList; this.closeSet = {}; this.openSet = {};
            openList.length = 0;

            //检测此次寻路的有效性
            if (!this.CheckValid(startNode, targetNode)) {
                return openList;
            }

            //寻路
            let current: RoadNode, cost2neighbor: number;
            this.AddOpen(startNode);
            while (openList.length != 0) {
                //获取代价最小的那个节点
                current = this.GetMinCostNode(openList);
                //如果是终点 则寻路结束
                if (current == targetNode) {
                    break;
                }
                //从候选列表中移除 添加到关闭列表中
                this.AddClosed(current);

                //获取当前节点周围节点
                this.GetRoundNodeArray(current, startNode, targetNode);
                for (let node of roundList) {
                    cost2neighbor = current.G + current.Distance(node);
                    if (!this.IsOpened(node) || cost2neighbor < node.G) {
                        node.G = cost2neighbor;
                        node.parent = current;
                        this.AddOpen(node);
                    }
                }
            }

            //回溯路径
            this.TrackPath(targetNode);
            return this.trackList;
        }

        /**
         * 回溯路径
         * @param node 
         */
        protected TrackPath(node: RoadNode): Array<RoadNode> {
            let trackList = this.trackList;
            trackList.length = 0;
            for (; node != null; node = node.parent) {
                // trackList.unshift(node);
                trackList.push(node);
            }
            trackList.reverse();
            //优化节点
            let _x: number, _y: number, j: number, l: RoadNode, m: RoadNode, r: RoadNode;
            for (let i = 1; i < trackList.length - 1; i++) {
                l = trackList[i - 1], m = trackList[i], r = trackList[i + 1];
                if (l.y == m.y &&
                    m.y == r.y) {
                    trackList.splice(i--, 1);
                    continue;
                }
                _x = 2 * (m.y % 2 + m.x * 2) - l.y % 2 - l.x * 2;
                _y = 2 * m.y - l.y;
                if (r.y % 2 + r.x * 2 == _x && r.y == _y) {
                    for (j = i + 1; j < trackList.length - 1; j++) {
                        l = trackList[j - 1], m = trackList[j], r = trackList[j + 1];
                        _x = 2 * (m.y % 2 + m.x * 2) - l.y % 2 - l.x * 2;
                        _y = 2 * m.y - l.y;
                        if (r.y % 2 + r.x * 2 != _x || r.y != _y) {
                            break;
                        }
                    }
                    trackList.splice(i, j - i--);
                }
            }
            return trackList;
        }

        /**
         * 如果没有寻到目标，则返回离目标最近的路径
         * @param startNode
         * @param targetNode 
         * @return 起点到终点路径[] ｜ 起点到离终点最近的位置[]
         */
        public SeekPathNear(startNode: RoadNode, targetNode: RoadNode): Readonly<Array<RoadNode>> {
            //TODO: 后续有这个需求再写 可以联系本人qq 331565861
            return this.trackList;
        }

        /**
         * 检查每一步寻路状态
         * 每一步
         * @param startNode 
         * @param targetNode 
         * @param callback 
         * @param target 
         * @param time  默认值是100
         */
        public VisualSeekPathEveryStep(startNode: RoadNode, targetNode: RoadNode, handler: { method: Function, caller: any }, time?: number): void {
            //初始化
            let openList = this.openList, roundList = this.roundList; this.closeSet = {}; this.openSet = {};
            openList.length = 0;
            time = time || 100;

            //检测此次寻路的有效性
            if (!this.CheckValid(startNode, targetNode)) {
                return;
            }

            //寻路
            let current: RoadNode, cost2neighbor: number;
            this.AddOpen(startNode);
            Laya.timer.clearAll(this);
            Laya.timer.loop(time, this, () => {
                if (openList.length == 0) {
                    Laya.timer.clearAll(this);
                    return;
                }

                //获取代价最小的那个节点
                current = this.GetMinCostNode(openList);
                //如果是终点 则寻路结束
                if (current == targetNode) {
                    Laya.timer.clearAll(this);
                    //回溯路径
                    this.TrackPath(targetNode);
                    handler.method.call(handler.caller, VisualStepType.Final, this.trackList);
                    return;
                }
                //从候选列表中移除 添加到关闭列表中
                this.AddClosed(current);

                //获取当前节点周围节点
                this.GetRoundNodeArray(current, startNode, targetNode);
                for (let node of roundList) {
                    cost2neighbor = current.G + current.Distance(node);
                    if (!this.IsOpened(node) || cost2neighbor < node.G) {
                        node.G = cost2neighbor;
                        node.parent = current;
                        this.AddOpen(node);
                    }
                }
                handler.method.call(handler.caller, VisualStepType.Step, current, roundList);
            });
        }
    }
}