sap.ui.define(['sap/ui/test/Opa5'], function (Opa5) {
	"use strict";

	var BaseArrangement = Opa5.extend("sap.ui.documentation.sdk.test.arrangement.BaseArrangement", {

		iClearAllData: function() {
			clearAllCookies();
			localStorage.clear();
			sessionStorage.clear();
			return this;
		},

		iDisableUsageTracking: function() {
			Opa5.extendConfig({
				appParams: {
					"sap-ui-xx-tracking": false
				}
			});
		}
	});

	// utility functions
	function clearAllCookies() {
		const aCookies = document.cookie.split(";");
		for (let i = 0; i < aCookies.length; i++) {
			const sCookie = aCookies[i];
			const iEqPos = sCookie.indexOf("=");
			const sCookieName = iEqPos > -1 ? sCookie.substring(0, iEqPos) : sCookie;
			clearCookie(sCookieName);
		}
	}

	function clearCookie(name) {
		var aDomains = window.location.hostname.split('.');
		var sCookieBase = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';

		// Try to delete the cookie at each domain level
		for (var i = 0; i < aDomains.length; i++) {
			var sDomain = aDomains.slice(i).join('.');
			document.cookie = sCookieBase + ';domain=' + sDomain;
		}
	}

	return BaseArrangement;
});