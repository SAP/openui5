sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/gantt-bars', './v4/gantt-bars'], function (exports, Theme, ganttBars$1, ganttBars$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? ganttBars$1.pathData : ganttBars$2.pathData;
	var ganttBars = "gantt-bars";

	exports.accData = ganttBars$1.accData;
	exports.ltr = ganttBars$1.ltr;
	exports.default = ganttBars;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
