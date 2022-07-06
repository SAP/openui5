sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/slim-arrow-down', './v4/slim-arrow-down'], function (exports, Theme, slimArrowDown$1, slimArrowDown$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? slimArrowDown$1.pathData : slimArrowDown$2.pathData;
	var slimArrowDown = "slim-arrow-down";

	exports.accData = slimArrowDown$1.accData;
	exports.ltr = slimArrowDown$1.ltr;
	exports.default = slimArrowDown;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
