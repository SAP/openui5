/*!
 * ${copyright}
 */

 //Provides basic utils for the DT tool
sap.ui.define([
	"sap/ui/core/UIComponent"
],
function(
	UIComponent
) {
	"use strict";
	var Utils = {
		_oIframeWindow: null,
		_oRTAClient: null
	};

	Utils.getIframeWindow = function (sIframeId) {
		if (!Utils._oIframeWindow || Utils._oIframeWindow.frameWindow !== sIframeId) {
			Utils.setIframeWindow(sIframeId);
		}
		return Utils._oIframeWindow;
	};
	Utils.setIframeWindow = function (sIframeId) {
		Utils._oIframeWindow = sap.ui.getCore().byId(sIframeId).getDomRef().contentWindow;
	};

	Utils.getRTAClient = function () {
		return Utils._oRTAClient;
	};
	Utils.setRTAClient = function (oRTAClient) {
		Utils._oRTAClient = oRTAClient;
	};

	Utils.getRouter = function (context) {
		return UIComponent.getRouterFor(context);
	};

	return Utils;
}, /* bExport= */true);