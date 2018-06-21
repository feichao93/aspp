import ReactDOM from 'react-dom'

const schedulers = {
  /** 用于键盘/Selection相关事件的回调函数，批量进行 React 状态更新，优化 React 渲染 */
  batch: ReactDOM.unstable_batchedUpdates,
  raf: requestAnimationFrame.bind(window),
}

export default schedulers
