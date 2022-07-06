sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/check-availability', './v4/check-availability'], function (exports, Theme, checkAvailability$1, checkAvailability$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? checkAvailability$1.pathData : checkAvailability$2.pathData;
	var checkAvailability = "check-availability";

	exports.accData = checkAvailability$1.accData;
	exports.ltr = checkAvailability$1.ltr;
	exports.default = checkAvailability;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
