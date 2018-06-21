import diffColls from '../../src/utils/diffColls'
import { parseInlineAnnotations as parse } from '../../src/utils/parseInlineAnnotations'

const consistent = (str: string, startOffset: number) => {
  const { entity, tag } = parse(str).annotations[0]
  return {
    type: 'consistent',
    entity,
    startOffset,
    tag,
  }
}

const partial = (str: string, startOffset: number) => ({
  lack: (...lack: number[]) => {
    const { entity, tag } = parse(str).annotations[0]
    return { type: 'partial', entity, startOffset, tag, lack }
  },
})
const conflict = (entity: string, startOffset: number) => ({
  detail: (detail: any) => ({ type: 'conflict', entity, startOffset, detail }),
})

test('所有标注均一致的情况', () => {
  const text = '2017年第四季度净收入为146.08亿元，同比增加20.7%；净利润为12.86亿元'
  const a = '[DATE/2017年]第四季度净收入为[$/146.08亿元]，同比[P/增加20.7%]；净利润为[$/12.86亿元]'
  const b = '[DATE/2017年]第四季度净收入为[$/146.08亿元]，同比[P/增加20.7%]；净利润为[$/12.86亿元]'
  const c = '[DATE/2017年]第四季度净收入为[$/146.08亿元]，同比[P/增加20.7%]；净利润为[$/12.86亿元]'

  expect(
    diffColls(
      text,
      new Map([
        ['a', parse(a).annotations],
        ['b', parse(b).annotations],
        ['c', parse(c).annotations],
      ]),
    ),
  ).toEqual([
    consistent('[DATE/2017年]', text.indexOf('2017年')),
    consistent('[$/146.08亿元]', text.indexOf('146.08亿元')),
    consistent('[P/增加20.7%]', text.indexOf('增加20.7%')),
    consistent('[$/12.86亿元]', text.indexOf('12.86亿元')),
  ])
})

test('部分缺失，但标注一致的情况', () => {
  const text = '2017年第四季度净收入为146.08亿元，同比增加20.7%；净利润为12.86亿元'
  // 花括号表示忽略一个标注
  // a 中忽略 1 个标注
  const a = '[DATE/2017年]第四季度净收入为[$/146.08亿元]，同比[P/增加20.7%]；净利润为{$/12.86亿元}'
  // b 中忽略 2 个标注
  const b = '{DATE/2017年}第四季度净收入为{$/146.08亿元}，同比[P/增加20.7%]；净利润为[$/12.86亿元]'
  // c 中忽略 1 个标注
  const c = '[DATE/2017年]第四季度净收入为[$/146.08亿元]，同比[P/增加20.7%]；净利润为{$/12.86亿元}'

  expect(
    diffColls(
      text,
      new Map([
        ['a', parse(a).annotations],
        ['b', parse(b).annotations],
        ['c', parse(c).annotations],
      ]),
    ),
  ).toEqual([
    partial('[DATE/2017年]', text.indexOf('2017年')).lack(1),
    partial('[$/146.08亿元]', text.indexOf('146.08亿元')).lack(1),
    consistent('[P/增加20.7%]', text.indexOf('增加20.7%')),
    partial('[$/12.86亿元]', text.indexOf('12.86亿元')).lack(0, 2),
  ])
})

test('简单的冲突的情况', () => {
  const text = '2017年第四季度净收入为146.08亿元，同比增加20.7%；净利润为12.86亿元'
  const a = '[DATE/2017年第四季度]净[$/收入为146.08亿元]，同比[P/增加20.7%]；净利润为[$/12.86亿元]'
  const b = '2017年[DATE/第四季度]净收入为[$/146.08亿元]，同比[P/增加20.7%]；净利润为[$/12.86亿元]'
  const c = '[DATE/2017年]第四季度净收入为[$/146.08亿元]，同比[P/增加20.7%]；净利润为[$/12.86亿元]'

  expect(
    diffColls(
      text,
      new Map([
        ['a', parse(a).annotations],
        ['b', parse(b).annotations],
        ['c', parse(c).annotations],
      ]),
    ),
  ).toEqual([
    conflict('2017年第四季度', text.indexOf('2017年第四季度')).detail([
      { group: [0], annotation: '[DATE/2017年第四季度]' },
      { group: [1], annotation: '2017年[DATE/第四季度]' },
      { group: [2], annotation: '[DATE/2017年]第四季度' },
    ]),
    conflict('146.08亿元', text.indexOf('146.08亿元')).detail([
      { group: [0], annotation: '[$/收入为146.08亿元]' },
      { group: [1, 2], annotation: '收入为[$/146.08亿元]' },
    ]),
    consistent('[p/增加20.7%]', text.indexOf('增加20.7%')),
    consistent('[$/12.86亿元]', text.indexOf('12.86亿元')),
  ])
})

// TODO test('较为复杂的冲突的情况')
