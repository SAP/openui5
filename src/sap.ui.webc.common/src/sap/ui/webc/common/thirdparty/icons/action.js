sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/action', './v4/action'], function (exports, Theme, action$1, action$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? action$1.pathData : action$2.pathData;
	var action = "action";

	exports.accData = action$1.accData;
	exports.ltr = action$1.ltr;
	exports.default = action;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
