sap.ui.define([
	"sap/ui/Device"
], function (Device) {
	"use strict";

	return {
		supportsStacktraces: function () {
			//Incident 1580223677: IOS does not support stacktraces
			if (Device.os.ios) {
				return false;
			}

			if (Device.browser.safari) {
				return false;
			}

			if (navigator.userAgent.indexOf("SAPFioriClient") !== -1) {
				return false;
			}

			return true;
		}
	};
}, true);
