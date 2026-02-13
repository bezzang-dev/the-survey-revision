/**
 * Number utils class for global use case with better performance.
 * For additional functions, please make it `static` to make
 * code consistent.
 */
export class NumberUtils<T> extends Array<T> {
  /**
   * A Range function that returns an array of incremental numbers.
   * Range index starts from `0` by default.
   *
   * @example
   * // returns [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
   * NumberUtils.range(0, 10);
   * @example
   * // returns [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
   * NumberUtils.range(10);
   * @param from An index to start from. Starts from`0` if not provided.
   * @param to An index to be ended by. (Excludes this value)
   * @returns {Array<number>} An array of continuous numbers within range.
  */
  static range(from: number, to?: number): Array<number> {
    let fromIndex = 0;
    let toIndex = from;

    if (to !== undefined) {
      fromIndex = from;
      toIndex = to;
    }

    const length = toIndex - fromIndex;
    const arr: Array<number> = Array<number>(length);

    let counter = fromIndex;

    while (counter < toIndex) {
      arr[counter - fromIndex] = counter;
      counter += 1;
    }

    return arr;
  }
}
