sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/search', './v4/search'], function (Theme, search$2, search$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? search$1 : search$2;
	var search = { pathData };

	return search;

});
