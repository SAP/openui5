sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sort-descending', './v4/sort-descending'], function (Theme, sortDescending$2, sortDescending$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? sortDescending$1 : sortDescending$2;
	var sortDescending = { pathData };

	return sortDescending;

});
