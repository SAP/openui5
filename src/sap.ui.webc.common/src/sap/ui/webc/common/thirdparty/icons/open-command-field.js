sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/open-command-field', './v4/open-command-field'], function (Theme, openCommandField$2, openCommandField$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? openCommandField$1 : openCommandField$2;
	var openCommandField = { pathData };

	return openCommandField;

});
