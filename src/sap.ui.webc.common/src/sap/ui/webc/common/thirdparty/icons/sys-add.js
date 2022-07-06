sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-add', './v4/sys-add'], function (exports, Theme, sysAdd$1, sysAdd$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sysAdd$1.pathData : sysAdd$2.pathData;
	var sysAdd = "sys-add";

	exports.accData = sysAdd$1.accData;
	exports.ltr = sysAdd$1.ltr;
	exports.default = sysAdd;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
