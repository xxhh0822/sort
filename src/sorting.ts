export type AlgorithmId = 'bubble' | 'selection' | 'insertion' | 'quick'
export type DataMode = 'random' | 'nearly' | 'reversed'
export type StepKind = 'initial' | 'compare' | 'swap' | 'write' | 'mark'

export interface SortStep {
  values: number[]
  kind: StepKind
  comparing: number[]
  active: number[]
  sorted: number[]
  pivot: number | null
  line: number
  message: string
  comparisons: number
  moves: number
}

export interface SortRun { initial: number[]; steps: SortStep[] }

export interface AlgorithmDefinition {
  id: AlgorithmId
  name: string
  summary: string
  best: string
  average: string
  worst: string
  stable: boolean
  inPlace: boolean
  pseudocode: string[]
}

export const algorithms: AlgorithmDefinition[] = [
  { id: 'bubble', name: '冒泡排序', summary: '重复比较相邻元素，把较大的值逐轮推向末尾。', best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', stable: true, inPlace: true, pseudocode: ['从末尾开始划定未排序区间', '依次比较相邻的两个元素', '若左侧更大，则交换它们', '本轮末尾元素归位', '若没有交换，提前结束'] },
  { id: 'selection', name: '选择排序', summary: '每轮找到未排序区间的最小值，放到区间起点。', best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)', stable: false, inPlace: true, pseudocode: ['从当前下标开始扫描', '记录未排序区间的最小值', '继续比较并更新最小值', '把最小值交换到当前位置', '当前位置归位'] },
  { id: 'insertion', name: '插入排序', summary: '把当前元素插入左侧已经有序的区间。', best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', stable: true, inPlace: true, pseudocode: ['取出当前待插入元素', '与左侧元素逐个比较', '较大的元素向右移动', '把元素写入合适位置', '全部元素完成插入'] },
  { id: 'quick', name: '快速排序', summary: '围绕基准值划分区间，再递归处理左右两侧。', best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)', stable: false, inPlace: true, pseudocode: ['选择区间末尾元素作为基准', '比较当前元素与基准值', '较小元素移到基准左侧', '把基准放到最终位置', '递归处理左右区间'] },
]

export function getAlgorithm(id: AlgorithmId): AlgorithmDefinition {
  return algorithms.find((algorithm) => algorithm.id === id) ?? algorithms[0]!
}

function recorder(input: number[]) {
  const values = [...input]
  const steps: SortStep[] = []
  const sorted = new Set<number>()
  let comparisons = 0
  let moves = 0
  const push = (kind: StepKind, line: number, message: string, comparing: number[] = [], active: number[] = [], pivot: number | null = null) => {
    steps.push({ values: [...values], kind, comparing, active, sorted: [...sorted].sort((a, b) => a - b), pivot, line, message, comparisons, moves })
  }
  push('initial', 0, '准备开始排序')
  return {
    values,
    steps,
    compare(indices: number[], line: number, message: string, pivot: number | null = null) { comparisons += 1; push('compare', line, message, indices, [], pivot) },
    swap(left: number, right: number, line: number, message: string, pivot: number | null = null) { ;[values[left], values[right]] = [values[right]!, values[left]!]; moves += 1; push('swap', line, message, [], [left, right], pivot) },
    write(index: number, value: number, line: number, message: string) { values[index] = value; moves += 1; push('write', line, message, [], [index]) },
    mark(indices: number[], line: number, message: string) { indices.forEach((index) => sorted.add(index)); push('mark', line, message) },
    note(line: number, message: string, pivot: number | null = null, active: number[] = []) { push('mark', line, message, [], active, pivot) },
  }
}

function bubbleSort(input: number[]): SortStep[] {
  const state = recorder(input)
  for (let end = state.values.length - 1; end > 0; end -= 1) {
    let swapped = false
    for (let index = 0; index < end; index += 1) {
      state.compare([index, index + 1], 2, `比较 ${state.values[index]} 和 ${state.values[index + 1]}`)
      if (state.values[index]! > state.values[index + 1]!) { state.swap(index, index + 1, 3, '左侧更大，交换相邻元素'); swapped = true }
    }
    state.mark([end], 4, `位置 ${end + 1} 已归位`)
    if (!swapped) { state.mark(Array.from({ length: end }, (_, index) => index), 5, '剩余区间已有序，提前结束'); return state.steps }
  }
  state.mark([0], 4, '全部元素排序完成')
  return state.steps
}

function selectionSort(input: number[]): SortStep[] {
  const state = recorder(input)
  for (let start = 0; start < state.values.length - 1; start += 1) {
    let minimum = start
    state.note(1, `从位置 ${start + 1} 开始寻找最小值`, null, [minimum])
    for (let index = start + 1; index < state.values.length; index += 1) {
      state.compare([minimum, index], 3, `比较当前最小值 ${state.values[minimum]} 与 ${state.values[index]}`)
      if (state.values[index]! < state.values[minimum]!) minimum = index
    }
    if (minimum !== start) state.swap(start, minimum, 4, '把最小值交换到区间起点')
    state.mark([start], 5, `位置 ${start + 1} 已归位`)
  }
  state.mark([state.values.length - 1], 5, '全部元素排序完成')
  return state.steps
}

function insertionSort(input: number[]): SortStep[] {
  const state = recorder(input)
  for (let index = 1; index < state.values.length; index += 1) {
    const value = state.values[index]!
    let cursor = index - 1
    state.note(1, `取出待插入元素 ${value}`, null, [index])
    while (cursor >= 0) {
      state.compare([cursor, cursor + 1], 2, `比较 ${state.values[cursor]} 与待插入元素 ${value}`)
      if (state.values[cursor]! <= value) break
      state.write(cursor + 1, state.values[cursor]!, 3, '较大元素向右移动')
      cursor -= 1
    }
    state.write(cursor + 1, value, 4, `把 ${value} 插入当前位置`)
  }
  state.mark(Array.from({ length: state.values.length }, (_, index) => index), 5, '全部元素排序完成')
  return state.steps
}

function quickSort(input: number[]): SortStep[] {
  const state = recorder(input)
  const partition = (low: number, high: number) => {
    const pivotValue = state.values[high]!
    let boundary = low
    state.note(1, `选择 ${pivotValue} 作为基准值`, high)
    for (let index = low; index < high; index += 1) {
      state.compare([index, high], 2, `比较 ${state.values[index]} 与基准值 ${pivotValue}`, high)
      if (state.values[index]! <= pivotValue) { if (boundary !== index) state.swap(boundary, index, 3, '较小元素移到基准左侧', high); boundary += 1 }
    }
    if (boundary !== high) state.swap(boundary, high, 4, '把基准放到最终位置', boundary)
    state.mark([boundary], 4, `基准值 ${pivotValue} 已归位`)
    return boundary
  }
  const sortRange = (low: number, high: number) => {
    if (low > high) return
    if (low === high) { state.mark([low], 5, `位置 ${low + 1} 已归位`); return }
    const pivot = partition(low, high)
    sortRange(low, pivot - 1)
    sortRange(pivot + 1, high)
  }
  sortRange(0, state.values.length - 1)
  return state.steps
}

export function createSortRun(id: AlgorithmId, input: number[]): SortRun {
  const initial = [...input]
  const createSteps = { bubble: bubbleSort, selection: selectionSort, insertion: insertionSort, quick: quickSort }[id]
  return { initial, steps: createSteps(initial) }
}

export function generateData(mode: DataMode, count: number, random: () => number = Math.random): number[] {
  const values = Array.from({ length: count }, () => Math.floor(random() * 90) + 10)
  if (mode === 'reversed') return values.sort((a, b) => b - a)
  if (mode === 'nearly') {
    values.sort((a, b) => a - b)
    for (let index = 0; index < Math.max(1, Math.floor(count / 8)); index += 1) {
      const left = Math.floor(random() * count); const right = Math.floor(random() * count)
      ;[values[left], values[right]] = [values[right]!, values[left]!]
    }
  }
  return values
}

export function parseCustomData(input: string): number[] {
  const parts = input.trim().split(/[\s,，]+/).filter(Boolean)
  if (parts.length < 2 || parts.length > 60) throw new Error('请输入 2–60 个整数')
  const values = parts.map(Number)
  if (values.some((value) => !Number.isInteger(value))) throw new Error('数组只能包含整数')
  if (values.some((value) => value < -9999 || value > 9999)) throw new Error('每个整数必须在 -9999–9999 之间')
  return values
}
