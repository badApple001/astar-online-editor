declare module astar {
    class ArrayUtils {
        static Remove<T>(arr: T[], v: T): void;
        static Add<T>(arr: T[], v: T): void;
    }
}
declare module astar {
    class Coord {
        x: number;
        y: number;
        constructor(x?: number, y?: number);
        static FromCoord(coord: Coord): Coord;
        /**
         * 计算实际像素距离
         * @param dest
         * @returns
         */
        Distance(dest: Coord): number;
        /**
         * 计算实际像素距离
         * @param src
         * @param dest
         * @returns
         */
        static Distance(src: {
            x: number;
            y: number;
        }, dest: {
            x: number;
            y: number;
        }): number;
    }
}
declare module astar {
    class HexagonUtils {
        private static _ratio;
        private static _outerRadius;
        private static _shareCorners;
        private static _nhDiv4;
        private static _proportion;
        static outerRadius: number;
        static innerRadius: number;
        static ShareCorners(): number[];
        static GetCorners(): number[];
        static GetWorldPointByPixel(x: number, y: number): number[];
        static PtInHexagon(cx: number, cy: number, px: number, py: number): boolean;
        static GetPixelByWorldPoint(cx: number, cy: number): number[];
    }
}
declare module astar {
    enum VisualStepType {
        Final = 1,
        Step = 2
    }
    abstract class Seeker {
        mapData: MapData;
        currentMap: Array<Array<RoadNode>>;
        protected openList: RoadNode[];
        protected roundList: RoadNode[];
        protected trackList: RoadNode[];
        protected closeSet: {
            [key: number]: boolean;
        };
        protected openSet: {
            [key: number]: boolean;
        };
        protected AddClosed(r: RoadNode): void;
        protected IsClosed(r: RoadNode): boolean;
        protected AddOpen(r: RoadNode): void;
        protected IsOpened(r: RoadNode): boolean;
        protected RemoveOpen(r: RoadNode): void;
        protected abstract GetRoundNodeArray(r: Coord, startNode: RoadNode, targetNode: RoadNode): Array<RoadNode>;
        protected GetMinCostNode(list: RoadNode[]): RoadNode | null;
        constructor(mapData: MapData);
        /**
         * 获取路点
         * @param x
         * @param y
         * @returns RoadNode | null
         */
        GetRoadNodeByPosition(x: number, y: number): RoadNode | null;
        /**
         * 寻路
         * @param startNode
         * @param targetNode
         * @return 最短路径数组 | []
         */
        abstract SeekPath(startNode: RoadNode, targetNode: RoadNode): Readonly<Array<RoadNode>>;
        /**
         * 通过地图坐标寻路
         * @param startNode
         * @param targetNode
         * @return 最短路径数组 | []
         */
        abstract SeekPathByPixel(begin: {
            x: number;
            y: number;
        }, end: {
            x: number;
            y: number;
        }): Readonly<Array<RoadNode>>;
        /**
         * 如果没有寻到目标，则返回离目标最近的路径
         * @param startNode
         * @param targetNode
         * @return 起点到终点路径[] ｜ 起点到离终点最近的位置[]
         */
        abstract SeekPathNear(startNode: RoadNode, targetNode: RoadNode): Readonly<Array<RoadNode>>;
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
        abstract VisualSeekPathEveryStep(startNode: RoadNode, targetNode: RoadNode, handler: {
            method: Function;
            caller: any;
        }, time?: number): void;
    }
    class HoneycombSeeker extends Seeker {
        constructor(mapData: MapData);
        /**
         * 寻路前检测
         * @param startNode
         * @param targetNode
         * @returns true | false
         */
        private CheckValid;
        /**
         * 获取周围的节点
         * 可以行走路点 && 不在关闭列表
         * @param current
         * @returns
         */
        protected GetRoundNodeArray(current: RoadNode, startNode: RoadNode, targetNode: RoadNode): RoadNode[];
        /**
         * 通过地图坐标寻路
         * @param startNode
         * @param targetNode
         * @return 最短路径数组 | []
         */
        SeekPathByPixel(begin: {
            x: number;
            y: number;
        }, end: {
            x: number;
            y: number;
        }): Readonly<Array<RoadNode>>;
        /**
        * 寻路
        * @param startNode
        * @param targetNode
        * @return 最短路径数组 | []
        */
        SeekPath(startNode: RoadNode, targetNode: RoadNode): Readonly<Array<RoadNode>>;
        /**
         * 回溯路径
         * @param node
         */
        protected TrackPath(node: RoadNode): Array<RoadNode>;
        /**
         * 如果没有寻到目标，则返回离目标最近的路径
         * @param startNode
         * @param targetNode
         * @return 起点到终点路径[] ｜ 起点到离终点最近的位置[]
         */
        SeekPathNear(startNode: RoadNode, targetNode: RoadNode): Readonly<Array<RoadNode>>;
        /**
         * 检查每一步寻路状态
         * 每一步
         * @param startNode
         * @param targetNode
         * @param callback
         * @param target
         * @param time  默认值是100
         */
        VisualSeekPathEveryStep(startNode: RoadNode, targetNode: RoadNode, handler: {
            method: Function;
            caller: any;
        }, time?: number): void;
    }
}
declare module astar {
    class LogUtils {
        static Info(content: string, ...args: any[]): void;
        static Warn(content: string, ...args: any[]): void;
        static Error(content: string, ...args: any[]): void;
    }
}
declare module astar {
    enum RoadType {
        Obstacles = 0,
        Road = 1
    }
    class MapData {
        timestamp: number;
        mapWidth: number;
        mapHeight: number;
        outerRadius: number;
        /**
        * 当k=0时，f(n)= h(n) ，最佳优先算法；以距离目标最近为导向
        * 当k=1时，f(n)= g(n) ，迪杰斯特拉算法；以距离自己最近为导向
        * 当k=0.5时，f(n)=g(n)+h(n) ，A星算法; 以距离自己最近 + 距离目标最近 为导向
        *
        * 无障碍物时，最佳优先算法的步骤和结果路径都是最优的
        * 有障碍物时，采用A*算法
        */
        k: number;
        roadDataArr: RoadType[][];
    }
}
declare module astar {
    class RoadNode extends Coord {
        type: RoadType;
        /**
         * 当k=0时，f(n)= h(n) ，最佳优先算法；以距离目标最近为导向
         * 当k=1时，f(n)= g(n) ，迪杰斯特拉算法；以距离自己最近为导向
         * 当k=0.5时，f(n)=g(n)+h(n) ，A星算法; 以距离自己最近 + 距离目标最近 为导向
         *
         * 无障碍物时，最佳优先算法的步骤和结果路径都是最优的
         * 有障碍物时，采用A*算法
         */
        static k: number;
        /**
         * G+H
         */
        readonly F: number;
        /**
         * 距离起点的代价
         */
        G: number;
        /**
         * 距离终点的代价
         */
        H: number;
        /**
         * 父节点
         */
        parent: RoadNode;
        /**
         * 通过终点计算 移动到起点的代价 和 移动到终点的代价
         * @param startNode
         * @param targetNode
         */
        CalcCost(startNode: RoadNode, targetNode: RoadNode): void;
        constructor(x: number, y: number, type: RoadType);
        /**
         * 获取像素坐标 [x,y]
         */
        readonly position: number[];
        readonly key: number;
        /**
         * 可以通过key来反推出x,y坐标值
         * 静态方法
         * @param key
         * @returns
         */
        static key2Coord(key: number): Coord;
        readonly gridX: number;
        readonly gridY: number;
        /**
         * 获取曼哈顿距离
         * @param dest
         */
        Distance(dest: RoadNode): number;
    }
}
