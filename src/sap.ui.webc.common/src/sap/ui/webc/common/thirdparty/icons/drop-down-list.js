sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/drop-down-list', './v4/drop-down-list'], function (exports, Theme, dropDownList$1, dropDownList$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? dropDownList$1.pathData : dropDownList$2.pathData;
	var dropDownList = "drop-down-list";

	exports.accData = dropDownList$1.accData;
	exports.ltr = dropDownList$1.ltr;
	exports.default = dropDownList;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
