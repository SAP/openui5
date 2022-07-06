sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/manager-insight', './v4/manager-insight'], function (exports, Theme, managerInsight$1, managerInsight$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? managerInsight$1.pathData : managerInsight$2.pathData;
	var managerInsight = "manager-insight";

	exports.accData = managerInsight$1.accData;
	exports.ltr = managerInsight$1.ltr;
	exports.default = managerInsight;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
