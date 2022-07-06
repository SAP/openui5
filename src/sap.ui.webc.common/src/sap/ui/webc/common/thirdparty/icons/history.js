sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/history', './v4/history'], function (exports, Theme, history$1, history$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? history$1.pathData : history$2.pathData;
	var history = "history";

	exports.accData = history$1.accData;
	exports.ltr = history$1.ltr;
	exports.default = history;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
