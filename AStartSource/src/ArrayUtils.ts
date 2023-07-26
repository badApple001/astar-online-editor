module astar {
    export class ArrayUtils {

        public static Remove<T>(arr: T[], v: T) {
            let index = arr.indexOf(v);
            index != -1 && arr.splice(index, 1);
        }

        public static Add<T>(arr: T[], v: T) {
            let index = arr.indexOf(v);
            index == -1 && arr.push(v);
        }
    }
}