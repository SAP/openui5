sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/list', './v4/list'], function (Theme, list$2, list$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? list$1 : list$2;
	var list = { pathData };

	return list;

});
