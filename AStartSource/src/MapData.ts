module astar {
    export enum RoadType {
        Obstacles,
        Road,
    }
    export class MapData {
        public timestamp: number = 0;
        public mapWidth: number = 0;
        public mapHeight: number = 0;
        public outerRadius: number = 30;
        /**
        * 当k=0时，f(n)= h(n) ，最佳优先算法；以距离目标最近为导向
        * 当k=1时，f(n)= g(n) ，迪杰斯特拉算法；以距离自己最近为导向
        * 当k=0.5时，f(n)=g(n)+h(n) ，A星算法; 以距离自己最近 + 距离目标最近 为导向
        * 
        * 无障碍物时，最佳优先算法的步骤和结果路径都是最优的
        * 有障碍物时，采用A*算法
        */
        public k: number = 0.5;
        public roadDataArr: RoadType[][] = [];
    }
}