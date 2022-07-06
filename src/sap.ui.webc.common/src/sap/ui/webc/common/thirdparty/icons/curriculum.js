sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/curriculum', './v4/curriculum'], function (exports, Theme, curriculum$1, curriculum$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? curriculum$1.pathData : curriculum$2.pathData;
	var curriculum = "curriculum";

	exports.accData = curriculum$1.accData;
	exports.ltr = curriculum$1.ltr;
	exports.default = curriculum;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
