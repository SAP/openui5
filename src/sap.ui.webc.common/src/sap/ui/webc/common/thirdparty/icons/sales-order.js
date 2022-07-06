sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sales-order', './v4/sales-order'], function (exports, Theme, salesOrder$1, salesOrder$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? salesOrder$1.pathData : salesOrder$2.pathData;
	var salesOrder = "sales-order";

	exports.accData = salesOrder$1.accData;
	exports.ltr = salesOrder$1.ltr;
	exports.default = salesOrder;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
