<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { ChevronLeft, ChevronRight, Pause, Play, Shuffle } from 'reicon-vue'
import DropdownSelect from './DropdownSelect.vue'
import {
  algorithms,
  createSortRun,
  generateData,
  getAlgorithm,
  parseCustomData,
  type AlgorithmId,
  type DataMode,
} from './sorting'

type Speed = '0.25' | '0.5' | '1' | '2' | '4'

const selectedAlgorithm = ref<AlgorithmId>('quick')
const dataMode = ref<DataMode>('random')
const sourceMode = ref<DataMode | 'custom'>('random')
const count = ref(24)
const speed = ref<Speed>('1')
const customInput = ref('8, 3, 12, 5, 1, 9')
const customError = ref('')
const currentData = ref(generateData('random', count.value))
const run = shallowRef(createSortRun(selectedAlgorithm.value, currentData.value))
const currentIndex = ref(0)
const isPlaying = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

const speedDelay: Record<Speed, number> = { '0.25': 800, '0.5': 480, '1': 260, '2': 130, '4': 60 }
const algorithmOptions = algorithms.map(({ id, name }) => ({ value: id, label: name }))
const speedOptions = ['0.25', '0.5', '1', '2', '4'].map((value) => ({ value, label: `${value}×` }))
const algorithm = computed(() => getAlgorithm(selectedAlgorithm.value))
const step = computed(() => run.value.steps[currentIndex.value]!)
const totalSteps = computed(() => Math.max(0, run.value.steps.length - 1))
const finished = computed(() => currentIndex.value >= totalSteps.value)
const minValue = computed(() => Math.min(...step.value.values))
const maxValue = computed(() => Math.max(...step.value.values))
const showValues = computed(() => step.value.values.length <= 24)

function pause() {
  clearTimeout(timer)
  timer = undefined
  isPlaying.value = false
}

function scheduleNext() {
  clearTimeout(timer)
  if (!isPlaying.value || finished.value) {
    if (finished.value) isPlaying.value = false
    return
  }
  timer = setTimeout(() => {
    currentIndex.value += 1
    scheduleNext()
  }, speedDelay[speed.value])
}

function togglePlay() {
  if (isPlaying.value) {
    pause()
    return
  }
  if (finished.value) currentIndex.value = 0
  isPlaying.value = true
  scheduleNext()
}

function rebuild(values: number[] = currentData.value) {
  pause()
  currentData.value = [...values]
  run.value = createSortRun(selectedAlgorithm.value, currentData.value)
  currentIndex.value = 0
}

function chooseAlgorithm(value: string) {
  selectedAlgorithm.value = value as AlgorithmId
  rebuild()
}

function chooseSpeed(value: string) {
  speed.value = value as Speed
}

function generatePreset(mode: DataMode = dataMode.value) {
  dataMode.value = mode
  sourceMode.value = mode
  customError.value = ''
  rebuild(generateData(mode, count.value))
}

function updateCount() {
  generatePreset(dataMode.value)
}

function applyCustomData() {
  try {
    const values = parseCustomData(customInput.value)
    customError.value = ''
    sourceMode.value = 'custom'
    count.value = values.length
    rebuild(values)
  } catch (error) {
    customError.value = error instanceof Error ? error.message : '请输入有效数组'
  }
}

function reset() {
  pause()
  currentIndex.value = 0
}

function previousStep() {
  pause()
  currentIndex.value = Math.max(0, currentIndex.value - 1)
}

function nextStep() {
  pause()
  currentIndex.value = Math.min(totalSteps.value, currentIndex.value + 1)
}

function barHeight(value: number): string {
  const range = maxValue.value - minValue.value
  const ratio = range === 0 ? 0.5 : (value - minValue.value) / range
  return `${18 + ratio * 78}%`
}

function barClass(index: number) {
  return {
    sorted: step.value.sorted.includes(index),
    comparing: step.value.comparing.includes(index),
    active: step.value.active.includes(index),
    pivot: step.value.pivot === index,
  }
}

watch(speed, () => {
  if (isPlaying.value) scheduleNext()
})

onBeforeUnmount(pause)
</script>

