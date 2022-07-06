sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/clinical-order', './v4/clinical-order'], function (exports, Theme, clinicalOrder$1, clinicalOrder$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? clinicalOrder$1.pathData : clinicalOrder$2.pathData;
	var clinicalOrder = "clinical-order";

	exports.accData = clinicalOrder$1.accData;
	exports.ltr = clinicalOrder$1.ltr;
	exports.default = clinicalOrder;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
