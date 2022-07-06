sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/folder', './v4/folder'], function (exports, Theme, folder$1, folder$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? folder$1.pathData : folder$2.pathData;
	var folder = "folder";

	exports.accData = folder$1.accData;
	exports.ltr = folder$1.ltr;
	exports.default = folder;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
