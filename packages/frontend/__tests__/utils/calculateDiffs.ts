import { RawAnnotation } from '../../src/types/Annotation'
import { RawRange } from '../../src/types/DecorationRange'
import calculateDiffs, { Diff } from '../../src/utils/calculateDiffs'
import { parseInlineAnnotations as parse } from '../../src/utils/parseInlineAnnotations'
import { RawColl } from '../../src/utils/server'

function consistent(str: string, startOffset: number): Diff {
  const { entity } = parse(str).annotations[0]
  return {
    type: 'consistent',
    range: { blockIndex: 0, startOffset, endOffset: startOffset + entity.length },
  }
}

const partial = (str: string, startOffset: number) => {
  const { entity } = parse(str).annotations[0]
  return {
    type: 'partial',
    range: { blockIndex: 0, startOffset, endOffset: startOffset + entity.length },
  }
}

function conflict(str: string, range: RawRange): Diff {
  return { type: 'conflict', range }
}

function getRange(text: string, entity: string) {
  const startOffset = text.indexOf(entity)
  return {
    blockIndex: 0,
    startOffset,
    endOffset: startOffset + entity.length,
  }
}

function simpleColl(annotations: RawAnnotation[]): RawColl {
  return {
    name: '',
    annotations,
    slots: [],
  }
}

test('所有标注均一致的情况', () => {
  const text = '2017年第四季度净收入为146.08亿元，同比增加20.7%；净利润为12.86亿元'
  const a = '[DATE/2017年]第四季度净收入为[$/146.08亿元]，同比[P/增加20.7%]；净利润为[$/12.86亿元]'
  const b = '[DATE/2017年]第四季度净收入为[$/146.08亿元]，同比[P/增加20.7%]；净利润为[$/12.86亿元]'
  const c = '[DATE/2017年]第四季度净收入为[$/146.08亿元]，同比[P/增加20.7%]；净利润为[$/12.86亿元]'

  expect(
    calculateDiffs(
      new Map([
        ['a', simpleColl(parse(a).annotations)],
        ['b', simpleColl(parse(b).annotations)],
        ['c', simpleColl(parse(c).annotations)],
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
  const a = '[DATE/2017年]第四季度净收入为[$/146.08亿元]，同比[P/增加20.7%]；净利润为($/12.86亿元)'
  // b 中忽略 2 个标注
  const b = '(DATE/2017年)第四季度净收入为($/146.08亿元)，同比[P/增加20.7%]；净利润为[$/12.86亿元]'
  // c 中忽略 1 个标注
  const c = '[DATE/2017年]第四季度净收入为[$/146.08亿元]，同比[P/增加20.7%]；净利润为($/12.86亿元)'

  expect(
    calculateDiffs(
      new Map([
        ['a', simpleColl(parse(a).annotations)],
        ['b', simpleColl(parse(b).annotations)],
        ['c', simpleColl(parse(c).annotations)],
      ]),
    ),
  ).toEqual([
    partial('[DATE/2017年]', text.indexOf('2017年')),
    partial('[$/146.08亿元]', text.indexOf('146.08亿元')),
    consistent('[P/增加20.7%]', text.indexOf('增加20.7%')),
    partial('[$/12.86亿元]', text.indexOf('12.86亿元')),
  ])
})

test('简单的冲突的情况', () => {
  const text = '2017年第四季度净收入为146.08亿元，同比增加20.7%；净利润为12.86亿元'
  const a = '[DATE/2017年第四季度]净[$/收入为146.08亿元]，同比[P/增加20.7%]；净利润为[$/12.86亿元]'
  const b = '2017年[DATE/第四季度]净收入为[$/146.08亿元]，同比[P/增加20.7%]；净利润为[$/12.86亿元]'
  const c = '[DATE/2017年]第四季度净收入为[$/146.08亿元]，同比[P/增加20.7%]；净利润为[$/12.86亿元]'

  expect(
    calculateDiffs(
      new Map([
        ['a', simpleColl(parse(a).annotations)],
        ['b', simpleColl(parse(b).annotations)],
        ['c', simpleColl(parse(c).annotations)],
      ]),
    ),
  ).toEqual([
    // { group: ['a'], annotation: '[DATE/2017年第四季度]' },
    // { group: ['b'], annotation: '2017年[DATE/第四季度]' },
    // { group: ['c'], annotation: '[DATE/2017年]第四季度' },
    conflict('2017年第四季度', getRange(text, '2017年第四季度')),

    // { group: ['a'], annotation: '[$/收入为146.08亿元]' },
    // { group: ['b', 'c'], annotation: '收入为[$/146.08亿元]' },
    conflict('146.08亿元', getRange(text, '收入为146.08亿元')),

    consistent('[p/增加20.7%]', text.indexOf('增加20.7%')),
    consistent('[$/12.86亿元]', text.indexOf('12.86亿元')),
  ])
})

// TODO test('较为复杂的冲突的情况')
