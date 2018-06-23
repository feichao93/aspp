const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const mkdirp = require('mkdirp')
const list = require('./list')

function formatDate(d) {
  const YYYY = String(d.getFullYear())
  const MM = String(d.getMonth() + 1).padStart(2, '0')
  const DD = String(d.getDate()).padStart(2, '0')
  const HH = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${YYYY}-${MM}-${DD}-${HH}_${mm}_${ss}`
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

      resolveCollFilename(docname, collName) {
        return path.join(taskDir, 'annotations', `${docname}.${collName}.yaml`)
      },

      getDoc(docname) {
        const filename = path.join(taskDir, 'docs', docname)
        if (!fs.existsSync(filename)) {
          ctx.throw(404, `doc ${docname} not found`)
        } else {
          const content = fs.readFileSync(filename, 'utf-8')
          if (docname.endsWith('.json')) {
            return JSON.parse(content)
          } else {
            return [content]
          }
        }
      },

      getDocStat(docname) {
        const filename = path.join(taskDir, 'docs', docname)
        if (!fs.existsSync(filename)) {
          ctx.throw(404, `doc ${docname} not found`)
        } else {
          // TODO
          const status = this.list()
          const docStatus = status.docs.find(doc => doc.name === docname)
          const stat = docStatus.annotations.map(collName => {
            const filename = this.resolveCollFilename(docname, collName)
            const fileStat = fs.statSync(filename)
            const coll = yaml.safeLoad(fs.readFileSync(filename, 'utf-8'))
            return {
              collName,
              // lastModified
              fileStat,
              annotationCount: coll.annotations.length,
            }
          })
          return { docname, stat }
        }
      },

      getAnnotation(docname, collName) {
        const filename = this.resolveCollFilename(docname, collName)
        if (!fs.existsSync(filename)) {
          ctx.throw(404, `annotation-set file ${filename} not found`)
        }
        return yaml.safeLoad(fs.readFileSync(filename, 'utf-8'))
      },

      deleteAnnotation(docname, collName) {
        const status = this.list()
        const doc = status.docs.find(doc => doc.name === docname)
        doc.annotations.splice(doc.annotations.indexOf(collName), 1)

        const filename = this.resolveCollFilename(docname, collName)
        const nextFilename = path.join(
          taskDir,
          'deleted',
          `${formatDate(new Date())}-${docname}.${collName}.yaml`,
        )
        mkdirp.sync(path.join(nextFilename, '..'))
        fs.renameSync(filename, nextFilename)
      },

      saveAnnotation(docname, collName) {
        const status = this.list()
        const doc = status.docs.find(doc => doc.name === docname)
        if (!doc.annotations.includes(collName)) {
          doc.annotations.push(collName)
        }
        const filename = this.resolveCollFilename(doc.name, collName)
        fs.writeFileSync(filename, yaml.safeDump(ctx.request.body), 'utf-8')
      },
    }

    await next()
  }
}
