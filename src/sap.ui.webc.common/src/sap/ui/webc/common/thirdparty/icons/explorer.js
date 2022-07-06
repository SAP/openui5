sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/explorer', './v4/explorer'], function (exports, Theme, explorer$1, explorer$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? explorer$1.pathData : explorer$2.pathData;
	var explorer = "explorer";

	exports.accData = explorer$1.accData;
	exports.ltr = explorer$1.ltr;
	exports.default = explorer;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
