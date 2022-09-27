sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";
  /**
   * @namespace sap.m.sample.TsTodos.webapp.controller
   */
  var BaseController = Controller.extend("sap.m.sample.TsTodos.webapp.controller.BaseController", {
    getOwnerComponent: function _getOwnerComponent() {
      return Controller.prototype.getOwnerComponent.call(this);
    },
    getResourceBundle: function _getResourceBundle() {
      var oModel = this.getOwnerComponent().getModel("i18n");
      return oModel.getResourceBundle();
    },
    getModel: function _getModel(sName) {
      return this.getView().getModel(sName);
    },
    setModel: function _setModel(oModel, sName) {
      this.getView().setModel(oModel, sName);
      return this;
    }
  });
  return BaseController;
});