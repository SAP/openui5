sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/customer-order-entry', './v4/customer-order-entry'], function (exports, Theme, customerOrderEntry$1, customerOrderEntry$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? customerOrderEntry$1.pathData : customerOrderEntry$2.pathData;
	var customerOrderEntry = "customer-order-entry";

	exports.accData = customerOrderEntry$1.accData;
	exports.ltr = customerOrderEntry$1.ltr;
	exports.default = customerOrderEntry;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
