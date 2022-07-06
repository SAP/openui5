sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/collision', './v4/collision'], function (exports, Theme, collision$1, collision$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? collision$1.pathData : collision$2.pathData;
	var collision = "collision";

	exports.accData = collision$1.accData;
	exports.ltr = collision$1.ltr;
	exports.default = collision;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
