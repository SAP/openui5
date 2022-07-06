sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/thumb-up', './v4/thumb-up'], function (exports, Theme, thumbUp$1, thumbUp$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? thumbUp$1.pathData : thumbUp$2.pathData;
	var thumbUp = "thumb-up";

	exports.accData = thumbUp$1.accData;
	exports.ltr = thumbUp$1.ltr;
	exports.default = thumbUp;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
