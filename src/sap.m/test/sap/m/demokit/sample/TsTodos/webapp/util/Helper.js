/* global jQuery */
sap.ui.define([], function () {
  "use strict";
  var Helper = {
    resolvePath: function resolvePath(imgPath) {
      var rootPath = jQuery.sap.getModulePath("sap.m.sample.TsTodos.webapp");
      return rootPath + imgPath;
    }
  };
  return Helper;
});