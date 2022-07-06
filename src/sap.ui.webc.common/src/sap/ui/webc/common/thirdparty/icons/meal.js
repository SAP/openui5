sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/meal', './v4/meal'], function (exports, Theme, meal$1, meal$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? meal$1.pathData : meal$2.pathData;
	var meal = "meal";

	exports.accData = meal$1.accData;
	exports.ltr = meal$1.ltr;
	exports.default = meal;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
