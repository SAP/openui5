sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/away', './v4/away'], function (exports, Theme, away$1, away$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? away$1.pathData : away$2.pathData;
	var away = "away";

	exports.accData = away$1.accData;
	exports.ltr = away$1.ltr;
	exports.default = away;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
