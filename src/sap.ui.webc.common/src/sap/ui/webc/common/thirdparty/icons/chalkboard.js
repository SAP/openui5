sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/chalkboard', './v4/chalkboard'], function (exports, Theme, chalkboard$1, chalkboard$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? chalkboard$1.pathData : chalkboard$2.pathData;
	var chalkboard = "chalkboard";

	exports.accData = chalkboard$1.accData;
	exports.ltr = chalkboard$1.ltr;
	exports.default = chalkboard;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
