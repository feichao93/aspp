const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

module.exports = function list(taskDir) {
  const docDir = path.resolve(taskDir, 'docs')
  const collDir = path.resolve(taskDir, 'annotations')
  mkdirp.sync(docDir)
  mkdirp.sync(collDir)

  return getItems(docDir, collDir)

  // region function-definitions
  /** TODO 添加注释 */
  function getItems(docDir, collDir) {
    const docItems = []
    const directoryItems = []
    const names = fs.readdirSync(docDir)

    for (const name of names) {
      const stats = fs.statSync(path.resolve(docDir, name))
      if (stats.isDirectory()) {
        const subDorDir = path.join(docDir, name)
        const subCollDir = path.join(collDir, name)
        directoryItems.push({
          type: 'directory',
          name,
          items: getItems(subDorDir, subCollDir),
        })
      } else if (stats.isFile()) {
        docItems.push({
          type: 'doc',
          name,
          collnames: getCollnames(collDir, name),
        })
      }
    }

    return directoryItems.concat(docItems)
  }

  /** 读取 `collDir` 文件夹中的文件，获取与 `docname` 匹配的标注集合名称列表 */
  function getCollnames(collDir, docname) {
    const result = []
    if (fs.existsSync(collDir) && fs.statSync(collDir).isDirectory()) {
      for (const filename of fs.readdirSync(collDir)) {
        const collname = resolveCollname(filename, docname)
        if (collname != null) {
          result.push(collname)
        }
      }
    }
    return result
  }
  // endregion
}

/** 根据文本文档名称 `docname` 从文件名 `filename` 中获取标注集合的名称 `collname`。
 * 如果文件名和文本文档名称不匹配，则函数返回 `null`
 *
 * 示例：
 * docname 为  `'特色小镇忌纯房地产开发.txt'`
 * filename 为  `'特色小镇忌纯房地产开发.txt.test.yaml'`
 * 则返回结果为 `'test'`
 *  */
function resolveCollname(filename, docname) {
  if (filename.startsWith(docname)) {
    const match = filename.replace(docname, '').match(/\.([\w-]+)\.yaml/)
    return match && match[1]
  } else {
    return null
  }
}
