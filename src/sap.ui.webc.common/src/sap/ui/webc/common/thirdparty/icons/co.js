sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/co', './v4/co'], function (exports, Theme, co$1, co$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? co$1.pathData : co$2.pathData;
	var co = "co";

	exports.accData = co$1.accData;
	exports.ltr = co$1.ltr;
	exports.default = co;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
