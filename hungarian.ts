type BoolMatrixRow = boolean[];
type BoolMatrix = BoolMatrixRow[];

type NumberMatrixRow = number[];
type NumberMatrix = NumberMatrixRow[];

enum Direction {
  Row,
  Column
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

const index_of_largest = (numbers: NumberMatrixRow) =>
  Object.entries(numbers).reduce((previous, current) =>
    current[1] > previous[1] ? current : previous
  );

const best_row = index_of_largest(squashed_rows); //=
const best_column = index_of_largest(squashed_colums); //=

const best_line =
  best_column[1] > best_row[1]
    ? [Direction.Column, best_column[0]]
    : [Direction.Row, best_row[0]]; //=
