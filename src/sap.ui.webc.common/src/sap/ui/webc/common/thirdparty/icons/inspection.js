sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/inspection', './v4/inspection'], function (exports, Theme, inspection$1, inspection$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? inspection$1.pathData : inspection$2.pathData;
	var inspection = "inspection";

	exports.accData = inspection$1.accData;
	exports.ltr = inspection$1.ltr;
	exports.default = inspection;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
