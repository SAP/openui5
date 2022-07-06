sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sales-quote', './v4/sales-quote'], function (exports, Theme, salesQuote$1, salesQuote$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? salesQuote$1.pathData : salesQuote$2.pathData;
	var salesQuote = "sales-quote";

	exports.accData = salesQuote$1.accData;
	exports.ltr = salesQuote$1.ltr;
	exports.default = salesQuote;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
