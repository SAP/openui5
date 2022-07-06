sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/add-folder', './v4/add-folder'], function (exports, Theme, addFolder$1, addFolder$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? addFolder$1.pathData : addFolder$2.pathData;
	var addFolder = "add-folder";

	exports.accData = addFolder$1.accData;
	exports.ltr = addFolder$1.ltr;
	exports.default = addFolder;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
