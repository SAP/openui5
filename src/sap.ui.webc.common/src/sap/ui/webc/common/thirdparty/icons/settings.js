sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/settings', './v4/settings'], function (exports, Theme, settings$1, settings$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? settings$1.pathData : settings$2.pathData;
	var settings = "settings";

	exports.accData = settings$1.accData;
	exports.ltr = settings$1.ltr;
	exports.default = settings;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
