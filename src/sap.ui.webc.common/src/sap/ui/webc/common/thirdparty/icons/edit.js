sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/edit', './v4/edit'], function (exports, Theme, edit$1, edit$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? edit$1.pathData : edit$2.pathData;
	var edit = "edit";

	exports.accData = edit$1.accData;
	exports.ltr = edit$1.ltr;
	exports.default = edit;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
