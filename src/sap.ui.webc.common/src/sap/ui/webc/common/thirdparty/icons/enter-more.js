sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/enter-more', './v4/enter-more'], function (exports, Theme, enterMore$1, enterMore$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? enterMore$1.pathData : enterMore$2.pathData;
	var enterMore = "enter-more";

	exports.accData = enterMore$1.accData;
	exports.ltr = enterMore$1.ltr;
	exports.default = enterMore;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
