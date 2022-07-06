sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/split', './v4/split'], function (exports, Theme, split$1, split$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? split$1.pathData : split$2.pathData;
	var split = "split";

	exports.accData = split$1.accData;
	exports.ltr = split$1.ltr;
	exports.default = split;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
