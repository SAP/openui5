sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/per-diem', './v4/per-diem'], function (exports, Theme, perDiem$1, perDiem$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? perDiem$1.pathData : perDiem$2.pathData;
	var perDiem = "per-diem";

	exports.accData = perDiem$1.accData;
	exports.ltr = perDiem$1.ltr;
	exports.default = perDiem;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
