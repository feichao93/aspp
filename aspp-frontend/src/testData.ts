import AnnotatedDoc from './types/AnnotatedDoc'
import PlainDoc from './types/PlainDoc'
import { getNextId } from './utils/common'

export const plainDoc: PlainDoc = PlainDoc.fromJS({
  id: 'test-doc',
  blocks: [
    '开场阿斯加德人遭到了灭霸的袭击，他们对附近发出了求救讯号，抵抗已经失败，乌木喉跨过死者，受伤的海姆达尔躺在地上，洛基被黑暗教团包围，灭霸一个人船首把托尔带到他面前，问是要他哥的头还是空间宝石。过程中灭霸说了他失败的感受，索尔喷他话太多，并且告诉了观众一星期前柴达被毁，力量宝石被夺走。灭霸使用力量宝石烧托尔脑袋时，洛基虽然表示不在乎，但还是放弃了坚持，交出了宝石，这个时候却告诉灭霸他们还有浩克（妇联1铁人对洛基说我们还有浩克的梗），浩克借着这个机会突袭了灭霸。一开始轻松压制灭霸，但灭霸没有任何损伤或感觉，被打进船体以后开始反杀，黑矮星想帮灭霸，乌木喉说让灭霸玩玩吧。灭霸完全靠肉搏碾压打爆了浩克，并且一点伤都没受，几招过后浩克就彻底失去了战斗能力，而灭霸连宝石都没有用。海姆达尔利用最后的力量，将浩克传送到地球的纽约圣所警告人类，自己也被人发现，灭霸用亡刃的武器杀了他。 ',
    '卡魔拉为此大哭并且非常的伤心，收集者在后面的柜子里拍手叫好。没一会儿，却听到灭霸说话，他认为卡魔拉还是关心自己的，跟着才发现灭霸已经拿到了现实宝石，并且刚才他们看到的一切东西，都是灭霸用宝石制造出来的幻象而已，整个Knowhere早就被灭霸打成了一片火海，屠杀所有的住民，他们以为废弃的景象都是假的，螳螂妹与毁灭者想要帮忙，结果却被现实宝石切成了块和条状物。',
  ],
})

export const annotatedDoc = AnnotatedDoc.fromJS({
  id: getNextId('annotated-doc'),
  author: 'test-author',
  annotationSet: [
    {
      id: getNextId('annotation'),
      range: { blockIndex: 0, startOffset: 10, endOffset: 12 },
      confidence: 0.8,
      tag: 'role',
    },
    {
      id: getNextId('annotation'),
      range: { blockIndex: 0, startOffset: 36, endOffset: 39 },
      confidence: 0.8,
      tag: 'role',
    },
    {
      id: getNextId('annotation'),
      range: { blockIndex: 0, startOffset: 47, endOffset: 51 },
      confidence: 0.8,
      tag: 'role',
    },
    {
      id: getNextId('annotation'),
      range: { blockIndex: 0, startOffset: 56, endOffset: 58 },
      confidence: 0.8,
      tag: 'role',
    },
    {
      id: getNextId('annotation'),
      range: { blockIndex: 0, startOffset: 66, endOffset: 68 },
      confidence: 0.8,
      tag: 'role',
    },
    {
      id: getNextId('annotation'),
      range: { blockIndex: 0, startOffset: 99, endOffset: 101 },
      confidence: 0.8,
      tag: 'role',
    },
    {
      id: getNextId('annotation'),
      range: { blockIndex: 0, startOffset: 110, endOffset: 112 },
      confidence: 0.8,
      tag: 'role',
    },
    {
      id: getNextId('annotation'),
      range: { blockIndex: 0, startOffset: 129, endOffset: 131 },
      confidence: 0.8,
      tag: 'role',
    },
    {
      id: getNextId('annotation'),
      range: { blockIndex: 0, startOffset: 134, endOffset: 138 },
      confidence: 0.8,
      tag: 'item',
    },
    {
      id: getNextId('annotation'),
      range: { blockIndex: 0, startOffset: 142, endOffset: 144 },
      confidence: 0.8,
      tag: 'role',
    },
    {
      id: getNextId('annotation'),
      range: { blockIndex: 0, startOffset: 146, endOffset: 150 },
      confidence: 0.8,
      tag: 'role',
    },
    {
      id: getNextId('annotation'),
      range: { blockIndex: 0, startOffset: 151, endOffset: 153 },
      confidence: 0.8,
      tag: 'role',
    },
  ],
  plainDoc,
})
