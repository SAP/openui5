sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/my-sales-order', './v4/my-sales-order'], function (exports, Theme, mySalesOrder$1, mySalesOrder$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? mySalesOrder$1.pathData : mySalesOrder$2.pathData;
	var mySalesOrder = "my-sales-order";

	exports.accData = mySalesOrder$1.accData;
	exports.ltr = mySalesOrder$1.ltr;
	exports.default = mySalesOrder;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
