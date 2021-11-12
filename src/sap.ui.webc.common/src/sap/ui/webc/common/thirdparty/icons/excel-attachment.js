sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/excel-attachment', './v4/excel-attachment'], function (Theme, excelAttachment$2, excelAttachment$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? excelAttachment$1 : excelAttachment$2;
	var excelAttachment = { pathData };

	return excelAttachment;

});
