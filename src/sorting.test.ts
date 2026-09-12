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
      expect(step.distributions).toBeGreaterThanOrEqual(steps[index]!.distributions)
    })
  })

  it('includes merge, heap and counting sort with their teaching characteristics', () => {
    expect(algorithms).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'merge', stable: true, inPlace: false, average: 'O(n log n)' }),
      expect.objectContaining({ id: 'heap', stable: false, inPlace: true, average: 'O(n log n)' }),
      expect.objectContaining({ id: 'counting', stable: true, inPlace: false, average: 'O(n + k)' }),
    ]))
  })

  it('includes shell, radix and bucket sort with their teaching characteristics', () => {
    expect(algorithms).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'shell', stable: false, inPlace: true, worst: 'O(n²)' }),
      expect.objectContaining({ id: 'radix', stable: true, inPlace: false, average: 'O(d(n + k))' }),
      expect.objectContaining({ id: 'bucket', stable: true, inPlace: false, worst: 'O(n²)' }),
    ]))
  })

  it('counting sort supports duplicate and negative integers', () => {
    const run = createSortRun('counting', [3, -2, 3, 0, -2])
    expect(run.steps.at(-1)?.values).toEqual([-2, -2, 0, 3, 3])
    expect(run.steps.at(-1)?.comparisons).toBe(0)
    expect(run.steps.at(-1)?.moves).toBe(5)
    expect(run.steps.at(-1)?.distributions).toBe(5)
  })

  it.each(['radix', 'bucket'] as const)('%s supports duplicate and negative integers', (id) => {
    const run = createSortRun(id, [12, -3, 0, -3, 21, 5])
    expect(run.steps.at(-1)?.values).toEqual([-3, -3, 0, 5, 12, 21])
  })

  it.each(['merge', 'counting', 'radix', 'bucket'] as const)('%s records an auxiliary teaching structure', (id) => {
    const run = createSortRun(id, [4, 1, 3, 2])
    expect(run.steps.some((step) => step.auxiliary?.groups.length)).toBe(true)
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
