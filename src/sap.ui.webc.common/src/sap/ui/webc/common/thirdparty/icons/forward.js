sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/forward', './v4/forward'], function (exports, Theme, forward$1, forward$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? forward$1.pathData : forward$2.pathData;
	var forward = "forward";

	exports.accData = forward$1.accData;
	exports.ltr = forward$1.ltr;
	exports.default = forward;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
