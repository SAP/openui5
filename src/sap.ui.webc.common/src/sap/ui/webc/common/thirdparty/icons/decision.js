sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/decision', './v4/decision'], function (exports, Theme, decision$1, decision$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? decision$1.pathData : decision$2.pathData;
	var decision = "decision";

	exports.accData = decision$1.accData;
	exports.ltr = decision$1.ltr;
	exports.default = decision;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
