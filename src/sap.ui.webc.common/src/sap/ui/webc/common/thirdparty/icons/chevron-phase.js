sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/chevron-phase', './v4/chevron-phase'], function (exports, Theme, chevronPhase$1, chevronPhase$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? chevronPhase$1.pathData : chevronPhase$2.pathData;
	var chevronPhase = "chevron-phase";

	exports.accData = chevronPhase$1.accData;
	exports.ltr = chevronPhase$1.ltr;
	exports.default = chevronPhase;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
