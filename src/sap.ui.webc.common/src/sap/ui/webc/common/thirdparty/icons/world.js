sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/world', './v4/world'], function (exports, Theme, world$1, world$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? world$1.pathData : world$2.pathData;
	var world = "world";

	exports.accData = world$1.accData;
	exports.ltr = world$1.ltr;
	exports.default = world;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
