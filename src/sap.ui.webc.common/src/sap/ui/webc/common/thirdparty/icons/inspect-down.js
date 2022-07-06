sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/inspect-down', './v4/inspect-down'], function (exports, Theme, inspectDown$1, inspectDown$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? inspectDown$1.pathData : inspectDown$2.pathData;
	var inspectDown = "inspect-down";

	exports.accData = inspectDown$1.accData;
	exports.ltr = inspectDown$1.ltr;
	exports.default = inspectDown;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
