sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/table-column', './v4/table-column'], function (Theme, tableColumn$2, tableColumn$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? tableColumn$1 : tableColumn$2;
	var tableColumn = { pathData };

	return tableColumn;

});
