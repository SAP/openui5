sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/checklist-2', './v4/checklist-2'], function (exports, Theme, checklist2$1, checklist2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? checklist2$1.pathData : checklist2$2.pathData;
	var checklist2 = "checklist-2";

	exports.accData = checklist2$1.accData;
	exports.ltr = checklist2$1.ltr;
	exports.default = checklist2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
