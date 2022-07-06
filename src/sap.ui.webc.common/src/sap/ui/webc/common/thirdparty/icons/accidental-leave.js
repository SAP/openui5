sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/accidental-leave', './v4/accidental-leave'], function (exports, Theme, accidentalLeave$1, accidentalLeave$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? accidentalLeave$1.pathData : accidentalLeave$2.pathData;
	var accidentalLeave = "accidental-leave";

	exports.accData = accidentalLeave$1.accData;
	exports.ltr = accidentalLeave$1.ltr;
	exports.default = accidentalLeave;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
