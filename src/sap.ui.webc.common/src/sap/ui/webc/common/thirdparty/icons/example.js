sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/example', './v4/example'], function (exports, Theme, example$1, example$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? example$1.pathData : example$2.pathData;
	var example = "example";

	exports.accData = example$1.accData;
	exports.ltr = example$1.ltr;
	exports.default = example;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
