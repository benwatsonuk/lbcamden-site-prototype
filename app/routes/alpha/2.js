const Fs = require('fs')
const Path = require('path')
const version = '2'
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
    const heroVariant = req.query.heroVariant || 'A'
    res.render('alpha/' + versionDirectory + '/home/index.html', {
      homePage: true,
      heroVariant: heroVariant
    })
  })

  // Category
  router.get(['/alpha/' + versionDirectory + '/category/:serviceSlug', '/alpha/' + versionDirectory + '/category/:serviceSlug/'], (req, res) => {
    const theServiceSlug = req.params.serviceSlug
    const theService = serviceItems.find(x => (x.slug === theServiceSlug))
    res.render('alpha/' + versionDirectory + '/category/index.html', {
      service: theService
    })
  })

  // Sub-category
  router.get(['/alpha/' + versionDirectory + '/category/:serviceSlug/:subCategory', '/alpha/' + versionDirectory + '/category/:serviceSlug/:subCategory/'], (req, res) => {
    const theServiceSlug = req.params.serviceSlug
    const theSubCategorySlug = req.params.subCategory
    const theService = serviceItems.find(x => (x.slug === theServiceSlug))
    const theSubCategory = theService.items.find(x => (x.slug === theSubCategorySlug))
    res.render('alpha/' + versionDirectory + '/category/sub-category.html', {
      service: theService,
      subCategory: theSubCategory,
      hasChildren: checkCategoryForChildren(theSubCategory)
    })
  })

  // Further sub-categories
  router.get(['/alpha/' + versionDirectory + '/category/:serviceSlug/:subCategory/:subCategory2', '/alpha/' + versionDirectory + '/category/:serviceSlug/:subCategory/:subCategory2/'], (req, res) => {
    const theServiceSlug = req.params.serviceSlug
    const theSubCategorySlug = req.params.subCategory
    const theSubCategory2Slug = req.params.subCategory2
    const theService = serviceItems.find(x => (x.slug === theServiceSlug))
    const theSubCategory = theService.items.find(x => (x.slug === theSubCategorySlug))
    const theSubCategory2 = theSubCategory.items.find(x => (x.slug === theSubCategory2Slug))
    // const hasChildren = theSubCategory2.items
    // const template = hasChildren ? 'no-children' : 'sub-category2'
    // res.render('alpha/' + versionDirectory + '/category/' + template + '.html', {
    res.render('alpha/' + versionDirectory + '/category/sub-category2.html', {
      service: theService,
      subCategory: theSubCategory,
      subCategory2: theSubCategory2,
      hasChildren: checkCategoryForChildren(theSubCategory2)
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

  // Collections - these tend to be simpler versions of the grouped example above and have no nesting (maybe possible to consolidate in future)
  router.get(['/alpha/' + versionDirectory + '/collection/:groupSlug'], (req, res) => {
    const theGroupSlug = req.params.groupSlug
    const theGroup = collectionItems.find(x => (x.slug === theGroupSlug))
    res.render('alpha/' + versionDirectory + '/collection/index.html', {
      collectionItem: theGroup
    })
  })

  // Article page
  router.get(['/alpha/' + versionDirectory + '/article/:groupSlug/:articleSlug', '/alpha/' + versionDirectory + '/article/:groupSlug/:group2Slug/:articleSlug', '/alpha/' + versionDirectory + '/article/:groupSlug/:group2Slug/:group3Slug/:articleSlug'], (req, res) => {
    const theGroupSlug = req.params.groupSlug
    const theGroup2Slug = req.params.group2Slug || false
    const theGroup3Slug = req.params.group3Slug || false
    const theArticleSlug = req.params.articleSlug
    const theArticleDetails = getArticleDetails(theGroupSlug, theGroup2Slug, theArticleSlug, false, theGroup3Slug)
    // console.log(theArticleDetails.fileFound)
    res.render('alpha/' + versionDirectory + '/article/index.html', {
      theGroup: theArticleDetails.theGroup,
      theArticle: theArticleDetails.theArticle,
      theGroupSlug: theGroupSlug,
      theArticleSlug: theArticleSlug,
      fileFound: theArticleDetails.fileFound,
      filePath: theArticleDetails.theFilePath,
      thePages: theArticleDetails.thePages,
      pageData: theArticleDetails.pageData
    })
  })

  // Multiple page article
  router.get(['/alpha/' + versionDirectory + '/multi-part-article/:groupSlug/:articleSlug', '/alpha/' + versionDirectory + '/multi-part-article/:groupSlug/:group2Slug/:articleSlug', '/alpha/' + versionDirectory + '/multi-part-article/:groupSlug/:group2Slug/:group3Slug/:articleSlug'], (req, res) => {
    const multiPageVariant = req.query.multiPartType || 'A'
    const pageNumber = parseInt(req.query.pageNumber) || 1
    const theGroupSlug = req.params.groupSlug
    const theGroup2Slug = req.params.group2Slug
    const theGroup3Slug = req.params.group3Slug || false
    const theArticleSlug = req.params.articleSlug
    const theArticleDetails = getArticleDetails(theGroupSlug, theGroup2Slug, theArticleSlug, true, theGroup3Slug)
    res.render('alpha/' + versionDirectory + '/multi-part-article/index.html', {
      variant: multiPageVariant,
      pageNumber: pageNumber,
      theGroup: theArticleDetails.theGroup,
      theArticle: theArticleDetails.theArticle,
      theGroupSlug: theGroupSlug,
      theArticleSlug: theArticleSlug,
      fileFound: theArticleDetails.fileFound,
      filePath: theArticleDetails.theFilePath,
      thePages: theArticleDetails.thePages,
      pageData: theArticleDetails.pageData
    })
  })

  // Search
  router.post(['/alpha/' + versionDirectory + '/search/'], (req, res) => {
    const theSearchTerm = req.body.q || ''
    let theSearchSlug = 'no-results'
    if (theSearchTerm !== false) {
      // split the query into array
      const searchArray = theSearchTerm.split(' ')
      // for each item in query look for contains on searchItems
      searchArray.forEach(word => {
        searchItems.results.forEach(searchItem => {
          if (searchItem.terms.find(item => item === word.toLowerCase())) {
            theSearchSlug = searchItem.slug
          }
        })
      })
    }
    res.redirect('/alpha/' + versionDirectory + '/search/' + theSearchSlug + '?searchTerm=' + theSearchTerm)
  })

  router.get(['/alpha/' + versionDirectory + '/search', '/alpha/' + versionDirectory + '/search/:searchSlug'], (req, res) => {
    const theSearchSlug = req.params.searchSlug || false
    const theSearchTerm = req.query.searchTerm || ''
    const theSearchResults = searchItems.results.find(x => (x.slug === theSearchSlug))
    res.render('alpha/' + versionDirectory + '/search/index.html', {
      searchResults: theSearchResults,
      searchSlug: theSearchSlug,
      searchTerm: theSearchTerm
    })
  })
}

// Functions
function checkCategoryForChildren (item) {
  let children = false
  if (item.items != null) {
    item.items.forEach(x => {
      if (x.items != null) {
        children = true
      }
    })
  }
  return children
}

function getPageData (article, group1, group2, group3) {
 if (group3) {
    if (Fs.existsSync(Path.join(__dirname, '../../views/alpha/' + versionDirectory + '/content/' + group1 + '/' + group2 + '/' + group3 + '/' + article + '/data.js'))) {
      return require('../../views/alpha/' + versionDirectory + '/content/' + group1 + '/' + group2 + '/' + group2 + '/' + article + '/data.js')
    }
  }
  else if (group2) {
    if (Fs.existsSync(Path.join(__dirname, '../../views/alpha/' + versionDirectory + '/content/' + group1 + '/' + group2 + '/' + article + '/data.js'))) {
      return require('../../views/alpha/' + versionDirectory + '/content/' + group1 + '/' + group2 + '/' + article + '/data.js')
    }
  } else {
    if (Fs.existsSync(Path.join(__dirname, '../../views/alpha/' + versionDirectory + '/content/' + group1 + '/' + article + '/data.js'))) {
      return require('../../views/alpha/' + versionDirectory + '/content/' + group1 + '/' + article + '/data.js')
    }
  }
}

function getArticleDetails (theGroupSlug, theGroup2Slug, theArticleSlug, isMultiPartArticle, theGroup3Slug) {
  const theGroup = serviceItems.find(x => (x.slug === theGroupSlug))
  let theArticle = theGroup.items.find(x => (x.slug === theArticleSlug)) || theArticleSlug
  let theFilePath = null
  let fileFound = false
  let thePages = []

  // Check if content file exists
  function createPageArray (theDirectoryPath, theArray) {
    if (!isMultiPartArticle) {
      return theArray
    } else {
      let pageFiles = []
      const theFullDirectoryPath = Path.join(__dirname, '../../views/alpha/' + versionDirectory + '/content/' + theDirectoryPath)
      if (Fs.existsSync(theFullDirectoryPath)) {
        try {
          pageFiles = Fs.readdirSync(theFullDirectoryPath)
        } catch (err) {
          console.log(err)
        }
      }
      return pageFiles
    }
  }

  let pageData = null

  if (theGroup2Slug != null && theGroup2Slug !== false) {
    const group2 = theGroup.items.find(x => (x.slug === theGroup2Slug))
    theArticle = group2.items.find(x => x.slug === theArticleSlug)
    // const filePath = theGroupSlug + '/' + theGroup2Slug + '/' + theArticleSlug + '.html'
    const directoryPath = theGroupSlug + '/' + theGroup2Slug + '/'
    const path = Path.join(__dirname, '../../views/alpha/' + versionDirectory + '/content/' + directoryPath + theArticleSlug + '.html')
    if (Fs.existsSync(path)) {
      fileFound = true
      theFilePath = directoryPath + theArticleSlug + '.html'
      thePages.push(path)
    } else {
      theFilePath = directoryPath + theArticleSlug
      pageData = getPageData(theArticleSlug, theGroupSlug, theGroup2Slug)
      // console.log(pageData)
      thePages = createPageArray(directoryPath + theArticleSlug, thePages)
    }
  } else {
    // const filePath = theGroupSlug + '/' + theArticleSlug + '.html'
    const directoryPath = theGroupSlug + '/'
    const path = Path.join(__dirname, '../../views/alpha/' + versionDirectory + '/content/' + directoryPath + theArticleSlug + '.html')
    if (Fs.existsSync(path)) {
      fileFound = true
      theFilePath = directoryPath + theArticleSlug + '.html'
      thePages.push(path)
    } else {
      pageData = getPageData(theArticleSlug, theGroupSlug, false)
      // console.log(pageData)
      theFilePath = directoryPath + theArticleSlug
      thePages = createPageArray(directoryPath + theArticleSlug, thePages)
    }
  }
  // console.log(pageData)
  return {
    theGroup,
    theArticle,
    fileFound,
    theFilePath,
    thePages,
    pageData
  }
}
