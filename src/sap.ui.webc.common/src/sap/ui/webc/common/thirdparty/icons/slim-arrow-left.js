sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/slim-arrow-left', './v4/slim-arrow-left'], function (exports, Theme, slimArrowLeft$1, slimArrowLeft$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? slimArrowLeft$1.pathData : slimArrowLeft$2.pathData;
	var slimArrowLeft = "slim-arrow-left";

	exports.accData = slimArrowLeft$1.accData;
	exports.ltr = slimArrowLeft$1.ltr;
	exports.default = slimArrowLeft;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
