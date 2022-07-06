sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/tri-state', './v4/tri-state'], function (exports, Theme, triState$1, triState$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? triState$1.pathData : triState$2.pathData;
	var triState = "tri-state";

	exports.accData = triState$1.accData;
	exports.ltr = triState$1.ltr;
	exports.default = triState;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
