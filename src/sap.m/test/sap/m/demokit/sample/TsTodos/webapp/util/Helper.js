sap.ui.define([], function () {
  "use strict";
  var Helper = {
    resolvePath: function resolvePath(imgPath) {
      var rootPath = sap.ui.require.toUrl("sap/m/sample/TsTodos/webapp");
      return rootPath + imgPath;
    }
  };
  return Helper;
});