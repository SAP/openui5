sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/paging', './v4/paging'], function (Theme, paging$2, paging$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? paging$1 : paging$2;
	var paging = { pathData };

	return paging;

});
