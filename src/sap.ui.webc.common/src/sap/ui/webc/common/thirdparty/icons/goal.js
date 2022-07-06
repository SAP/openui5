sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/goal', './v4/goal'], function (exports, Theme, goal$1, goal$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? goal$1.pathData : goal$2.pathData;
	var goal = "goal";

	exports.accData = goal$1.accData;
	exports.ltr = goal$1.ltr;
	exports.default = goal;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
