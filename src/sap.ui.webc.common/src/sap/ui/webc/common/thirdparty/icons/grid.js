sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/grid', './v4/grid'], function (Theme, grid$2, grid$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? grid$1 : grid$2;
	var grid = { pathData };

	return grid;

});
