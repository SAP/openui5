sap.ui.define(['sap/ui/test/Opa5'], function (Opa5) {
	"use strict";

	function clearAllCookies() {
		const cookies = document.cookie.split(";");
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i];
			const eqPos = cookie.indexOf("=");
			const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
			document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
		}
	}

	return Opa5.extend("sap.ui.documentation.sdk.test.arrangement.BaseArrangement", {

		iClearAllData: function() {
			clearAllCookies();
			localStorage.clear();
			sessionStorage.clear();
			return this;
		},

		iDisableUsageTracking: function() {
			Opa5.extendConfig({
				appParams:  {
					"sap-ui-xx-tracking": false
				}
			});
		}
	});
});