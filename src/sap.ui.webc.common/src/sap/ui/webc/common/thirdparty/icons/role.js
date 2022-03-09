sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/role', './v4/role'], function (Theme, role$2, role$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? role$1 : role$2;
	var role = { pathData };

	return role;

});
