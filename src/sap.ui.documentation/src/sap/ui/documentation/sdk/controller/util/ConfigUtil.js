/*!
 * ${copyright}
 */

/* Utility class that facilitates route configuration handling */
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/base/Object"
], function (jQuery, BaseObject) {
	"use strict";

	return BaseObject.extend("sap.ui.documentation.sdk.controller.util.ConfigUtil", {

		constructor : function (oComponent) {
			this._oComponent = oComponent;
		},

		hasMasterView: function(sRouteName) {
			var oRouteConfig = this._getRouteConfig(sRouteName),
				bIsSplitView = oRouteConfig && oRouteConfig.target.length === 2;
			return !!bIsSplitView;
		},

		getMasterView: function(sRouteName) {
			var sMasterTargetName = this._getMasterTargetName(sRouteName),
				sTargetConfig = this._getTargetConfig(sMasterTargetName),
				sViewName = sTargetConfig.viewName;

				sViewName = "sap.ui.documentation.sdk.view." + jQuery.sap.charToUpperCase(sViewName, 0);

				return this._oComponent.getRouter().getView(sViewName);
		},

		_getMasterTargetName: function(sRouteName) {
			var oRouteConfig = this._getRouteConfig(sRouteName),
				bIsSplitView = oRouteConfig && oRouteConfig.target.length === 2,
				sMasterTarget = bIsSplitView && oRouteConfig.target[0];
			return sMasterTarget;
		},

		_getRouteConfig: function(sRouteName) {
			var oConfig = this._getSapUI5ConfigEntry(),
				aRoutes = oConfig.routing.routes,
				aRoute = jQuery.grep(aRoutes, function(oRoute){return oRoute.name === sRouteName; }),
				oRoute = aRoute.length && aRoute[0];
			return oRoute;
		},

		_getSapUI5ConfigEntry: function () {
			return this._oComponent.getMetadata().getManifestObject().getEntry("sap.ui5");
		},

		_getTargetConfig: function(sTargetName) {
			return this._getSapUI5ConfigEntry().routing.targets[sTargetName];
		},

		destroy: function () {
			this._oComponent = null;
			return BaseObject.prototype.destroy.apply(this, arguments);
		}
	});
});