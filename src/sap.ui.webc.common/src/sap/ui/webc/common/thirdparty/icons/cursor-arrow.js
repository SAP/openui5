sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/cursor-arrow', './v4/cursor-arrow'], function (exports, Theme, cursorArrow$1, cursorArrow$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? cursorArrow$1.pathData : cursorArrow$2.pathData;
	var cursorArrow = "cursor-arrow";

	exports.accData = cursorArrow$1.accData;
	exports.ltr = cursorArrow$1.ltr;
	exports.default = cursorArrow;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
