sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sort-ascending', './v4/sort-ascending'], function (Theme, sortAscending$2, sortAscending$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sortAscending$1 : sortAscending$2;
	var sortAscending = { pathData };

	return sortAscending;

});
