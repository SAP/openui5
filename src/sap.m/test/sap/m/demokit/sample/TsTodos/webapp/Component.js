sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
  "use strict";
  /**
   * @namespace sap.m.sample.TsTodos.webapp
   */
  var Component = UIComponent.extend("sap.m.sample.TsTodos.webapp.Component", {
    metadata: {
      manifest: "json"
    },
    init: function _init() {
      // call the base component's init function
      UIComponent.prototype.init.call(this);
    }
  });
  return Component;
});