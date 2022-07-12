/* global $ */

// Warn about using the kit in production
if (window.console && window.console.info) {
  window.console.info('GOV.UK Prototype Kit - do not use for production')
}

$('#menu-toggle').click(() => {
  $('.LBCamden-Header--nav').toggle()
  $('.LBCamden-Header--search').hide()
})

$('#search-toggle').click(() => {
  $('.LBCamden-Header--search').toggle()
  $('.LBCamden-Header--nav').hide()
  $('#search-main-b48c4de8').focus()
})

$(document).ready(function () {
  window.GOVUKFrontend.initAll()
  window.LBCamdenFrontend.initAll()
})
