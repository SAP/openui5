sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/lead', './v4/lead'], function (exports, Theme, lead$1, lead$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? lead$1.pathData : lead$2.pathData;
	var lead = "lead";

	exports.accData = lead$1.accData;
	exports.ltr = lead$1.ltr;
	exports.default = lead;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
