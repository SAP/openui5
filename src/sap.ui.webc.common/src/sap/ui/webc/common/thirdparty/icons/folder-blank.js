sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/folder-blank', './v4/folder-blank'], function (exports, Theme, folderBlank$1, folderBlank$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? folderBlank$1.pathData : folderBlank$2.pathData;
	var folderBlank = "folder-blank";

	exports.accData = folderBlank$1.accData;
	exports.ltr = folderBlank$1.ltr;
	exports.default = folderBlank;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
