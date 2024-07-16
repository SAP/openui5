sap.ui.define([
  "sap/ui/core/mvc/XMLView",
  "sap/ui/thirdparty/jquery",
  "sap/ui/core/mvc/Controller"
], async function(XMLView, jQuery) {
  "use strict";
  // Note: the HTML page 'LabelEnablement.html' loads this module via data-sap-ui-on-init

  sap.ui.controller("my.own.controller", {});
  var myView = await XMLView.create({definition: jQuery('#view1').html()});
  myView.placeAt("content");
});