sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/status-positive', './v4/status-positive'], function (exports, Theme, statusPositive$1, statusPositive$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? statusPositive$1.pathData : statusPositive$2.pathData;
	var statusPositive = "status-positive";

	exports.accData = statusPositive$1.accData;
	exports.ltr = statusPositive$1.ltr;
	exports.default = statusPositive;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
