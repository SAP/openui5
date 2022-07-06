sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/horizontal-grip', './v4/horizontal-grip'], function (exports, Theme, horizontalGrip$1, horizontalGrip$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? horizontalGrip$1.pathData : horizontalGrip$2.pathData;
	var horizontalGrip = "horizontal-grip";

	exports.accData = horizontalGrip$1.accData;
	exports.ltr = horizontalGrip$1.ltr;
	exports.default = horizontalGrip;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
