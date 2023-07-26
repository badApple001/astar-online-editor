module astar {
    export class HexagonUtils {
        private static _ratio = 0.5 * Math.sqrt(3);
        private static _outerRadius = 100;
        private static _shareCorners: number[];
        private static _nhDiv4: number;
        private static _proportion = Math.sqrt(3);

        public static set outerRadius(value: number) {
            if (!isNaN(value) && value != null && value != undefined && typeof value == "number" && value != HexagonUtils._outerRadius) {
                HexagonUtils._outerRadius = value;
                HexagonUtils.innerRadius = value * HexagonUtils._ratio;
                HexagonUtils._nhDiv4 = value / 2;
                HexagonUtils._shareCorners = HexagonUtils.GetCorners();
            }
        }
        public static get outerRadius() {
            return HexagonUtils._outerRadius;
        };
        public static innerRadius: number;
        public static ShareCorners() {
            return HexagonUtils._shareCorners;
        }
        public static GetCorners() {
            let outerRadius = HexagonUtils.outerRadius;
            let innerRadius = HexagonUtils.innerRadius;
            return [
                0, outerRadius,
                innerRadius, 0.5 * outerRadius,
                innerRadius, -0.5 * outerRadius,
                0, -outerRadius,
                -innerRadius, -0.5 * outerRadius,
                -innerRadius, 0.5 * outerRadius,
                0, outerRadius
            ];
        }
        public static GetWorldPointByPixel(x: number, y: number) {
            let px = x + HexagonUtils.innerRadius;
            let py = y + HexagonUtils.outerRadius;
            let nwDiv4Index = Math.floor(py / HexagonUtils._nhDiv4);
            let cy = Math.floor(nwDiv4Index / 3);
            let cx = Math.floor((px - (cy % 2) * HexagonUtils.innerRadius) / HexagonUtils.innerRadius / 2);
            if (!HexagonUtils.PtInHexagon(cx, cy, x, y)) {
                if (HexagonUtils.PtInHexagon(cx, cy - 1, x, y)) {
                    return [cx, cy - 1];
                }
                else if (HexagonUtils.PtInHexagon(cx + 1, cy, x, y)) {
                    return [cx + 1, cy];
                }
                else if (HexagonUtils.PtInHexagon(cx - 1, cy - 1, x, y)) {
                    return [cx - 1, cy - 1];
                }
                else if (HexagonUtils.PtInHexagon(cx + 1, cy - 1, x, y)) {
                    return [cx + 1, cy - 1];
                }
            }
            return [cx, cy];
        }
        public static PtInHexagon(cx: number, cy: number, px: number, py: number) {
            let pt = HexagonUtils.GetPixelByWorldPoint(cx, cy);
            var absX = Math.abs(px - pt[0]);
            var absY = Math.abs(py - pt[1]);
            if (absY >= HexagonUtils.outerRadius || absX >= HexagonUtils.innerRadius) {
                return false;
            }
            return HexagonUtils.outerRadius - absY > absX / HexagonUtils._proportion;
        }
        public static GetPixelByWorldPoint(cx: number, cy: number) {
            return [
                (cx + (cy % 2) * 0.5) * HexagonUtils.innerRadius * 2,
                cy * 1.5 * HexagonUtils.outerRadius
            ];
        }
    }
}