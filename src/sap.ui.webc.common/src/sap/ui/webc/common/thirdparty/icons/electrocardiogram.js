sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/electrocardiogram', './v4/electrocardiogram'], function (exports, Theme, electrocardiogram$1, electrocardiogram$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? electrocardiogram$1.pathData : electrocardiogram$2.pathData;
	var electrocardiogram = "electrocardiogram";

	exports.accData = electrocardiogram$1.accData;
	exports.ltr = electrocardiogram$1.ltr;
	exports.default = electrocardiogram;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
