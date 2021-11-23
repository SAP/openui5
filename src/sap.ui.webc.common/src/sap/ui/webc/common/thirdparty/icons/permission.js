sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/permission', './v4/permission'], function (Theme, permission$2, permission$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? permission$1 : permission$2;
	var permission = { pathData };

	return permission;

});
