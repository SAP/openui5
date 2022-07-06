sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/present', './v4/present'], function (exports, Theme, present$1, present$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? present$1.pathData : present$2.pathData;
	var present = "present";

	exports.accData = present$1.accData;
	exports.ltr = present$1.ltr;
	exports.default = present;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
