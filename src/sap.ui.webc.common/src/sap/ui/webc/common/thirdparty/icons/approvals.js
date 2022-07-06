sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/approvals', './v4/approvals'], function (exports, Theme, approvals$1, approvals$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? approvals$1.pathData : approvals$2.pathData;
	var approvals = "approvals";

	exports.accData = approvals$1.accData;
	exports.ltr = approvals$1.ltr;
	exports.default = approvals;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
