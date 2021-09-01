sap.ui.define(function () { 'use strict';

  var fnNow = !(typeof window != "undefined" && window.performance && performance.now && performance.timing) ? Date.now : (function () {
    var iNavigationStart = performance.timing.navigationStart;
    return function perfnow() {
      return iNavigationStart + performance.now();
    };
  })();

  return fnNow;

});
