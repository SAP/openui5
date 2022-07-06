sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/display-more', './v4/display-more'], function (exports, Theme, displayMore$1, displayMore$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? displayMore$1.pathData : displayMore$2.pathData;
	var displayMore = "display-more";

	exports.accData = displayMore$1.accData;
	exports.ltr = displayMore$1.ltr;
	exports.default = displayMore;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
