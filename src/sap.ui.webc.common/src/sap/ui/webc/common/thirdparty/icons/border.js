sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/border', './v4/border'], function (exports, Theme, border$1, border$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? border$1.pathData : border$2.pathData;
	var border = "border";

	exports.accData = border$1.accData;
	exports.ltr = border$1.ltr;
	exports.default = border;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
