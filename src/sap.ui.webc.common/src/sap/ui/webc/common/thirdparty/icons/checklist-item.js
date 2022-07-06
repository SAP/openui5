sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/checklist-item', './v4/checklist-item'], function (exports, Theme, checklistItem$1, checklistItem$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? checklistItem$1.pathData : checklistItem$2.pathData;
	var checklistItem = "checklist-item";

	exports.accData = checklistItem$1.accData;
	exports.ltr = checklistItem$1.ltr;
	exports.default = checklistItem;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
