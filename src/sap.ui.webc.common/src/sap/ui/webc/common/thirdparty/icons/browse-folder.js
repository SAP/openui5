sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/browse-folder', './v4/browse-folder'], function (exports, Theme, browseFolder$1, browseFolder$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? browseFolder$1.pathData : browseFolder$2.pathData;
	var browseFolder = "browse-folder";

	exports.accData = browseFolder$1.accData;
	exports.ltr = browseFolder$1.ltr;
	exports.default = browseFolder;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
