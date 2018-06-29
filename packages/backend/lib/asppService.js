const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const mkdirp = require('mkdirp')
const list = require('./list')

function remove(array, item) {
  const index = array.indexOf(item)
  if (index !== -1) {
    array.splice(index, 1)
  }
}

function formatDate(d) {
  const YYYY = String(d.getFullYear())
  const MM = String(d.getMonth() + 1).padStart(2, '0')
  const DD = String(d.getDate()).padStart(2, '0')
  const HH = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${YYYY}-${MM}-${DD}-${HH}_${mm}_${ss}`
}

function parseFulDocPath(fullDocPath) {
  const split = fullDocPath.split('/')
  const docPath = split.slice(0, split.length - 1)
  const docname = split[split.length - 1]
  return { docPath, docname }
}

function findDocInTree(items, fullDocPath) {
  const { docPath, docname } = parseFulDocPath(fullDocPath)
  for (const name of docPath) {
    items = items.find(item => item.name === name).items
  }
  return items.find(item => item.name === docname)
}

module.exports = function asppService({ taskDir }) {
  let status = null
  let config = null

  return async (ctx, next) => {
    ctx.aspp = {
      getConfig() {
        if (config == null) {
          const content = fs.readFileSync(path.join(taskDir, 'aspp.config.yaml'), 'utf-8')
          config = yaml.safeLoad(content)
        }
        return config
      },

      list(reload = false) {
        if (reload || status == null) {
          status = list(taskDir)
        }
        return status
      },

      resolveDocFilename(fullDocPath) {
        return path.join(taskDir, 'docs', fullDocPath)
      },

      resolveCollFilename(fullDocPath, collname) {
        return path.join(taskDir, 'annotations', `${fullDocPath}.${collname}.yaml`)
      },

      async getDoc(fullDocPath) {
        const filename = this.resolveDocFilename(fullDocPath)
        if (!fs.existsSync(filename)) {
          ctx.throw(404, `File ${fullDocPath} not found`)
        } else {
          const content = fs.readFileSync(filename, 'utf-8')
          if (fullDocPath.endsWith('.json')) {
            ctx.body = JSON.parse(content)
          } else {
            ctx.body = [content]
          }
        }
      },

      async getDocStat(fullDocPath) {
        const filename = this.resolveDocFilename(fullDocPath)
        if (!fs.existsSync(filename)) {
          ctx.throw(404, `File ${fullDocPath} not found`)
        }
        const doc = findDocInTree(this.list(), fullDocPath)
        ctx.body = doc.collnames.map(collname => {
          const filename = this.resolveCollFilename(fullDocPath, collname)
          const fileStat = fs.statSync(filename)
          const coll = yaml.safeLoad(fs.readFileSync(filename, 'utf-8'))
          return { collname, fileStat, annotationCount: coll.annotations.length }
        })
      },

      async getColl(fullDocPath, collname) {
        const filename = this.resolveCollFilename(fullDocPath, collname)
        if (!fs.existsSync(filename)) {
          ctx.throw(404, `File ${filename} not found`)
        }
        ctx.body = yaml.safeLoad(fs.readFileSync(filename, 'utf-8'))
      },

      async deleteColl(fullDocPath, collname) {
        const doc = findDocInTree(this.list(), fullDocPath)
        remove(doc.collnames, collname)

        const collFilename = this.resolveCollFilename(fullDocPath, collname)
        const { docname } = parseFulDocPath(fullDocPath)
        const trash = path.join(
          taskDir,
          'deleted',
          `${formatDate(new Date())}-${docname}.${collname}.yaml`,
        )
        mkdirp.sync(path.join(trash, '..'))
        fs.renameSync(collFilename, trash)
        ctx.status = 200
      },

      async putColl(fullDocPath, collname, content) {
        const doc = findDocInTree(this.list(), fullDocPath)
        if (!doc.collnames.includes(collname)) {
          doc.collnames.push(collname)
        }
        const filename = this.resolveCollFilename(fullDocPath, collname)
        mkdirp.sync(path.resolve(filename, '..'))
        fs.writeFileSync(filename, yaml.safeDump(content), 'utf-8')
        ctx.status = 200
      },

      async renameColl(fullDocPath, collname, newName) {
        const doc = findDocInTree(this.list(), fullDocPath)

        remove(doc.collnames, collname)
        doc.collnames.push(newName)

        const collFilename = this.resolveCollFilename(fullDocPath, collname)
        const newFilename = this.resolveCollFilename(fullDocPath, newName)
        fs.renameSync(collFilename, newFilename)
        ctx.status = 200
      },
    }

    await next()
  }
}
