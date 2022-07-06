sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/windows-doors', './v4/windows-doors'], function (exports, Theme, windowsDoors$1, windowsDoors$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? windowsDoors$1.pathData : windowsDoors$2.pathData;
	var windowsDoors = "windows-doors";

	exports.accData = windowsDoors$1.accData;
	exports.ltr = windowsDoors$1.ltr;
	exports.default = windowsDoors;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
