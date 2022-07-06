sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/checklist-item-2', './v4/checklist-item-2'], function (exports, Theme, checklistItem2$1, checklistItem2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? checklistItem2$1.pathData : checklistItem2$2.pathData;
	var checklistItem2 = "checklist-item-2";

	exports.accData = checklistItem2$1.accData;
	exports.ltr = checklistItem2$1.ltr;
	exports.default = checklistItem2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
