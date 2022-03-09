sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/multiselect-all', './v4/multiselect-all'], function (Theme, multiselectAll$2, multiselectAll$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? multiselectAll$1 : multiselectAll$2;
	var multiselectAll = { pathData };

	return multiselectAll;

});
