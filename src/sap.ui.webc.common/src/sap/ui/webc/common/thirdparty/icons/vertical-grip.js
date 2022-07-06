sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/vertical-grip', './v4/vertical-grip'], function (exports, Theme, verticalGrip$1, verticalGrip$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? verticalGrip$1.pathData : verticalGrip$2.pathData;
	var verticalGrip = "vertical-grip";

	exports.accData = verticalGrip$1.accData;
	exports.ltr = verticalGrip$1.ltr;
	exports.default = verticalGrip;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
