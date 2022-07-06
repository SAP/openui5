sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/manager', './v4/manager'], function (exports, Theme, manager$1, manager$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? manager$1.pathData : manager$2.pathData;
	var manager = "manager";

	exports.accData = manager$1.accData;
	exports.ltr = manager$1.ltr;
	exports.default = manager;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
