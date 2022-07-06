sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/kpi-managing-my-area', './v4/kpi-managing-my-area'], function (exports, Theme, kpiManagingMyArea$1, kpiManagingMyArea$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? kpiManagingMyArea$1.pathData : kpiManagingMyArea$2.pathData;
	var kpiManagingMyArea = "kpi-managing-my-area";

	exports.accData = kpiManagingMyArea$1.accData;
	exports.ltr = kpiManagingMyArea$1.ltr;
	exports.default = kpiManagingMyArea;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
