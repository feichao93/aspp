import { basicParser } from '../../src/utils/parseInlineAnnotations'

test('解析方括号', () => {
  expect(basicParser.parse('[DATE/2017年]第四季度净收入为[$/146.08亿元]')).toEqual([
    { entity: '2017年', tag: 'DATE' },
    '第四季度净收入为',
    { entity: '146.08亿元', tag: '$' },
  ])
})

test('正确处理转义 - 1', () => {
  expect(basicParser.parse('\\[DATE/2017年]第四季度')).toEqual(['[DATE/2017年]第四季度'])
  expect(basicParser.parse('\\\\[DATE/2017年]第四季度')).toEqual([
    '\\',
    { entity: '2017年', tag: 'DATE' },
    '第四季度',
  ])
})

test('正确处理转义 - 2', () => {
  expect(basicParser.parse('[DATE/2017年\\]第四季度]')).toEqual([
    { entity: '2017年]第四季度', tag: 'DATE' },
  ])
})

test('', () => {
  expect(basicParser.parse('[DATE/2017年\\\\]第四季度]')).toEqual([
    { entity: '2017年\\', tag: 'DATE' },
    '第四季度]',
  ])
})

test('解析圆括号', () => {
  expect(basicParser.parse('净利润为($/12.86亿元)')).toEqual([
    '净利润为',
    { placeholder: true, entity: '12.86亿元', tag: '$' },
  ])
  expect(basicParser.parse('[X/净利润]为($/12.86亿元)')).toEqual([
    { entity: '净利润', tag: 'X' },
    '为',
    { placeholder: true, entity: '12.86亿元', tag: '$' },
  ])
})
