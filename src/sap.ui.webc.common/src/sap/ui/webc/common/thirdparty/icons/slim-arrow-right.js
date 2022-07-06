sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/slim-arrow-right', './v4/slim-arrow-right'], function (exports, Theme, slimArrowRight$1, slimArrowRight$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? slimArrowRight$1.pathData : slimArrowRight$2.pathData;
	var slimArrowRight = "slim-arrow-right";

	exports.accData = slimArrowRight$1.accData;
	exports.ltr = slimArrowRight$1.ltr;
	exports.default = slimArrowRight;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
