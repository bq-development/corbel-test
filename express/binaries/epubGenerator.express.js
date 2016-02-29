var EpubGenerator = require('epub-generator')

var requiredFields = ['title', 'author', 'description', 'rights', 'content']

function getXhtmlContent (head, data) {
  return '<?xml version="1.0" encoding="utf-8"?>' +
  '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">' +
  '<html xmlns="http://www.w3.org/1999/xhtml">' +
  '<head><title>' + head + '</title></head>' +
  data +
  '</html>'
}

function isValidEpubOptions (options) {
  return requiredFields.every(function (key) {
    return options.hasOwnProperty(key)
  })
}

module.exports = function setup (app) {
  app.post('/binaries/generateEpub', function (req, res) {
    var options = req.body
    if (!isValidEpubOptions(options)) {
      res.status(400).send({
        error: 'Required fields: ' + requiredFields
      })
      return
    }

    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Content-disposition': 'attachment; filename=myFile.epub'
    })

    var builder = new EpubGenerator({
      title: options.title,
      author: options.author,
      description: options.description,
      rights: options.rights,
      content: options.content
    })

    builder.add('index.xhtml', getXhtmlContent(options.title, options.content), {
      title: options.title,
      toc: true
    })

    builder.end()
      .pipe(res)
  })
}
