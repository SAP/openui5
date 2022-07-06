sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/bell', './v4/bell'], function (exports, Theme, bell$1, bell$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? bell$1.pathData : bell$2.pathData;
	var bell = "bell";

	exports.accData = bell$1.accData;
	exports.ltr = bell$1.ltr;
	exports.default = bell;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
