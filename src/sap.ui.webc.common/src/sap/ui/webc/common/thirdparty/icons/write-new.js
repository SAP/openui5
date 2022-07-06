sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/write-new', './v4/write-new'], function (exports, Theme, writeNew$1, writeNew$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? writeNew$1.pathData : writeNew$2.pathData;
	var writeNew = "write-new";

	exports.accData = writeNew$1.accData;
	exports.ltr = writeNew$1.ltr;
	exports.default = writeNew;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
