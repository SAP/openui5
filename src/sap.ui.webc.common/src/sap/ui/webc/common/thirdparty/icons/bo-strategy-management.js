sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/bo-strategy-management', './v4/bo-strategy-management'], function (exports, Theme, boStrategyManagement$1, boStrategyManagement$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? boStrategyManagement$1.pathData : boStrategyManagement$2.pathData;
	var boStrategyManagement = "bo-strategy-management";

	exports.accData = boStrategyManagement$1.accData;
	exports.ltr = boStrategyManagement$1.ltr;
	exports.default = boStrategyManagement;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
