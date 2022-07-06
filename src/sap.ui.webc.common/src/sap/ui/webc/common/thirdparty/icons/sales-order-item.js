sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sales-order-item', './v4/sales-order-item'], function (exports, Theme, salesOrderItem$1, salesOrderItem$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? salesOrderItem$1.pathData : salesOrderItem$2.pathData;
	var salesOrderItem = "sales-order-item";

	exports.accData = salesOrderItem$1.accData;
	exports.ltr = salesOrderItem$1.ltr;
	exports.default = salesOrderItem;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
