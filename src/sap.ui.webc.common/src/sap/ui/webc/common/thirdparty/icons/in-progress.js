sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/in-progress', './v4/in-progress'], function (exports, Theme, inProgress$1, inProgress$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? inProgress$1.pathData : inProgress$2.pathData;
	var inProgress = "in-progress";

	exports.accData = inProgress$1.accData;
	exports.ltr = inProgress$1.ltr;
	exports.default = inProgress;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
