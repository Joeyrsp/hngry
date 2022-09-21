type BoolMatrixRow = boolean[];
type BoolMatrix = BoolMatrixRow[];

type NumberMatrixRow = number[];
type NumberMatrix = NumberMatrixRow[];

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

const bool_matrix = cast_num_to_bool(matrix); //=

const squashed_rows = bool_matrix.map(count_false_values);
const squashed_colums = bool_matrix[0].map((_, i) =>
  compose(get_nth_col(i), count_false_values)(bool_matrix)
);

interface Line {
  direction?: string;
  index: number;
  count: number;
}

const index_of_largest_line = (numbers: NumberMatrixRow): Line =>
  numbers.reduce(
    (previousLine, count, index) =>
      count > previousLine.count ? { index, count } : previousLine,
    { index: -1, count: -1 }
  );

const best_row = index_of_largest_line(squashed_rows); //=
const best_column = index_of_largest_line(squashed_colums); //=

const best_line =
  best_column.count > best_row.count
    ? { direction: Direction.Column, ...best_column }
    : { direction: Direction.Row, ...best_row }; //=

const set_line_to_true = ({ direction, index }: Line) => (
  matrix: BoolMatrix
) => {
  if (direction === Direction.Row) {
    matrix[index] = new Array(matrix.length).fill(true);
  } else {
    matrix.map(row => {
      row[index] = true;
      return row;
    });
  }
  return matrix;
};

console.log(set_line_to_true(best_line)(bool_matrix));
