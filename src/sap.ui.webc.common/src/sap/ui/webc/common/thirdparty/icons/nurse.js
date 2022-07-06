sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/nurse', './v4/nurse'], function (exports, Theme, nurse$1, nurse$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? nurse$1.pathData : nurse$2.pathData;
	var nurse = "nurse";

	exports.accData = nurse$1.accData;
	exports.ltr = nurse$1.ltr;
	exports.default = nurse;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
