sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/create', './v4/create'], function (Theme, create$2, create$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? create$1 : create$2;
	var create = { pathData };

	return create;

});
