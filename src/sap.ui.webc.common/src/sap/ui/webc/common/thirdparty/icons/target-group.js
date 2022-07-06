sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/target-group', './v4/target-group'], function (exports, Theme, targetGroup$1, targetGroup$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? targetGroup$1.pathData : targetGroup$2.pathData;
	var targetGroup = "target-group";

	exports.accData = targetGroup$1.accData;
	exports.ltr = targetGroup$1.ltr;
	exports.default = targetGroup;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
