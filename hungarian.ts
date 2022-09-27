type MatrixRow<T> = T[];
type Matrix<T> = MatrixRow<T>[];

interface Line {
  direction?: string;
  index?: number;
  count?: number;
}
interface Lines {
  rows: Line[];
  cols: Line[];
}

enum Direction {
  Row = "Row",
  Col = "Col"
}

type ElementCoord = [number, number];

const matrix = [
  [0, 0, 3, 4],
  [3, 0, 7, 4],
  [6, 1, 0, 0],
  [1, 0, 4, 9]
];

const matrix2 = [
  [0, 0, 1, 5],
  [2, 0, 0, 3],
  [0, 1, 3, 6],
  [0, 0, 0, 5]
];

const compose = (...args: Function[]) => (initialValue: any) =>
  args.reduce((res, fn) => fn(res), initialValue);

const clone_matrix = <T>(matrix: Matrix<T>) => [...matrix.map(row => [...row])];

const cast_num_to_bool = (matrix: Matrix<number>): Matrix<boolean> =>
  matrix.map(row => row.map(location => Boolean(location)));

// const get_nth_row = <T>(n: number) => (matrix: T[][]): T[] => matrix[n];
const get_nth_col = <T>(n: number) => (matrix: Matrix<T>): MatrixRow<T> =>
  matrix.map(col => col[n]);

const count_false_values = (array: boolean[]) =>
  array.filter(value => !value).length;

const index_of_largest_line = (numbers: MatrixRow<number>): Line =>
  numbers.reduce(
    (previousLine, count, index) =>
      count > previousLine.count ? { index, count } : previousLine,
    { index: -1, count: -1 }
  );

const get_best_line = (m: Matrix<boolean>) => {
  const squashed_rows = m.map(count_false_values);
  const squashed_colums = m[0].map((_, i) =>
    compose(get_nth_col(i), count_false_values)(m)
  );

  const best_row = index_of_largest_line(squashed_rows);
  const best_column = index_of_largest_line(squashed_colums);

  const line_col = { direction: Direction.Col, ...best_column };
  const line_row = { direction: Direction.Row, ...best_row };

  if (best_column.count > best_row.count) {
    return line_col;
  }
  if (best_column.count < best_row.count) {
    return line_row;
  }

  return squashed_rows.length < squashed_colums.length ? line_row : line_col;
};

const set_line_to_true = ({ direction, index }: Line) => (
  matrix: Matrix<boolean>
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

const cover_false_values = (matrix: Matrix<boolean>) => {
  const lines: Lines = { rows: [], cols: [] };

  const cover_recursive = (lines: Lines, matrix: Matrix<boolean>) => {
    const nextLine = get_best_line(matrix);

    if (nextLine.count > 0) {
      const nextMatrix = set_line_to_true(nextLine)(matrix);

      return cover_recursive(
        {
          rows: [
            ...lines.rows,
            nextLine.direction === Direction.Row && nextLine
          ].filter(x => Boolean(x)),
          cols: [
            ...lines.cols,
            nextLine.direction === Direction.Col && nextLine
          ].filter(x => Boolean(x))
        },
        nextMatrix
      );
    }

    return lines;
  };

  return cover_recursive(lines, matrix);
};

// const find_intersections = (lines: Lines) => {
//   return lines.rows.reduce(
//     (acc, row) => [
//       ...acc,
//       ...lines.cols.reduce((bcc, col) => [...bcc, [row.index, col.index]], [])
//     ],
//     []
//   );
// };

const find_special_coordinates = (lines: Lines) => {
  const intersections: ElementCoord[] = [];
  const uncovered: ElementCoord[] = [];

  const covered_rows = lines.rows.map(({ index }) => index);
  const covered_cols = lines.cols.map(({ index }) => index);

  for (let i = 0; i < matrix.length; i++) {
    const row = matrix[i];

    for (let j = 0; j < row.length; j++) {
      if (covered_rows.includes(i)) {
        if (covered_cols.includes(j)) {
          intersections.push([i, j]);
        }
      } else {
        if (!covered_cols.includes(j)) {
          uncovered.push([i, j]);
        }
      }
    }
  }

  return { intersections, uncovered };
};

const get_uncovered_minimum = (coordinates: ElementCoord[]) => (
  matrix: Matrix<number>
) => Math.min(...coordinates.map(([i, j]) => matrix[i][j]));

const update_new_minimum = ({
  intersections,
  uncovered
}: {
  intersections: ElementCoord[];
  uncovered: ElementCoord[];
}) => (matrix: Matrix<number>) => {
  const min = get_uncovered_minimum(uncovered)(matrix);

  return matrix.map((row, i) =>
    row.map((elem, j) => {
      const coord: ElementCoord = [i, j];

      const contains_coord = (coord: ElementCoord) => (
        coords: ElementCoord[]
      ) => coords.find(([i, j]) => coord[0] === i && coord[1] === j);

      if (contains_coord(coord)(intersections)) {
        return elem + min;
      }
      if (contains_coord(coord)(uncovered)) {
        return elem - min;
      }
      return elem;
    })
  );
};

console.log(matrix);
const bool_matrix = cast_num_to_bool(matrix); //=
console.log(bool_matrix);
const covered_lines = cover_false_values(bool_matrix); //=
console.log(covered_lines);

if (
  covered_lines.rows.length + covered_lines.cols.length <
  bool_matrix.length
) {
  const special_coords = find_special_coordinates(covered_lines);
  const next_matrix = update_new_minimum(special_coords)(matrix);
  console.log(compose(cast_num_to_bool, cover_false_values)(next_matrix));
}

// console.log(cover_false_values(cast_num_to_bool(matrix2)));
