sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/arobase', './v4/arobase'], function (exports, Theme, arobase$1, arobase$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? arobase$1.pathData : arobase$2.pathData;
	var arobase = "arobase";

	exports.accData = arobase$1.accData;
	exports.ltr = arobase$1.ltr;
	exports.default = arobase;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
