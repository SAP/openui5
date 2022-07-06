sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/rhombus-milestone-2', './v4/rhombus-milestone-2'], function (exports, Theme, rhombusMilestone2$1, rhombusMilestone2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? rhombusMilestone2$1.pathData : rhombusMilestone2$2.pathData;
	var rhombusMilestone2 = "rhombus-milestone-2";

	exports.accData = rhombusMilestone2$1.accData;
	exports.ltr = rhombusMilestone2$1.ltr;
	exports.default = rhombusMilestone2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
