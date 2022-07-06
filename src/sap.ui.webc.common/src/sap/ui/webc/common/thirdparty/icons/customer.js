sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/customer', './v4/customer'], function (exports, Theme, customer$1, customer$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? customer$1.pathData : customer$2.pathData;
	var customer = "customer";

	exports.accData = customer$1.accData;
	exports.ltr = customer$1.ltr;
	exports.default = customer;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
