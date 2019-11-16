const fs = require('fs')
const path = require('path')

const clientConfig = require('./webpack.client.config')
const serverConfig = require('./webpack.server.config')

const readFile = (fs, file) => {
  try {
    return fs.readFileSync(path.join(clientConfig.output.path, file), 'utf-8')
  }
  catch (e) { console.error(e) }
}

module.exports = function setupDevServer(app, templatePath, cb) {

}
