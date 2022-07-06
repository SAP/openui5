sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/chevron-phase-2', './v4/chevron-phase-2'], function (exports, Theme, chevronPhase2$1, chevronPhase2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? chevronPhase2$1.pathData : chevronPhase2$2.pathData;
	var chevronPhase2 = "chevron-phase-2";

	exports.accData = chevronPhase2$1.accData;
	exports.ltr = chevronPhase2$1.ltr;
	exports.default = chevronPhase2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
