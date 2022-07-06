sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/edit-outside', './v4/edit-outside'], function (exports, Theme, editOutside$1, editOutside$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? editOutside$1.pathData : editOutside$2.pathData;
	var editOutside = "edit-outside";

	exports.accData = editOutside$1.accData;
	exports.ltr = editOutside$1.ltr;
	exports.default = editOutside;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
