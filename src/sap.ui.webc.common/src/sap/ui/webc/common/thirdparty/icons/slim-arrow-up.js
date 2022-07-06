sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/slim-arrow-up', './v4/slim-arrow-up'], function (exports, Theme, slimArrowUp$1, slimArrowUp$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? slimArrowUp$1.pathData : slimArrowUp$2.pathData;
	var slimArrowUp = "slim-arrow-up";

	exports.accData = slimArrowUp$1.accData;
	exports.ltr = slimArrowUp$1.ltr;
	exports.default = slimArrowUp;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
