sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/undo', './v4/undo'], function (exports, Theme, undo$1, undo$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? undo$1.pathData : undo$2.pathData;
	var undo = "undo";

	exports.accData = undo$1.accData;
	exports.ltr = undo$1.ltr;
	exports.default = undo;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
