sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/redo', './v4/redo'], function (exports, Theme, redo$1, redo$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? redo$1.pathData : redo$2.pathData;
	var redo = "redo";

	exports.accData = redo$1.accData;
	exports.ltr = redo$1.ltr;
	exports.default = redo;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
