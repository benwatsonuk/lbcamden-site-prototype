const Fs = require('fs')
const Path = require('path')
const version = '1'
const versionDirectory = 'v' + version
const serviceItems = require('../../views/alpha/' + versionDirectory + '/data/services')
const groupedItems = require('../../views/alpha/' + versionDirectory + '/data/grouped-services')
const collectionItems = require('../../views/alpha/' + versionDirectory + '/data/collections')
const popularItems = require('../../views/alpha/' + versionDirectory + '/data/popular')
const searchItems = require('../../views/alpha/' + versionDirectory + '/data/search')
const sortServicesBy = 'alphabetical' // alphabetical, orderValue, none

if (sortServicesBy === 'alphabetical') {
  serviceItems.sort((a, b) => a.title.localeCompare(b.title))
}
if (sortServicesBy === 'orderValue') {
  serviceItems.sort((a, b) => a.position - b.position)
}

// Add your routes here - above the module.exports line
module.exports = function (router) {
  router.use((req, res, next) => {
    res.locals.versionDirectory = versionDirectory
    res.locals.serviceItems = serviceItems
    res.locals.groupedItems = groupedItems
    res.locals.popularItems = popularItems
    res.locals.searchItems = searchItems
    res.locals.orderedServiceItems = [...serviceItems].sort((a, b) => a.position - b.position)
    next()
  })

  router.use((req, res, next) => {
    if (req.query.theme) {
      req.session.theme = req.query.theme || 0
    }
    res.locals.theme = req.session.theme || 0
    if (req.query.headerType) {
      req.session.headerType = req.query.headerType || null
    }
    res.locals.headerType = req.session.headerType || null
    if (req.query.categoryType) {
      req.session.categoryType = req.query.categoryType || null
    }
    res.locals.categoryType = req.session.categoryType || null
    next()
  })

  // Home
  router.get(['/alpha/' + versionDirectory + '/home'], (req, res) => {
    res.render('alpha/' + versionDirectory + '/home/index.html', {
      homePage: true
    })
  })

  // Category
  router.get(['/alpha/' + versionDirectory + '/category/:serviceSlug'], (req, res) => {
    const theServiceSlug = req.params.serviceSlug
    const theService = serviceItems.find(x => (x.slug === theServiceSlug))
    res.render('alpha/' + versionDirectory + '/category/index.html', {
      service: theService
    })
  })

  // Grouped
  router.get(['/alpha/' + versionDirectory + '/grouped/:groupSlug'], (req, res) => {
    const theGroupSlug = req.params.groupSlug
    const theGroup = groupedItems.find(x => (x.slug === theGroupSlug))
    res.render('alpha/' + versionDirectory + '/grouped/index.html', {
      groupedItem: theGroup
    })
  })

  // Colections - these tend to be simpler versions of the grouped example above and have no nesting (maybe possible to consolidate in future)
  router.get(['/alpha/' + versionDirectory + '/collection/:groupSlug'], (req, res) => {
    const theGroupSlug = req.params.groupSlug
    const theGroup = collectionItems.find(x => (x.slug === theGroupSlug))
    res.render('alpha/' + versionDirectory + '/collection/index.html', {
      collectionItem: theGroup
    })
  })

  // Article page
  router.get(['/alpha/' + versionDirectory + '/article/:groupSlug/:articleSlug', '/alpha/' + versionDirectory + '/article/:groupSlug/:group2Slug/:articleSlug'], (req, res) => {
    const theGroupSlug = req.params.groupSlug
    const theGroup2Slug = req.params.group2Slug
    const theArticleSlug = req.params.articleSlug
    let fileFound = false
    const theGroup = serviceItems.find(x => (x.slug === theGroupSlug))
    let theArticle = theGroup.items.find(x => (x.slug === theArticleSlug))
    let theFilePath = null
    // Check if content file exists
    if (theGroup2Slug != null) {
      const group2 = theGroup.items.find(x => (x.slug === theGroup2Slug))
      theArticle = group2.items.find(x => x.slug === theArticleSlug)
      const filePath = theGroupSlug + '/' + theGroup2Slug + '/' + theArticleSlug + '.html'
      const path = Path.join(__dirname, '../../views/alpha/' + versionDirectory + '/content/' + filePath)
      if (Fs.existsSync(path)) {
        fileFound = true
        theFilePath = filePath
      }
    } else {
      const filePath = theGroupSlug + '/' + theArticleSlug + '.html'
      const path = Path.join(__dirname, '../../views/alpha/' + versionDirectory + '/content/' + filePath)
      if (Fs.existsSync(path)) {
        fileFound = true
        theFilePath = filePath
      }
    }
    res.render('alpha/' + versionDirectory + '/article/index.html', {
      theGroup: theGroup,
      theArticle: theArticle,
      theGroupSlug: theGroupSlug,
      theArticleSlug: theArticleSlug,
      fileFound: fileFound,
      filePath: theFilePath
    })
  })

  // Search
  router.post(['/alpha/' + versionDirectory + '/search/'], (req, res) => {
    const theSearchTerm = req.body.q
    const theSearchSlug = 'food' //searchItems.find(x => (x.terms === theSearchTerm))
    res.redirect('/alpha/' + versionDirectory + '/search/' + theSearchSlug)
  })

  router.get(['/alpha/' + versionDirectory + '/search', '/alpha/' + versionDirectory + '/search/:searchSlug'], (req, res) => {
    const theSearchSlug = req.params.searchSlug
    const theSearchResults = [] //searchItems.results.find(x => (x.slug === theSearchSlug))
    res.render('alpha/' + versionDirectory + '/search/index.html', {
      searchResults: theSearchResults,
      searchTerm: 'Food business'
    })
  })
}
