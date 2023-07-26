module astar {
    export class Coord {
        x: number;
        y: number;
        constructor(x: number = 0, y: number = 0) {
            this.x = x; this.y = y;
        }

        public static FromCoord(coord: Coord) {
            return new Coord(coord.x, coord.y);
        }

        /**
         * 计算实际像素距离
         * @param dest 
         * @returns 
         */
        Distance(dest: Coord) {
            return Coord.Distance(this, dest);
        }
        /**
         * 计算实际像素距离
         * @param src 
         * @param dest 
         * @returns 
         */
        public static Distance(src: { x: number, y: number }, dest: { x: number, y: number }) {
            return Math.sqrt((src.x - dest.x) * (src.x - dest.x) + (src.y - dest.y) * (src.y - dest.y));
        }
    }
}