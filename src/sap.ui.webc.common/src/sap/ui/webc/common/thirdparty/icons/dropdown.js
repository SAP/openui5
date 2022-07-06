sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/dropdown', './v4/dropdown'], function (exports, Theme, dropdown$1, dropdown$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? dropdown$1.pathData : dropdown$2.pathData;
	var dropdown = "dropdown";

	exports.accData = dropdown$1.accData;
	exports.ltr = dropdown$1.ltr;
	exports.default = dropdown;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
