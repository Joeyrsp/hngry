import { assign, createMachine, interpret } from "xstate";

type Vector<T> = T[];
type Matrix<T> = Vector<T>[];

type RowIndex = number;
type ColIndex = number;
type Location = [RowIndex, ColIndex];

enum Coverage {
  Uncovered,
  Covered
}

enum Zeros {
  NotZero,
  StarredZero,
  PrimedZero
}

const matrix = [
  [3, 3, 6, 7],
  [6, 3, 10, 7],
  [9, 4, 3, 3],
  [4, 3, 7, 12]
];

// const matrix2 = [
//   [0, 0, 1, 5],
//   [2, 0, 0, 3],
//   [0, 1, 3, 6],
//   [0, 0, 0, 5]
// ];

const matrix3 = [
  [1, 2, 3, 4],
  [2, 4, 6, 8],
  [3, 6, 9, 12],
  [4, 8, 12, 16]
];

const cloneMatrix = <T>(matrix: Matrix<T>) => [...matrix.map(row => [...row])];

interface HungarianContext {
  matrix: Matrix<number>;
  zeroMatrix?: Matrix<Zeros>;
  rowCoverageVector?: Vector<Coverage>;
  colCoverageVector?: Vector<Coverage>;
  uncoveredZeroLocation?: Location;
  primedZeroLocation?: Location;
}

const hungarianMachine = createMachine<HungarianContext>(
  {
    id: "machine",
    predictableActionArguments: true,
    initial: "step0",
    context: {
      matrix: [[]],
      zeroMatrix: [[]],
      rowCoverageVector: [],
      colCoverageVector: []
    },
    states: {
      step0: {
        entry: ["setupContext"],
        always: "step1"
      },
      step1: {
        entry: ["minimizeRows"],
        always: "step2"
      },
      step2: {
        entry: ["markZeros"],
        always: "step3"
      },
      step3: {
        entry: ["coverCols"],
        always: [
          { target: "done", cond: "allColsCovered" },
          { target: "step4" }
        ]
      },
      step4: {
        entry: ["primeZero"],
        always: [
          { target: "step6", cond: "hasNoUncoveredZero" },
          { target: "step5", cond: "hasPrimedZero" },
          { target: "step4" }
        ]
      },
      step5: {},
      step6: {},
      done: {
        type: "final"
      }
    }
  },
  {
    actions: {
      setupContext: assign({
        zeroMatrix: context =>
          context.matrix.map(row => new Array(row.length).fill(Zeros.NotZero)),
        rowCoverageVector: context =>
          new Array(context.matrix.length).fill(Coverage.Uncovered),
        colCoverageVector: context =>
          new Array(context.matrix[0].length).fill(Coverage.Uncovered)
      }),
      minimizeRows: assign({
        matrix: context =>
          context.matrix.map(row => {
            const min = Math.min(...row);
            return row.map(elem => elem - min);
          })
      }),
      markZeros: assign({
        zeroMatrix: context => {
          const rowCoverageVector = [...context.rowCoverageVector];
          const colCoverageVector = [...context.colCoverageVector];

          const zeroMatrix = context.matrix.map((row, r) =>
            row.map((elem, c) => {
              if (
                elem === 0 &&
                rowCoverageVector[r] === Coverage.Uncovered &&
                colCoverageVector[c] === Coverage.Uncovered
              ) {
                rowCoverageVector[r] = Coverage.Covered;
                colCoverageVector[c] = Coverage.Covered;
                return Zeros.StarredZero;
              }
              return Zeros.NotZero;
            })
          );
          return zeroMatrix;
        }
      }),
      coverCols: assign({
        colCoverageVector: context => {
          const colCoverageVector = [...context.colCoverageVector];

          context.zeroMatrix.forEach(row =>
            row.forEach((elem, c) => {
              if (elem === Zeros.StarredZero) {
                colCoverageVector[c] = Coverage.Covered;
              }
            })
          );

          return colCoverageVector;
        }
      }),
      primeZero: assign(context => {
        // WIP
        const zeroMatrix = cloneMatrix(context.zeroMatrix);
        const rowCoverageVector = [...context.rowCoverageVector];
        const colCoverageVector = [...context.colCoverageVector];

        let uncoveredZeroLocation: Location;
        let primedZeroLocation: Location;

        for (let c = 0; c < colCoverageVector.length; c++) {
          if (colCoverageVector[c] === Coverage.Covered) continue;

          for (let r = 0; r < rowCoverageVector.length; r++) {
            if (rowCoverageVector[r] === Coverage.Covered) continue;

            const element = context.matrix[r][c];

            if (element === 0) {
              uncoveredZeroLocation = [r, c];
              console.log(uncoveredZeroLocation);

              zeroMatrix[r][c] = Zeros.PrimedZero;

              const starredZeroInRow = zeroMatrix[r].findIndex(
                element => element === Zeros.StarredZero,
                0
              );

              if (starredZeroInRow > -1) {
                rowCoverageVector[r] = Coverage.Covered;
                colCoverageVector[starredZeroInRow] = Coverage.Uncovered;
              } else {
                primedZeroLocation = [r, c];
              }
              break;
            }
          }
        }

        return {
          zeroMatrix,
          rowCoverageVector,
          colCoverageVector,
          uncoveredZeroLocation,
          primedZeroLocation
        };
      })
    },
    guards: {
      allColsCovered: context =>
        context.colCoverageVector.reduce(
          (count: number, coverage: Coverage) =>
            count + Number(coverage === Coverage.Covered),
          0
        ) === context.matrix.length,
      hasNoUncoveredZero: context => !Boolean(context.uncoveredZeroLocation),
      hasPrimedZero: context => Boolean(context.primedZeroLocation)
    }
  }
);

// Edit your service(s) here
const service = interpret(hungarianMachine.withContext({ matrix }))
  .onTransition(state => {
    console.log(state.value, state.context);
  })
  .start();
