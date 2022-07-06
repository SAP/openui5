sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/folder-full', './v4/folder-full'], function (exports, Theme, folderFull$1, folderFull$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? folderFull$1.pathData : folderFull$2.pathData;
	var folderFull = "folder-full";

	exports.accData = folderFull$1.accData;
	exports.ltr = folderFull$1.ltr;
	exports.default = folderFull;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
