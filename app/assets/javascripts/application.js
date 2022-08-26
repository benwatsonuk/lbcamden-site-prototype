/* global $ */

// Warn about using the kit in production
if (window.console && window.console.info) {
  window.console.info('GOV.UK Prototype Kit - do not use for production')
}

$('#menu-toggle').click(() => {
  $('.lbcamden-header--nav').toggle()
  $('.lbcamden-header--search').hide()
})

$('#search-toggle').click(() => {
  $('.lbcamden-header--search').toggle()
  $('.lbcamden-header--nav').hide()
  $('#search-main-b48c4de8').focus()
})

$(document).ready(function () {
  window.GOVUKFrontend.initAll()
  window.LBCamdenFrontend.initAll()
})
