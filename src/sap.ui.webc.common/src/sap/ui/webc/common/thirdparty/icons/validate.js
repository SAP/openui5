sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/validate', './v4/validate'], function (Theme, validate$2, validate$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? validate$1 : validate$2;
	var validate = { pathData };

	return validate;

});
