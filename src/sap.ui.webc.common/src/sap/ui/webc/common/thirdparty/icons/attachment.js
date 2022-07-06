sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/attachment', './v4/attachment'], function (exports, Theme, attachment$1, attachment$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? attachment$1.pathData : attachment$2.pathData;
	var attachment = "attachment";

	exports.accData = attachment$1.accData;
	exports.ltr = attachment$1.ltr;
	exports.default = attachment;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
