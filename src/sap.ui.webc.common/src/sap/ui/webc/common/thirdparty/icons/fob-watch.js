sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/fob-watch', './v4/fob-watch'], function (exports, Theme, fobWatch$1, fobWatch$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? fobWatch$1.pathData : fobWatch$2.pathData;
	var fobWatch = "fob-watch";

	exports.accData = fobWatch$1.accData;
	exports.ltr = fobWatch$1.ltr;
	exports.default = fobWatch;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
