const version = '0'
const versionDirectory = 'v' + version
const serviceItems = require('../../views/alpha/' + versionDirectory + '/data/services')
const groupedItems = require('../../views/alpha/' + versionDirectory + '/data/grouped-services')
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
    res.locals.orderedServiceItems = [...serviceItems].sort((a, b) => a.position - b.position)
    next()
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

  // Article page
  router.get(['/alpha/' + versionDirectory + '/article/:groupSlug/:articleSlug', '/alpha/' + versionDirectory + '/article/:groupSlug/:group2Slug/:articleSlug'], (req, res) => {
    const theGroupSlug = req.params.groupSlug
    const theGroup2Slug = req.params.group2Slug
    const theArticleSlug = req.params.articleSlug
    const theGroup = serviceItems.find(x => (x.slug === theGroupSlug))
    let theArticle = theGroup.items.find(x => (x.slug === theArticleSlug))
    if (theGroup2Slug != null) {
      console.log(theGroup2Slug)
      const group2 = theGroup.items.find(x => (x.slug === theGroup2Slug))
      console.log(group2)
      theArticle = group2.items.find(x => x.slug === theArticleSlug)
    }
    // Check if content file exists
    res.render('alpha/' + versionDirectory + '/article/index.html', {
      theGroup: theGroup,
      theArticle: theArticle,
      theGroupSlug: theGroupSlug,
      theArticleSlug: theArticleSlug
    })
  })
}
