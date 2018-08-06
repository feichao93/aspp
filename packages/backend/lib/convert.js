const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')
const glob = require('glob')
const signale = require('signale')

/** 递归地将文件夹下的所有 yaml 文件转换为 json 文件 */
module.exports = function convert(dir) {
  glob('**/*.yaml', { cwd: dir }, (err, result) => {
    if (err) {
      throw err
    }
    for (const yamlFile of result) {
      const content = yaml.safeLoad(fs.readFileSync(path.resolve(dir, yamlFile), 'utf8'))
      const jsonFile = yamlFile.replace(/yaml$/, 'json')
      fs.writeFileSync(path.resolve(dir, jsonFile), JSON.stringify(content), 'utf8')
      fs.unlinkSync(path.resolve(dir, yamlFile))
      signale.note(`${yamlFile} --> ${jsonFile}`)
    }
  })
}
