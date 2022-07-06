sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/locate-me', './v4/locate-me'], function (exports, Theme, locateMe$1, locateMe$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? locateMe$1.pathData : locateMe$2.pathData;
	var locateMe = "locate-me";

	exports.accData = locateMe$1.accData;
	exports.ltr = locateMe$1.ltr;
	exports.default = locateMe;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
