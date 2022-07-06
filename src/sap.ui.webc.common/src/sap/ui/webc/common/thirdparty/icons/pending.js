sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/pending', './v4/pending'], function (exports, Theme, pending$1, pending$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? pending$1.pathData : pending$2.pathData;
	var pending = "pending";

	exports.accData = pending$1.accData;
	exports.ltr = pending$1.ltr;
	exports.default = pending;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
