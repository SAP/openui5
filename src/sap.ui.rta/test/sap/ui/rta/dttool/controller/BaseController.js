sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";
	return Controller.extend("sap.ui.rta.dttool.controller.BaseController", {

		getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		getIFrameWindow : function () {
			return document.getElementById("__component0---app--theIFrame").contentWindow;
		}
	});
});