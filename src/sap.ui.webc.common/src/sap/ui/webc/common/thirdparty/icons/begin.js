sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/begin', './v4/begin'], function (exports, Theme, begin$1, begin$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? begin$1.pathData : begin$2.pathData;
	var begin = "begin";

	exports.accData = begin$1.accData;
	exports.ltr = begin$1.ltr;
	exports.default = begin;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
