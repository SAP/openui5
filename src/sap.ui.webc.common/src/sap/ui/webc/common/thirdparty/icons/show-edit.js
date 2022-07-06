sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/show-edit', './v4/show-edit'], function (exports, Theme, showEdit$1, showEdit$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? showEdit$1.pathData : showEdit$2.pathData;
	var showEdit = "show-edit";

	exports.accData = showEdit$1.accData;
	exports.ltr = showEdit$1.ltr;
	exports.default = showEdit;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
