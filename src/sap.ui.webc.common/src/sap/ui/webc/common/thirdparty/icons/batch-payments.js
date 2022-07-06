sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/batch-payments', './v4/batch-payments'], function (exports, Theme, batchPayments$1, batchPayments$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? batchPayments$1.pathData : batchPayments$2.pathData;
	var batchPayments = "batch-payments";

	exports.accData = batchPayments$1.accData;
	exports.ltr = batchPayments$1.ltr;
	exports.default = batchPayments;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
