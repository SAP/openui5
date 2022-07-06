sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/syringe', './v4/syringe'], function (exports, Theme, syringe$1, syringe$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? syringe$1.pathData : syringe$2.pathData;
	var syringe = "syringe";

	exports.accData = syringe$1.accData;
	exports.ltr = syringe$1.ltr;
	exports.default = syringe;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
