sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/phone', './v4/phone'], function (Theme, phone$2, phone$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? phone$1 : phone$2;
	var phone = { pathData };

	return phone;

});
