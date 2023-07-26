"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var astar;
(function (astar) {
    var ArrayUtils = /** @class */ (function () {
        function ArrayUtils() {
        }
        ArrayUtils.Remove = function (arr, v) {
            var index = arr.indexOf(v);
            index != -1 && arr.splice(index, 1);
        };
        ArrayUtils.Add = function (arr, v) {
            var index = arr.indexOf(v);
            index == -1 && arr.push(v);
        };
        return ArrayUtils;
    }());
    astar.ArrayUtils = ArrayUtils;
})(astar || (astar = {}));
var astar;
(function (astar) {
    var Coord = /** @class */ (function () {
        function Coord(x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this.x = x;
            this.y = y;
        }
        Coord.FromCoord = function (coord) {
            return new Coord(coord.x, coord.y);
        };
        /**
         * 计算实际像素距离
         * @param dest
         * @returns
         */
        Coord.prototype.Distance = function (dest) {
            return Coord.Distance(this, dest);
        };
        /**
         * 计算实际像素距离
         * @param src
         * @param dest
         * @returns
         */
        Coord.Distance = function (src, dest) {
            return Math.sqrt((src.x - dest.x) * (src.x - dest.x) + (src.y - dest.y) * (src.y - dest.y));
        };
        return Coord;
    }());
    astar.Coord = Coord;
})(astar || (astar = {}));
var astar;
(function (astar) {
    var HexagonUtils = /** @class */ (function () {
        function HexagonUtils() {
        }
        Object.defineProperty(HexagonUtils, "outerRadius", {
            get: function () {
                return HexagonUtils._outerRadius;
            },
            set: function (value) {
                if (!isNaN(value) && value != null && value != undefined && typeof value == "number" && value != HexagonUtils._outerRadius) {
                    HexagonUtils._outerRadius = value;
                    HexagonUtils.innerRadius = value * HexagonUtils._ratio;
                    HexagonUtils._nhDiv4 = value / 2;
                    HexagonUtils._shareCorners = HexagonUtils.GetCorners();
                }
            },
            enumerable: true,
            configurable: true
        });
        ;
        HexagonUtils.ShareCorners = function () {
            return HexagonUtils._shareCorners;
        };
        HexagonUtils.GetCorners = function () {
            var outerRadius = HexagonUtils.outerRadius;
            var innerRadius = HexagonUtils.innerRadius;
            return [
                0, outerRadius,
                innerRadius, 0.5 * outerRadius,
                innerRadius, -0.5 * outerRadius,
                0, -outerRadius,
                -innerRadius, -0.5 * outerRadius,
                -innerRadius, 0.5 * outerRadius,
                0, outerRadius
            ];
        };
        HexagonUtils.GetWorldPointByPixel = function (x, y) {
            var px = x + HexagonUtils.innerRadius;
            var py = y + HexagonUtils.outerRadius;
            var nwDiv4Index = Math.floor(py / HexagonUtils._nhDiv4);
            var cy = Math.floor(nwDiv4Index / 3);
            var cx = Math.floor((px - (cy % 2) * HexagonUtils.innerRadius) / HexagonUtils.innerRadius / 2);
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
        };
        HexagonUtils.PtInHexagon = function (cx, cy, px, py) {
            var pt = HexagonUtils.GetPixelByWorldPoint(cx, cy);
            var absX = Math.abs(px - pt[0]);
            var absY = Math.abs(py - pt[1]);
            if (absY >= HexagonUtils.outerRadius || absX >= HexagonUtils.innerRadius) {
                return false;
            }
            return HexagonUtils.outerRadius - absY > absX / HexagonUtils._proportion;
        };
        HexagonUtils.GetPixelByWorldPoint = function (cx, cy) {
            return [
                (cx + (cy % 2) * 0.5) * HexagonUtils.innerRadius * 2,
                cy * 1.5 * HexagonUtils.outerRadius
            ];
        };
        HexagonUtils._ratio = 0.5 * Math.sqrt(3);
        HexagonUtils._outerRadius = 100;
        HexagonUtils._proportion = Math.sqrt(3);
        return HexagonUtils;
    }());
    astar.HexagonUtils = HexagonUtils;
})(astar || (astar = {}));
var astar;
(function (astar) {
    var VisualStepType;
    (function (VisualStepType) {
        VisualStepType[VisualStepType["Final"] = 1] = "Final";
        VisualStepType[VisualStepType["Step"] = 2] = "Step";
    })(VisualStepType = astar.VisualStepType || (astar.VisualStepType = {}));
    var Seeker = /** @class */ (function () {
        //构造方法中约束子类参数
        function Seeker(mapData) {
            this.openList = [];
            this.roundList = [];
            this.trackList = [];
            this.closeSet = {};
            this.openSet = {};
            this.mapData = mapData;
            astar.HexagonUtils.outerRadius = mapData.outerRadius;
            var roadData = mapData.roadDataArr;
            var map = this.currentMap = [];
            for (var i = 0; i < roadData.length; i++) {
                map[i] = [];
                for (var j = 0; j < roadData[i].length; j++) {
                    map[i][j] = new astar.RoadNode(j, i, roadData[i][j]);
                }
            }
        }
        Seeker.prototype.AddClosed = function (r) {
            this.closeSet[r.key] = true;
            this.RemoveOpen(r);
        };
        Seeker.prototype.IsClosed = function (r) {
            return this.closeSet[r.key];
        };
        Seeker.prototype.AddOpen = function (r) {
            this.openSet[r.key] = true;
            this.closeSet[r.key] = false;
            astar.ArrayUtils.Add(this.openList, r);
        };
        Seeker.prototype.IsOpened = function (r) {
            return this.openSet[r.key];
        };
        Seeker.prototype.RemoveOpen = function (r) {
            this.openSet[r.key] = false;
            astar.ArrayUtils.Remove(this.openList, r);
        };
        Seeker.prototype.GetMinCostNode = function (list) {
            var e_1, _a;
            var current = list[0];
            try {
                for (var list_1 = __values(list), list_1_1 = list_1.next(); !list_1_1.done; list_1_1 = list_1.next()) {
                    var r = list_1_1.value;
                    if (r.F < current.F) {
                        current = r;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (list_1_1 && !list_1_1.done && (_a = list_1.return)) _a.call(list_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return current;
        };
        /**
         * 获取路点
         * @param x
         * @param y
         * @returns RoadNode | null
         */
        Seeker.prototype.GetRoadNodeByPosition = function (x, y) {
            if (y >= 0 && y < this.currentMap.length) {
                var lines = this.currentMap[y];
                if (x >= 0 && x < lines.length) {
                    return lines[x];
                }
            }
            return null;
        };
        return Seeker;
    }());
    astar.Seeker = Seeker;
    var honeyRound1 = [
        [-1, 0],
        [0, -1],
        [1, -1],
        [1, 0],
        [1, 1],
        [0, 1]
    ];
    var honeyRound2 = [
        [-1, 0],
        [-1, -1],
        [0, -1],
        [1, 0],
        [0, 1],
        [-1, 1]
    ];
    var HoneycombSeeker = /** @class */ (function (_super) {
        __extends(HoneycombSeeker, _super);
        function HoneycombSeeker(mapData) {
            return _super.call(this, mapData) || this;
        }
        /**
         * 寻路前检测
         * @param startNode
         * @param targetNode
         * @returns true | false
         */
        HoneycombSeeker.prototype.CheckValid = function (startNode, targetNode) {
            //检测地图的有效性
            if (!this.mapData || this.currentMap.length == 0) {
                astar.LogUtils.Warn("地图数据为空!!");
                return false;
            }
            //检测起点和终点的有效性
            if (!startNode || !targetNode) {
                astar.LogUtils.Warn("起点和终点不能为null!!", startNode, targetNode);
                return false;
            }
            //终点不能在障碍物上
            if (targetNode.type == astar.RoadType.Obstacles) {
                astar.LogUtils.Warn("终点不可到达!!", startNode, targetNode);
                return false;
            }
            return true;
        };
        /**
         * 获取周围的节点
         * 可以行走路点 && 不在关闭列表
         * @param current
         * @returns
         */
        HoneycombSeeker.prototype.GetRoundNodeArray = function (current, startNode, targetNode) {
            var e_2, _a;
            var roundList = this.roundList;
            roundList.length = 0;
            var honeyRound = current.y % 2 == 0 ? honeyRound2 : honeyRound1;
            try {
                for (var honeyRound_1 = __values(honeyRound), honeyRound_1_1 = honeyRound_1.next(); !honeyRound_1_1.done; honeyRound_1_1 = honeyRound_1.next()) {
                    var offset = honeyRound_1_1.value;
                    var lines = this.currentMap[offset[1] + current.y];
                    if (lines) {
                        var node = lines[offset[0] + current.x];
                        if (node && node.type == astar.RoadType.Road && !this.IsClosed(node)) {
                            node.CalcCost(startNode, targetNode);
                            roundList.push(node);
                        }
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (honeyRound_1_1 && !honeyRound_1_1.done && (_a = honeyRound_1.return)) _a.call(honeyRound_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return roundList;
        };
        /**
         * 通过地图坐标寻路
         * @param startNode
         * @param targetNode
         * @return 最短路径数组 | []
         */
        HoneycombSeeker.prototype.SeekPathByPixel = function (begin, end) {
            var startNode = this.GetRoadNodeByPosition(begin.x, begin.y);
            var targetNode = this.GetRoadNodeByPosition(end.x, end.y);
            return this.SeekPath(startNode, targetNode);
        };
        /**
        * 寻路
        * @param startNode
        * @param targetNode
        * @return 最短路径数组 | []
        */
        HoneycombSeeker.prototype.SeekPath = function (startNode, targetNode) {
            var e_3, _a;
            //初始化
            var openList = this.openList, roundList = this.roundList;
            this.closeSet = {};
            this.openSet = {};
            openList.length = 0;
            //检测此次寻路的有效性
            if (!this.CheckValid(startNode, targetNode)) {
                return openList;
            }
            //寻路
            var current, cost2neighbor;
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
                try {
                    for (var roundList_1 = __values(roundList), roundList_1_1 = roundList_1.next(); !roundList_1_1.done; roundList_1_1 = roundList_1.next()) {
                        var node = roundList_1_1.value;
                        cost2neighbor = current.G + current.Distance(node);
                        if (!this.IsOpened(node) || cost2neighbor < node.G) {
                            node.G = cost2neighbor;
                            node.parent = current;
                            this.AddOpen(node);
                        }
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (roundList_1_1 && !roundList_1_1.done && (_a = roundList_1.return)) _a.call(roundList_1);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            }
            //回溯路径
            this.TrackPath(targetNode);
            return this.trackList;
        };
        /**
         * 回溯路径
         * @param node
         */
        HoneycombSeeker.prototype.TrackPath = function (node) {
            var trackList = this.trackList;
            trackList.length = 0;
            for (; node.parent != null; node = node.parent) {
                // trackList.unshift(node);
                trackList.push(node);
            }
            trackList.push(node);
            trackList.reverse();
            //优化节点
            var _x, _y, j, l, m, r;
            for (var i = 1; i < trackList.length - 1; i++) {
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
        };
        /**
         * 如果没有寻到目标，则返回离目标最近的路径
         * @param startNode
         * @param targetNode
         * @return 起点到终点路径[] ｜ 起点到离终点最近的位置[]
         */
        HoneycombSeeker.prototype.SeekPathNear = function (startNode, targetNode) {
            return this.trackList;
        };
        /**
         * 检查每一步寻路状态
         * 每一步
         * @param startNode
         * @param targetNode
         * @param callback
         * @param target
         * @param time  默认值是100
         */
        HoneycombSeeker.prototype.VisualSeekPathEveryStep = function (startNode, targetNode, handler, time) {
            var _this = this;
            //初始化
            var openList = this.openList, roundList = this.roundList;
            this.closeSet = {};
            this.openSet = {};
            openList.length = 0;
            time = time || 100;
            //检测此次寻路的有效性
            if (!this.CheckValid(startNode, targetNode)) {
                return;
            }
            //寻路
            var current, cost2neighbor;
            this.AddOpen(startNode);
            Laya.timer.clearAll(this);
            Laya.timer.loop(time, this, function () {
                var e_4, _a;
                if (openList.length == 0) {
                    Laya.timer.clearAll(_this);
                    return;
                }
                //获取代价最小的那个节点
                current = _this.GetMinCostNode(openList);
                //如果是终点 则寻路结束
                if (current == targetNode) {
                    Laya.timer.clearAll(_this);
                    //回溯路径
                    _this.TrackPath(targetNode);
                    handler.method.call(handler.caller, VisualStepType.Final, _this.trackList);
                    return;
                }
                //从候选列表中移除 添加到关闭列表中
                _this.AddClosed(current);
                //获取当前节点周围节点
                _this.GetRoundNodeArray(current, startNode, targetNode);
                try {
                    for (var roundList_2 = __values(roundList), roundList_2_1 = roundList_2.next(); !roundList_2_1.done; roundList_2_1 = roundList_2.next()) {
                        var node = roundList_2_1.value;
                        cost2neighbor = current.G + current.Distance(node);
                        if (!_this.IsOpened(node) || cost2neighbor < node.G) {
                            node.G = cost2neighbor;
                            node.parent = current;
                            _this.AddOpen(node);
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (roundList_2_1 && !roundList_2_1.done && (_a = roundList_2.return)) _a.call(roundList_2);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
                handler.method.call(handler.caller, VisualStepType.Step, current, roundList);
            });
        };
        return HoneycombSeeker;
    }(Seeker));
    astar.HoneycombSeeker = HoneycombSeeker;
})(astar || (astar = {}));
var astar;
(function (astar) {
    var LogUtils = /** @class */ (function () {
        function LogUtils() {
        }
        LogUtils.Info = function (content) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            console.log.apply(console, __spread(["%c" + content, "color:#eeee33;background:#000000;padding:3px 6px;"], args));
        };
        LogUtils.Warn = function (content) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            console.log.apply(console, __spread(["%c" + content, "color:#ffff33;background:#000000;padding:3px 6px;"], args));
        };
        LogUtils.Error = function (content) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            console.log.apply(console, __spread(["%c" + content, "color:#ff3333;background:#000000;padding:3px 6px;"], args));
        };
        return LogUtils;
    }());
    astar.LogUtils = LogUtils;
})(astar || (astar = {}));
var astar;
(function (astar) {
    var RoadType;
    (function (RoadType) {
        RoadType[RoadType["Obstacles"] = 0] = "Obstacles";
        RoadType[RoadType["Road"] = 1] = "Road";
    })(RoadType = astar.RoadType || (astar.RoadType = {}));
    var MapData = /** @class */ (function () {
        function MapData() {
            this.timestamp = 0;
            this.mapWidth = 0;
            this.mapHeight = 0;
            this.outerRadius = 30;
            /**
            * 当k=0时，f(n)= h(n) ，最佳优先算法；以距离目标最近为导向
            * 当k=1时，f(n)= g(n) ，迪杰斯特拉算法；以距离自己最近为导向
            * 当k=0.5时，f(n)=g(n)+h(n) ，A星算法; 以距离自己最近 + 距离目标最近 为导向
            *
            * 无障碍物时，最佳优先算法的步骤和结果路径都是最优的
            * 有障碍物时，采用A*算法
            */
            this.k = 0.5;
            this.roadDataArr = [];
        }
        return MapData;
    }());
    astar.MapData = MapData;
})(astar || (astar = {}));
var astar;
(function (astar) {
    var RoadNode = /** @class */ (function (_super) {
        __extends(RoadNode, _super);
        function RoadNode(x, y, type) {
            var _this = _super.call(this) || this;
            /**
             * 距离起点的代价
             */
            _this.G = 0;
            /**
             * 距离终点的代价
             */
            _this.H = 0;
            /**
             * 父节点
             */
            _this.parent = null;
            _this.x = x;
            _this.y = y;
            _this.type = type;
            return _this;
        }
        Object.defineProperty(RoadNode.prototype, "F", {
            /**
             * G+H
             */
            get: function () {
                return RoadNode.k * this.G + (1 - RoadNode.k) * this.H;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 通过终点计算 移动到起点的代价 和 移动到终点的代价
         * @param startNode
         * @param targetNode
         */
        RoadNode.prototype.CalcCost = function (startNode, targetNode) {
            this.G = this.Distance(startNode);
            this.H = this.Distance(targetNode);
        };
        Object.defineProperty(RoadNode.prototype, "position", {
            /**
             * 获取像素坐标 [x,y]
             */
            get: function () {
                return astar.HexagonUtils.GetPixelByWorldPoint(this.x, this.y);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RoadNode.prototype, "key", {
            get: function () {
                //这个值可以根据实际情况来调整 
                //12位的最大存储值是4096  x,y不能超过4096 
                //你可以上调但要保证不能溢出 也可以根据实际情况 下调  
                return this.x << 12 | this.y;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 可以通过key来反推出x,y坐标值
         * 静态方法
         * @param key
         * @returns
         */
        RoadNode.key2Coord = function (key) {
            return new astar.Coord(key >> 12 & 0xfff, key & 0xfff);
        };
        Object.defineProperty(RoadNode.prototype, "gridX", {
            get: function () {
                return this.x * 2 + this.y % 2;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RoadNode.prototype, "gridY", {
            get: function () {
                return this.y;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 获取曼哈顿距离
         * @param dest
         */
        RoadNode.prototype.Distance = function (dest) {
            //计算实际像素
            // let src = this.position;
            // let destPostion = dest.position;
            // return Coord.Distance(
            //     { x: src[0], y: src[1] },
            //     { x: destPostion[0], y: destPostion[1] });
            //计算曼哈顿距离
            return Math.abs(dest.gridX - this.gridX) + Math.abs(dest.gridY - this.gridY);
        };
        /**
         * 当k=0时，f(n)= h(n) ，最佳优先算法；以距离目标最近为导向
         * 当k=1时，f(n)= g(n) ，迪杰斯特拉算法；以距离自己最近为导向
         * 当k=0.5时，f(n)=g(n)+h(n) ，A星算法; 以距离自己最近 + 距离目标最近 为导向
         *
         * 无障碍物时，最佳优先算法的步骤和结果路径都是最优的
         * 有障碍物时，采用A*算法
         */
        RoadNode.k = 0.5;
        return RoadNode;
    }(astar.Coord));
    astar.RoadNode = RoadNode;
})(astar || (astar = {}));
