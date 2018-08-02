sap.ui.define([
	"sap/ui/demo/masterdetail/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("sap.ui.demo.masterdetail.controller.NotFound", {

			onInit: function () {
				this.getRouter().getTarget("notFound").attachDisplay(this._onNotFoundDisplayed, this);
			},

			_onNotFoundDisplayed : function () {
					this.getModel("appView").setProperty("/layout", "OneColumn");
			}
		});
	}
);