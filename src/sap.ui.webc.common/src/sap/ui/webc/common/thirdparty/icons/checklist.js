sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/checklist', './v4/checklist'], function (exports, Theme, checklist$1, checklist$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? checklist$1.pathData : checklist$2.pathData;
	var checklist = "checklist";

	exports.accData = checklist$1.accData;
	exports.ltr = checklist$1.ltr;
	exports.default = checklist;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
