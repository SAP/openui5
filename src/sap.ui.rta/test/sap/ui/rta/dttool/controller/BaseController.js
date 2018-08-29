sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent"
], function (Controller, UIComponent) {
	"use strict";
	var $iFrameWindow;
	return Controller.extend("sap.ui.rta.dttool.controller.BaseController", {
		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},

		getIFrameWindow: function (sIframeId) {
			if (!$iFrameWindow) {
				$iFrameWindow = sap.ui.getCore().byId(sIframeId).getDomRef().contentWindow;
			}
			return $iFrameWindow;
		}
	});
});