/*!
 * ${copyright}
 */

sap.ui.define([
		"sap/ui/core/Component",
		"sap/ui/core/mvc/Controller",
		"sap/ui/VersionInfo",
		"sap/base/util/merge",
		"sap/base/util/UriParameters"
	], function(Component, Controller, VersionInfo, merge, UriParameters) {
	"use strict";

	var Component = Component.extend("sap.ui.documentation.sdk.cookieSettingsDialog.Component", {

		"COOKIE_NAMES": {
			"APPROVAL_REQUESTED": "dk_approval_requested",
			"ALLOW_REQUIRED_COOKIES": "dk_allow_required_cookies"
		},

		metadata : {
			manifest: "json"
		},

		enable: function(oRootView) {
			var oUriParameters = UriParameters.fromQuery(location.search),
			sParameter = "cookie-settings-dialog",
			bCookieSettingsParameter = oUriParameters.has(sParameter);

			if (bCookieSettingsParameter) {
				this.sCookieSettingsParameterValue = oUriParameters.get(sParameter);
			}

			if (this.sCookieSettingsParameterValue === "true" || this.sCookieSettingsParameterValue === "" || !bCookieSettingsParameter) {

				var bApprovalRequested = this.getCookieValue(this.COOKIE_NAMES.APPROVAL_REQUESTED) === "1";

				if (!bApprovalRequested) {
					this.cookieSettingsDialogOpen({
						showCookieDetails: false,
						enableAdvancedSettings: false // this flag is left for eventual future advanced cookie settings
					}, oRootView);
				}
			}
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

		/**
		 * Opens the cookie settings dialog
		 * @public
		 */
		cookieSettingsDialogOpen: function (oOptions, oView) {
			this.getCookieSettingsController().then(function(oController) {
				oController.openCookieSettingsDialog(oOptions, oView, this);
			}.bind(this));
		},

		/**
		 * Obtains the controller and creates it if no instance created yet
		 * @returns {Promise<any>}
		 */
		getCookieSettingsController: function() {
			if (!this.oCookieSettingsControllerPromise) {
				this.oCookieSettingsControllerPromise = new Promise(function(resolve, reject) {
					Controller.create({name: "sap.ui.documentation.sdk.cookieSettingsDialog.controller.CookieSettingsDialog"}).then(function(oController) {
						resolve(oController);
					});
				});
			}
			return this.oCookieSettingsControllerPromise;
		}

	});

	return Component;

});
