sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/table-row', './v4/table-row'], function (Theme, tableRow$2, tableRow$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? tableRow$1 : tableRow$2;
	var tableRow = { pathData };

	return tableRow;

});
