sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/rhombus-milestone', './v4/rhombus-milestone'], function (exports, Theme, rhombusMilestone$1, rhombusMilestone$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? rhombusMilestone$1.pathData : rhombusMilestone$2.pathData;
	var rhombusMilestone = "rhombus-milestone";

	exports.accData = rhombusMilestone$1.accData;
	exports.ltr = rhombusMilestone$1.ltr;
	exports.default = rhombusMilestone;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
