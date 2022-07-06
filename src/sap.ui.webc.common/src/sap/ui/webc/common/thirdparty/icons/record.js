sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/record', './v4/record'], function (exports, Theme, record$1, record$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? record$1.pathData : record$2.pathData;
	var record = "record";

	exports.accData = record$1.accData;
	exports.ltr = record$1.ltr;
	exports.default = record;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
