module astar {
    export class RoadNode extends Coord {
        type: RoadType;

        /**
         * 当k=0时，f(n)= h(n) ，最佳优先算法；以距离目标最近为导向
         * 当k=1时，f(n)= g(n) ，迪杰斯特拉算法；以距离自己最近为导向
         * 当k=0.5时，f(n)=g(n)+h(n) ，A星算法; 以距离自己最近 + 距离目标最近 为导向
         * 
         * 无障碍物时，最佳优先算法的步骤和结果路径都是最优的
         * 有障碍物时，采用A*算法
         */
        public static k: number = 0.5;

        /**
         * G+H
         */
        get F(): number {
            return RoadNode.k * this.G + (1 - RoadNode.k) * this.H;
        }

        /**
         * 距离起点的代价
         */
        G: number = 0;
        /**
         * 距离终点的代价
         */
        H: number = 0;

        /**
         * 父节点
         */
        parent: RoadNode = null;

        /**
         * 通过终点计算 移动到起点的代价 和 移动到终点的代价
         * @param startNode 
         * @param targetNode 
         */
        CalcCost(startNode: RoadNode, targetNode: RoadNode) {
            this.G = this.Distance(startNode);
            this.H = this.Distance(targetNode);
        }

        constructor(x: number, y: number, type: RoadType) {
            super();
            this.x = x;
            this.y = y;
            this.type = type;
        }

        /**
         * 获取像素坐标 [x,y]
         */
        get position() {
            return HexagonUtils.GetPixelByWorldPoint(this.x, this.y);
        }

        get key(): number {
            //这个值可以根据实际情况来调整 
            //12位的最大存储值是4096  x,y不能超过4096 
            //你可以上调但要保证不能溢出 也可以根据实际情况 下调  
            return this.x << 12 | this.y;
        }
        /**
         * 可以通过key来反推出x,y坐标值
         * 静态方法
         * @param key 
         * @returns 
         */
        public static key2Coord(key: number) {
            return new Coord(key >> 12 & 0xfff, key & 0xfff);
        }


        public get gridX() {
            return this.x * 2 + this.y % 2;
        }
        public get gridY() {
            return this.y;
        }

        /**
         * 获取曼哈顿距离
         * @param dest 
         */
        public Distance(dest: RoadNode): number {

            //计算实际像素
            // let src = this.position;
            // let destPostion = dest.position;
            // return Coord.Distance(
            //     { x: src[0], y: src[1] },
            //     { x: destPostion[0], y: destPostion[1] });
            //计算曼哈顿距离
            return Math.abs(dest.gridX - this.gridX) + Math.abs(dest.gridY - this.gridY);
        }
    }
}