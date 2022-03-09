sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/close-command-field', './v4/close-command-field'], function (Theme, closeCommandField$2, closeCommandField$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? closeCommandField$1 : closeCommandField$2;
	var closeCommandField = { pathData };

	return closeCommandField;

});
