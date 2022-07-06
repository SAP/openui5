sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/wrench', './v4/wrench'], function (exports, Theme, wrench$1, wrench$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? wrench$1.pathData : wrench$2.pathData;
	var wrench = "wrench";

	exports.accData = wrench$1.accData;
	exports.ltr = wrench$1.ltr;
	exports.default = wrench;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
