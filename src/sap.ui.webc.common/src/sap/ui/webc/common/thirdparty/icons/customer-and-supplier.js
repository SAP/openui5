sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/customer-and-supplier', './v4/customer-and-supplier'], function (exports, Theme, customerAndSupplier$1, customerAndSupplier$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? customerAndSupplier$1.pathData : customerAndSupplier$2.pathData;
	var customerAndSupplier = "customer-and-supplier";

	exports.accData = customerAndSupplier$1.accData;
	exports.ltr = customerAndSupplier$1.ltr;
	exports.default = customerAndSupplier;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
