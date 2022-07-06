sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/measure', './v4/measure'], function (exports, Theme, measure$1, measure$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? measure$1.pathData : measure$2.pathData;
	var measure = "measure";

	exports.accData = measure$1.accData;
	exports.ltr = measure$1.ltr;
	exports.default = measure;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
