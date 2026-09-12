import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DropdownSelect from './DropdownSelect.vue'

const options = [
  { value: 'first', label: '第一项' },
  { value: 'second', label: '第二项' },
  { value: 'third', label: '第三项' },
]

describe('DropdownSelect', () => {
  it('opens the themed list and selects an option', async () => {
    const wrapper = mount(DropdownSelect, {
      props: { modelValue: 'first', options, label: '测试选项' },
    })

    await wrapper.get('.dropdown-trigger').trigger('click')
    expect(wrapper.get('.dropdown-trigger').attributes('aria-expanded')).toBe('true')
    expect(wrapper.findAll('.dropdown-option')).toHaveLength(3)
    await wrapper.findAll('.dropdown-option')[1]!.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['second']])
    expect(wrapper.get('.dropdown-trigger').attributes('aria-expanded')).toBe('false')
  })

  it('supports arrow keys, Enter and Escape', async () => {
    const wrapper = mount(DropdownSelect, {
      props: { modelValue: 'first', options, label: '测试选项' },
    })
    const trigger = wrapper.get('.dropdown-trigger')

    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(trigger.attributes('aria-activedescendant')).toContain('-1')
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')).toEqual([['second']])

    await trigger.trigger('click')
    await trigger.trigger('keydown', { key: 'End' })
    expect(trigger.attributes('aria-activedescendant')).toContain('-2')
    await trigger.trigger('keydown', { key: 'Escape' })
    expect(trigger.attributes('aria-expanded')).toBe('false')
  })
})
