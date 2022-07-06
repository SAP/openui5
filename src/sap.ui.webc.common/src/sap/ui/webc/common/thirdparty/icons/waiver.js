sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/waiver', './v4/waiver'], function (exports, Theme, waiver$1, waiver$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? waiver$1.pathData : waiver$2.pathData;
	var waiver = "waiver";

	exports.accData = waiver$1.accData;
	exports.ltr = waiver$1.ltr;
	exports.default = waiver;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
