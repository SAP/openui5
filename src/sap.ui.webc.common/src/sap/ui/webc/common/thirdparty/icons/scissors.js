sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/scissors', './v4/scissors'], function (exports, Theme, scissors$1, scissors$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? scissors$1.pathData : scissors$2.pathData;
	var scissors = "scissors";

	exports.accData = scissors$1.accData;
	exports.ltr = scissors$1.ltr;
	exports.default = scissors;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
