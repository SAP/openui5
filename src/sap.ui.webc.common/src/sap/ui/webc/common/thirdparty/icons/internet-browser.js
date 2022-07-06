sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/internet-browser', './v4/internet-browser'], function (exports, Theme, internetBrowser$1, internetBrowser$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? internetBrowser$1.pathData : internetBrowser$2.pathData;
	var internetBrowser = "internet-browser";

	exports.accData = internetBrowser$1.accData;
	exports.ltr = internetBrowser$1.ltr;
	exports.default = internetBrowser;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
