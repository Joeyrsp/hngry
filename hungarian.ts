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
  [1, 0, 4, 9],
];

const number_to_bool = (matrix: NumberMatrix): BoolMatrix =>
  matrix.map((row) => row.map((cell) => Boolean(cell)));

const bool_matrix = number_to_bool(matrix); //=

const count_zeros_by_row = (matrix: BoolMatrix) =>
  matrix.map((row) => row.reduce((count, cell) => count + Number(!cell), 0));

const count_zeros_by_column = (matrix: BoolMatrix) =>
  Array(matrix.length)
    .fill(true) // literally anything in there lmao
    .map((element, index) =>
      matrix.reduce((previous, current) => previous + (current[index] ? 0 : 1), 0)
    );

const row_zeros = count_zeros_by_row(bool_matrix); //=
const column_zeros = count_zeros_by_column(bool_matrix); //=

const index_of_largest = (numbers: NumberMatrixRow) => Object.entries(numbers).reduce((previous, current) => current[1] > previous[1] ? current : previous)

const best_row = index_of_largest(row_zeros) //=
const best_column = index_of_largest(column_zeros) //=

const best_line = best_column[1] > best_row[1] ? [Direction.Column, best_column[0]] : [Direction.Row, best_row[0]] //=
