sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/notes', './v4/notes'], function (exports, Theme, notes$1, notes$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? notes$1.pathData : notes$2.pathData;
	var notes = "notes";

	exports.accData = notes$1.accData;
	exports.ltr = notes$1.ltr;
	exports.default = notes;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
