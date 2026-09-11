import { describe, expect, it } from 'vitest'
import { algorithms, createSortRun, generateData, parseCustomData, type AlgorithmId } from './sorting'

describe('sorting algorithms', () => {
  const samples = [[5, 1, 4, 2, 8], [1, 2], [5, 5, 2, -1, 2], [9, 7, 5, 3, 1], [1, 2, 3, 4, 5]]

  it.each(algorithms.map(({ id }) => id))('%s produces a sorted final step', (id) => {
    samples.forEach((sample) => {
      const original = [...sample]
      const run = createSortRun(id as AlgorithmId, sample)
      expect(run.steps.at(-1)?.values).toEqual([...sample].sort((left, right) => left - right))
      expect(sample).toEqual(original)
      expect(run.steps.at(-1)?.sorted).toEqual(sample.map((_, index) => index))
    })
  })

  it('keeps cumulative counters monotonic', () => {
    const { steps } = createSortRun('quick', [4, 2, 5, 1, 3])
    steps.slice(1).forEach((step, index) => {
      expect(step.comparisons).toBeGreaterThanOrEqual(steps[index]!.comparisons)
      expect(step.moves).toBeGreaterThanOrEqual(steps[index]!.moves)
    })
  })
})

describe('data helpers', () => {
  it('creates reversed and nearly sorted datasets with the requested size', () => {
    const reversed = generateData('reversed', 8, () => 0.5)
    const nearly = generateData('nearly', 8, () => 0.25)
    expect(reversed).toHaveLength(8)
    expect(reversed).toEqual([...reversed].sort((left, right) => right - left))
    expect(nearly).toHaveLength(8)
  })

  it('parses commas, Chinese commas and whitespace', () => {
    expect(parseCustomData('3, 1，2\n-4')).toEqual([3, 1, 2, -4])
  })

  it.each(['', '1', '1 2.5', '1 x', '1 10000', Array.from({ length: 61 }, () => '1').join(',')])(
    'rejects invalid custom input: %s',
    (input) => expect(() => parseCustomData(input)).toThrow(),
  )
})
