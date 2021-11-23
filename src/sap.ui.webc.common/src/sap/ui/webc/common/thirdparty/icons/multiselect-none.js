sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/multiselect-none', './v4/multiselect-none'], function (Theme, multiselectNone$2, multiselectNone$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? multiselectNone$1 : multiselectNone$2;
	var multiselectNone = { pathData };

	return multiselectNone;

});
