sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sales-document', './v4/sales-document'], function (exports, Theme, salesDocument$1, salesDocument$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? salesDocument$1.pathData : salesDocument$2.pathData;
	var salesDocument = "sales-document";

	exports.accData = salesDocument$1.accData;
	exports.ltr = salesDocument$1.ltr;
	exports.default = salesDocument;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
