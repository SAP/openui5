sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/reset', './v4/reset'], function (exports, Theme, reset$1, reset$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? reset$1.pathData : reset$2.pathData;
	var reset = "reset";

	exports.accData = reset$1.accData;
	exports.ltr = reset$1.ltr;
	exports.default = reset;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
