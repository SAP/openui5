sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/locked', './v4/locked'], function (exports, Theme, locked$1, locked$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? locked$1.pathData : locked$2.pathData;
	var locked = "locked";

	exports.accData = locked$1.accData;
	exports.ltr = locked$1.ltr;
	exports.default = locked;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
