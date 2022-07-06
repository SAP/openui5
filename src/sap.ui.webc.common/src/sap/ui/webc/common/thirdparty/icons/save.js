sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/save', './v4/save'], function (exports, Theme, save$1, save$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? save$1.pathData : save$2.pathData;
	var save = "save";

	exports.accData = save$1.accData;
	exports.ltr = save$1.ltr;
	exports.default = save;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
