
require 'coffee-script/register'

argv = require('minimist')(process.argv[2..])

path = require 'path'
express = require 'express'
bodyParser = require 'body-parser'

api = require './api'
router = api express.Router()

static_path = path.join __dirname, '../source'


app = express()

try
    require('./router').call app, '

        /logout

        /api/web/login
        /api/web/register/submit

        /wx/signature

        GET/getClientIp
    '
catch
    app.use require('cookie-parser')()
    app.use bodyParser.json()
    app.use bodyParser.urlencoded extended: true
    app.use router

app.use express.static static_path


app.get '*.min.js.map$', (req, res) ->
    res.status(204).end()

app.get '/*', (req, res) ->
    res.sendFile 'index.html', root: static_path


app.listen (argv.p or argv.port or 4000), ->
    console.log "Listening on port #{ this.address().port }"
