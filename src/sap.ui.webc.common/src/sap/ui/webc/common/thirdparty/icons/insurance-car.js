sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/insurance-car', './v4/insurance-car'], function (exports, Theme, insuranceCar$1, insuranceCar$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? insuranceCar$1.pathData : insuranceCar$2.pathData;
	var insuranceCar = "insurance-car";

	exports.accData = insuranceCar$1.accData;
	exports.ltr = insuranceCar$1.ltr;
	exports.default = insuranceCar;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
