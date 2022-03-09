sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/user-edit', './v4/user-edit'], function (Theme, userEdit$2, userEdit$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? userEdit$1 : userEdit$2;
	var userEdit = { pathData };

	return userEdit;

});
