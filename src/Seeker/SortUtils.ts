
export class SortUtils {

    /**
     * 双轴快排
     * @param arr 数组
     * @param compareMethod  function( a,b ){ return -1 || 0 || 1 ;}
     * @param s 默认值就可以 不用填
     * @param e 默认值就可以 不用填
     * @returns void
     */
    public static QSort<T>(arr: T[], compareMethod, s = 0, e = arr.length - 1): void {
        if (s > e) return;
        if (compareMethod(arr[s], arr[e]) > 0) SortUtils.Swap(arr, s, e);
        let p1 = arr[s], p2 = arr[e];
        let l = s, r = e, k = l + 1;
        while (k < r) {
            if (compareMethod(arr[k], p1) < 0)
                SortUtils.Swap(arr, ++l, k++);
            else if (!(compareMethod(arr[k], p2) > 0))
                ++k;
            else {
                while (compareMethod(arr[r], p2) > 0) if (r-- == k) break;
                if (k >= r) break;
                SortUtils.Swap(arr, k, r);
            }
        }
        SortUtils.Swap(arr, s, l);
        SortUtils.Swap(arr, e, r);
        SortUtils.QSort(arr, compareMethod, s, l - 1);
        SortUtils.QSort(arr, compareMethod, l + 1, r - 1);
        SortUtils.QSort(arr, compareMethod, r + 1, e);
    }

    /**
     * 交换数组元素
     */
    public static Swap(list: any[], i: number, j: number) {
        let temp = list[i];
        list[i] = list[j];
        list[j] = temp;
    }
}