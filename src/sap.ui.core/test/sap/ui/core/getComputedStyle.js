sap.ui.define([
  "sap/m/Carousel"
], function(Carousel) {
  "use strict";
  // Note: the HTML page 'getComputedStyle.html' loads this module via data-sap-ui-on-init

  var style = window.getComputedStyle(document.documentElement);
  //eslint-disable-next-line no-console -- there's no alternative in <head>
  console.log("style >> " + style);
  var oCarousel = new Carousel();
  oCarousel.placeAt("content");
  oCarousel.setHeight("300px");
  oCarousel.setWidth("300px");
});