<template>
  <div class="page-shell">
    <header class="site-header">
      <a class="brand" href="/" aria-label="排序算法演示首页">
        <span class="brand-mark" aria-hidden="true"><i /><i /><i /></span>
        <strong>排序算法演示</strong>
        <span class="local-badge">纯前端</span>
      </a>
      <a class="github-link" href="https://github.com/xxhh0822/sort" target="_blank" rel="noopener noreferrer" aria-label="GitHub 仓库" title="GitHub 仓库">
        <svg viewBox="0 0 16 16" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" /></svg>
      </a>
    </header>

    <main>
      <div class="workspace">
        <aside class="side-column">
          <section class="card settings-card">
            <div class="section-title"><span>01</span><h2>数据设置</h2></div>
            <div class="algorithm-select">
              <span>排序算法</span>
              <DropdownSelect :model-value="selectedAlgorithm" :options="algorithmOptions" label="排序算法" @update:model-value="chooseAlgorithm" />
            </div>
            <label class="field-label">数据模式</label>
            <div class="mode-buttons">
              <button v-for="mode in ([['random', '随机'], ['nearly', '近乎有序'], ['reversed', '倒序']] as const)" :key="mode[0]" type="button" :class="{ selected: sourceMode === mode[0] }" @click="generatePreset(mode[0])">{{ mode[1] }}</button>
            </div>
            <div class="control-grid">
              <label>
                <span>数据数量 <b>{{ count }}</b></span>
                <input v-model.number="count" type="range" min="8" max="60" @input="updateCount" />
              </label>
              <div class="control-field">
                <span>动画速度</span>
                <DropdownSelect :model-value="speed" :options="speedOptions" label="动画速度" @update:model-value="chooseSpeed" />
              </div>
            </div>
            <button class="regenerate" type="button" @click="generatePreset()"><Shuffle :size="18" />重新生成</button>
            <details class="custom-data">
              <summary>自定义数组</summary>
              <textarea v-model="customInput" rows="2" aria-label="自定义数组" placeholder="例如：8, 3, 12, 5, 1" />
              <div class="custom-actions"><span>支持逗号、空格或换行</span><button type="button" @click="applyCustomData">应用数组</button></div>
              <p v-if="customError" class="input-error" role="alert">{{ customError }}</p>
            </details>
          </section>

          <section class="card teaching-card">
            <div class="section-title"><span>02</span><h2>当前步骤</h2></div>
            <p class="step-message">{{ step.message }}</p>
            <ol class="pseudocode">
              <li v-for="(line, index) in algorithm.pseudocode" :key="line" :class="{ active: step.line === index + 1 }"><span>{{ index + 1 }}</span>{{ line }}</li>
            </ol>
            <p class="algorithm-summary">{{ algorithm.summary }}</p>
          </section>
        </aside>

        <section class="card visualizer-card">
          <div class="visualizer-head">
            <div class="section-title"><span>03</span><h2>排序演示</h2></div>
            <div class="legend"><span class="compare-dot">比较</span><span class="pivot-dot">基准</span><span class="sorted-dot">已排序</span></div>
          </div>

          <div class="bars" role="list" aria-label="排序数据柱状图">
            <div v-for="(value, index) in step.values" :key="index" class="bar-slot" role="listitem" :aria-label="`位置 ${index + 1}，值 ${value}`">
              <span v-if="showValues" class="bar-value" :style="{ bottom: `calc(${barHeight(value)} + 18px)` }">{{ value }}</span>
              <i class="bar" :class="barClass(index)" :style="{ height: barHeight(value) }" />
              <small v-if="showValues">{{ index }}</small>
            </div>
          </div>

          <div class="playback">
            <button type="button" @click="reset">重置</button>
            <button type="button" :disabled="currentIndex === 0" @click="previousStep"><ChevronLeft :size="17" />上一步</button>
            <button class="play-button" type="button" :aria-label="isPlaying ? '暂停' : '播放'" @click="togglePlay"><Pause v-if="isPlaying" :size="24" /><Play v-else :size="24" /></button>
            <button type="button" :disabled="finished" @click="nextStep">下一步<ChevronRight :size="17" /></button>
          </div>

          <div class="stats">
            <div><span>步骤</span><strong>{{ currentIndex }} / {{ totalSteps }}</strong></div>
            <div><span>比较</span><strong>{{ step.comparisons }} 次</strong></div>
            <div><span>移动</span><strong>{{ step.moves }} 次</strong></div>
            <div><span>平均</span><strong>{{ algorithm.average }}</strong></div>
          </div>

          <div class="complexity">
            <span>最好 <b>{{ algorithm.best }}</b></span><span>最坏 <b>{{ algorithm.worst }}</b></span><span>{{ algorithm.stable ? '稳定' : '不稳定' }}</span><span>{{ algorithm.inPlace ? '原地排序' : '非原地排序' }}</span>
          </div>
        </section>
      </div>
    </main>

    <footer><span>纯前端运行，数据仅在本地处理</span><a href="https://github.com/xxhh0822/sort" target="_blank" rel="noopener noreferrer" aria-label="GitHub 仓库" title="GitHub 仓库"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" /></svg></a></footer>
  </div>
</template>
