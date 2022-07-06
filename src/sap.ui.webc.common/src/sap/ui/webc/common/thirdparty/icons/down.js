sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/down', './v4/down'], function (exports, Theme, down$1, down$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? down$1.pathData : down$2.pathData;
	var down = "down";

	exports.accData = down$1.accData;
	exports.ltr = down$1.ltr;
	exports.default = down;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
