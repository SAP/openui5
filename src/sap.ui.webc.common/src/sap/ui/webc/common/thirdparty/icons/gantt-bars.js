sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/gantt-bars', './v4/gantt-bars'], function (Theme, ganttBars$2, ganttBars$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? ganttBars$1 : ganttBars$2;
	var ganttBars = { pathData };

	return ganttBars;

});
