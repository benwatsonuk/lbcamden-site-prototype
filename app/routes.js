const express = require('express')
const router = express.Router()

// Add your routes here - above the module.exports line
require('./routes/alpha/0.js')(router)
require('./routes/alpha/1.js')(router)
require('./routes/alpha/2.js')(router)

module.exports = router
