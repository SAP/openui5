sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/folder-2', './v4/folder-2'], function (exports, Theme, folder2$1, folder2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? folder2$1.pathData : folder2$2.pathData;
	var folder2 = "folder-2";

	exports.accData = folder2$1.accData;
	exports.ltr = folder2$1.ltr;
	exports.default = folder2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
