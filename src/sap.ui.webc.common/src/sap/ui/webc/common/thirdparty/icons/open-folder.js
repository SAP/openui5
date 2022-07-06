sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/open-folder', './v4/open-folder'], function (exports, Theme, openFolder$1, openFolder$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? openFolder$1.pathData : openFolder$2.pathData;
	var openFolder = "open-folder";

	exports.accData = openFolder$1.accData;
	exports.ltr = openFolder$1.ltr;
	exports.default = openFolder;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
