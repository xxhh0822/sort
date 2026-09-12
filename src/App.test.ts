import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.vue'

describe('App', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('lists all ten algorithms in a dropdown and switches the teaching content', async () => {
    const wrapper = mount(App)
    await wrapper.get('button[aria-label="排序算法"]').trigger('click')
    const options = wrapper.findAll('.algorithm-select .dropdown-option')
    expect(options).toHaveLength(10)
    await options[0]!.trigger('click')
    expect(wrapper.text()).toContain('重复比较相邻元素')
  })

  it('steps forward and backward deterministically', async () => {
    const wrapper = mount(App)
    const buttons = wrapper.findAll('.playback button')
    expect(wrapper.get('.stats').text()).toContain('0 /')
    await buttons[3]!.trigger('click')
    expect(wrapper.get('.stats').text()).toContain('1 /')
    await buttons[1]!.trigger('click')
    expect(wrapper.get('.stats').text()).toContain('0 /')
  })

  it('plays, pauses and advances with the selected speed', async () => {
    const wrapper = mount(App)
    await wrapper.get('.play-button').trigger('click')
    expect(wrapper.get('.play-button').attributes('aria-label')).toBe('暂停')
    await vi.advanceTimersByTimeAsync(260)
    expect(wrapper.get('.stats').text()).toContain('1 /')
    await wrapper.get('.play-button').trigger('click')
    expect(wrapper.get('.play-button').attributes('aria-label')).toBe('播放')
  })

  it('applies valid custom data and preserves the current chart on invalid input', async () => {
    const wrapper = mount(App)
    const details = wrapper.get('.custom-data')
    await details.get('summary').trigger('click')
    const input = details.get('textarea')
    await input.setValue('4, 1, 3, 2')
    await details.get('button').trigger('click')
    expect(wrapper.findAll('.bar-slot')).toHaveLength(4)
    await input.setValue('1, x')
    await details.get('button').trigger('click')
    expect(wrapper.get('[role="alert"]').text()).toContain('整数')
    expect(wrapper.findAll('.bar-slot')).toHaveLength(4)
  })

  it('shows the privacy copy and repository links', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('纯前端运行，数据仅在本地处理')
    const links = wrapper.findAll('a[aria-label="GitHub 仓库"]')
    expect(links).toHaveLength(2)
    links.forEach((link) => {
      expect(link.attributes('href')).toBe('https://github.com/xxhh0822/sort')
      expect(link.attributes('rel')).toBe('noopener noreferrer')
    })
  })
})
