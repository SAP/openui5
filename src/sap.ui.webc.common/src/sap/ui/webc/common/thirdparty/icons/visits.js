sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/visits', './v4/visits'], function (exports, Theme, visits$1, visits$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? visits$1.pathData : visits$2.pathData;
	var visits = "visits";

	exports.accData = visits$1.accData;
	exports.ltr = visits$1.ltr;
	exports.default = visits;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
