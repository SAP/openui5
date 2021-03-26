/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/Component", "sap/ui/core/mvc/Controller", "sap/ui/VersionInfo", "sap/base/util/merge"],
	function(Component, Controller, VersionInfo, merge) {
	"use strict";

	var Component = Component.extend("sap.ui.documentation.sdk.cookieSettingsDialog.Component", {

		"COOKIE_NAMES": {
			"APPROVAL_REQUESTED": "dk_approval_requested",
			"ALLOW_REQUIRED_COOKIES": "dk_allow_required_cookies",
			"ALLOW_USAGE_TRACKING": "dk_allow_usage_tracking"
		},

		SWA_CONFIG: {
			pubToken: 'd5a5359b-0b55-415c-acc8-314511b613ca',
			baseUrl: 'https://webanalytics2.cfapps.eu10.hana.ondemand.com/tracker/',
			owner: null
		},

		SWA_TRACKER_URL: "sap/webanalytics/core/tracker/js/track.js",

		metadata : {
			manifest: "json"
		},

		enable: function(oRootView) {
			VersionInfo.load().then(function (oVersionInfo) {
				var bSupportsSWA = oVersionInfo.libraries.some(function (lib) {
					return lib.name === "sap.webanalytics.core";
				}),
				bApprovalRequested = this.getCookieValue(this.COOKIE_NAMES.APPROVAL_REQUESTED) === "1",
				bHasConsentUseSWA = this.getCookieValue(this.COOKIE_NAMES.ALLOW_USAGE_TRACKING) === "1";

				if (!bApprovalRequested) {
					this.cookieSettingsDialogOpen({
						showCookieDetails: false,
						supportsUsageTracking: bSupportsSWA
					}, oRootView);
				}

				if (bSupportsSWA && bHasConsentUseSWA) {
					this.enableUsageTracking();
				}
			}.bind(this));
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

		enableUsageTracking: function() {
			this._loadSWA().then(function(swa) {
				if (swa && typeof swa.enable === "function") {
					swa.enable();
				}
			});
		},

		disableUsageTracking: function() {
			var swa = window['swa'];
			if (swa && typeof swa.disable === "function") {
				swa.disable();
			}
		},

		_loadSWA: function() {
			if (!this._oPromiseLoadSWA) {
				this._oPromiseLoadSWA = new Promise(function(resolve, reject) {
					var oSWAConfig = merge({}, this.SWA_CONFIG),
						oDoc = document,
						oNewScriptEl = oDoc.createElement('script'),
						oFirstScriptEl = oDoc.getElementsByTagName('script')[0];

					oNewScriptEl.type = 'text/javascript';
					oNewScriptEl.defer = true;
					oNewScriptEl.async = true;
					oNewScriptEl.src = sap.ui.require.toUrl(this.SWA_TRACKER_URL);
					window.addEventListener("swaLoadSuccess", function(){
						resolve(window["swa"]);
					});

					oFirstScriptEl.parentNode.insertBefore(oNewScriptEl, oFirstScriptEl);
					window["swa"] = oSWAConfig;
				}.bind(this));
			}
			return this._oPromiseLoadSWA;
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
