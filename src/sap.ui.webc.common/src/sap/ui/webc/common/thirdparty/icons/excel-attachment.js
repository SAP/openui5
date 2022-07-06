sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/excel-attachment', './v4/excel-attachment'], function (exports, Theme, excelAttachment$1, excelAttachment$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? excelAttachment$1.pathData : excelAttachment$2.pathData;
	var excelAttachment = "excel-attachment";

	exports.accData = excelAttachment$1.accData;
	exports.ltr = excelAttachment$1.ltr;
	exports.default = excelAttachment;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
