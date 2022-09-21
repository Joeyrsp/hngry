type BoolMatrixRow = boolean[];
type BoolMatrix = BoolMatrixRow[];

type NumberMatrixRow = number[];
type NumberMatrix = NumberMatrixRow[];

interface Line {
  direction?: string;
  index: number;
  count: number;
}

enum Direction {
  Row = "Row",
  Column = "Col"
}

const matrix = [
  [0, 0, 3, 4],
  [3, 0, 7, 4],
  [6, 1, 0, 0],
  [1, 0, 4, 9]
];

const compose = (...args: Function[]) => (initialValue: any) =>
  args.reduce((res, fn) => fn(res), initialValue);

const cast_num_to_bool = (matrix: NumberMatrix): BoolMatrix =>
  matrix.map(row => row.map(cell => Boolean(cell)));

// const get_nth_row = <T>(n: number) => (matrix: T[][]): T[] => matrix[n];
const get_nth_col = <T>(n: number) => (matrix: T[][]): T[] =>
  matrix.map(col => col[n]);

const count_false_values = (array: boolean[]) =>
  array.filter(value => !value).length;

const index_of_largest_line = (numbers: NumberMatrixRow): Line =>
  numbers.reduce(
    (previousLine, count, index) =>
      count > previousLine.count ? { index, count } : previousLine,
    { index: -1, count: -1 }
  );

const get_best_line = (m: BoolMatrix) => {
  const squashed_rows = m.map(count_false_values);
  const squashed_colums = m[0].map((_, i) =>
    compose(get_nth_col(i), count_false_values)(m)
  );

  const best_row = index_of_largest_line(squashed_rows);
  const best_column = index_of_largest_line(squashed_colums);

  return best_column.count > best_row.count
    ? { direction: Direction.Column, ...best_column }
    : { direction: Direction.Row, ...best_row };
};

const set_line_to_true = ({ direction, index }: Line) => (
  matrix: BoolMatrix
) => {
  let nextMatrix = [...matrix];

  if (direction === Direction.Row) {
    nextMatrix[index] = new Array(matrix.length).fill(true);
    return nextMatrix;
  } else {
    return nextMatrix.map(row => {
      const nextRow = [...row];
      nextRow[index] = true;
      return nextRow;
    });
  }
};

const m0 = cast_num_to_bool(matrix); //=
const m1 = set_line_to_true(get_best_line(m0))(m0); //=
const m2 = set_line_to_true(get_best_line(m1))(m1); //=
const m3 = set_line_to_true(get_best_line(m2))(m2); //=

console.log(m0);
console.log(m1);
console.log(m2);
console.log(m3);
