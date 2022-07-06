sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/customer-view', './v4/customer-view'], function (exports, Theme, customerView$1, customerView$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? customerView$1.pathData : customerView$2.pathData;
	var customerView = "customer-view";

	exports.accData = customerView$1.accData;
	exports.ltr = customerView$1.ltr;
	exports.default = customerView;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
