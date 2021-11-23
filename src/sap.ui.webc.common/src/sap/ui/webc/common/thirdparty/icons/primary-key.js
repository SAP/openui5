sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/primary-key', './v4/primary-key'], function (Theme, primaryKey$2, primaryKey$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? primaryKey$1 : primaryKey$2;
	var primaryKey = { pathData };

	return primaryKey;

});
