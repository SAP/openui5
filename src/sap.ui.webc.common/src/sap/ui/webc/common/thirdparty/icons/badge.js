sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/badge', './v4/badge'], function (exports, Theme, badge$1, badge$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? badge$1.pathData : badge$2.pathData;
	var badge = "badge";

	exports.accData = badge$1.accData;
	exports.ltr = badge$1.ltr;
	exports.default = badge;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
