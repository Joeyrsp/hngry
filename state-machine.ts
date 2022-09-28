import { assign, createMachine, interpret } from "xstate";

type MatrixRow<T> = T[];
type MatrixCol<T> = T[];
type Matrix<T> = MatrixRow<T>[];

enum MaskElem {
  NotZero,
  StarredZero,
  PrimedZero
}

// const matrix = [
//   [0, 0, 3, 4],
//   [3, 0, 7, 4],
//   [6, 1, 0, 0],
//   [1, 0, 4, 9]
// ];

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

interface HungarianContext {
  matrix: Matrix<number>;
  zeroMask?: Matrix<MaskElem>;
  rowVector?: MatrixRow<boolean>;
  colVector?: MatrixRow<boolean>;
}

const hungarianMachine = createMachine<HungarianContext>(
  {
    id: "machine",
    predictableActionArguments: true,
    initial: "step0",
    context: { matrix: [[]], zeroMask: [[]], rowVector: [], colVector: [] },
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
      step3: {}
    }
  },
  {
    actions: {
      setupContext: assign({
        zeroMask: ({ matrix }) =>
          matrix.map(row => new Array(row.length).fill(MaskElem.NotZero)),
        rowVector: ({ matrix }) => new Array(matrix.length).fill(false),
        colVector: ({ matrix }) => new Array(matrix[0].length).fill(false)
      }),
      minimizeRows: assign({
        matrix: ({ matrix }) =>
          matrix.map(row => {
            const min = Math.min(...row);
            return row.map(elem => elem - min);
          })
      }),
      markZeros: assign(context => {
        const rowVector = [...context.rowVector];
        const colVector = [...context.colVector];

        const zeroMask = context.matrix.map((row, r) =>
          row.map((elem, c) => {
            if (
              elem === 0 &&
              rowVector[r] === false &&
              colVector[c] === false
            ) {
              rowVector[r] = true;
              colVector[c] = true;
              return MaskElem.StarredZero;
            }
            return MaskElem.NotZero;
          })
        );

        return { zeroMask, rowVector, colVector };
      })
    }
  }
);

// Edit your service(s) here
const service = interpret(hungarianMachine.withContext({ matrix: matrix3 }))
  .onTransition(state => {
    console.log(state.value, state.context);
  })
  .start();
