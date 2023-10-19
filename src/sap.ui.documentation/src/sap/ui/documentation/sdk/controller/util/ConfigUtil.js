/*!
 * ${copyright}
 */

/* Utility class that facilitates route configuration handling */
sap.ui.define([
	"sap/ui/base/Object",
	"sap/base/strings/capitalize",
	"sap/ui/thirdparty/jquery",
	"sap/ui/documentation/sdk/util/Resources",
	"sap/base/Log"
], function (BaseObject, capitalize, jQuery, ResourcesUtil, Log) {
	"use strict";

	return BaseObject.extend("sap.ui.documentation.sdk.controller.util.ConfigUtil", {

		"COOKIE_NAMES": {
			"APPROVAL_REQUESTED": "dk_approval_requested",
			"ALLOW_REQUIRED_COOKIES": "dk_allow_required_cookies"
		},

		"LOCAL_STORAGE_NAMES": {
			"OLD_NEWS_IDS": "dk_old_news_ids"
		},

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

				sViewName = "sap.ui.documentation.sdk.view." + capitalize(sViewName, 0);

				return this._oComponent.getRouter().getView(sViewName, "XML");
		},

		setCookie: function (sCookieName, sValue) {
			var sExpiresDate,
				oDate = new Date();

			oDate.setTime(oDate.getTime() + (356 * 24 * 60 * 60 * 1000)); // one year
			sExpiresDate = "expires=" + oDate.toUTCString();

			document.cookie = sCookieName + "=" + sValue + ";" + sExpiresDate + ";path=/";
		},

		getCookieValue: function (sCookieName) {
			var aCookies = document.cookie.split(';'),
				sCookie;

			sCookieName = sCookieName + "=";

			for (var i = 0; i < aCookies.length; i++) {
				sCookie = aCookies[i].trim();

				if (sCookie.indexOf(sCookieName) === 0) {
					return sCookie.substring(sCookieName.length, sCookie.length);
				}
			}

			return "";
		},

		setLocalStorageItem: function (sItem, vValue) {
			window.localStorage.setItem(sItem, JSON.stringify(vValue));
		},

		getLocalStorageItem: function (sItem) {
			return JSON.parse(window.localStorage.getItem(sItem));
		},

		removeLocalStorageItem: function (sItem) {
			window.localStorage.removeItem(sItem);
		},

		_getMasterTargetName: function(sRouteName) {
			var oRouteConfig = this._getRouteConfig(sRouteName),
				bIsSplitView = oRouteConfig && oRouteConfig.target.length === 2,
				sMasterTarget = bIsSplitView && oRouteConfig.target[0];
			return sMasterTarget;
		},

		_getRouteConfig: function(sRouteName) {
			var oConfig = this._getSapUI5ConfigEntry(),
				aRoutes = oConfig.routing.routes;

			return aRoutes.find(function(oRoute){return oRoute.name === sRouteName; });
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
		},

		// Require the configuration file for static pages paths
		_requireConfigJSON: function() {
			return new Promise(function (resolve) {
				jQuery.ajax(ResourcesUtil.getResourceOriginPath("/news-config.json"), {
						type: "GET",
						dataType: "JSON",
					success : function(oResult) {
						resolve(oResult);
					},
					error : function () {
						Log.error("failed to load news-config.json");
						resolve();
					}
				});
			});
		}
	});
});