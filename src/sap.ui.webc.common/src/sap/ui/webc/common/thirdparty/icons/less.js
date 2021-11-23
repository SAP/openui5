sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/less', './v4/less'], function (Theme, less$2, less$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? less$1 : less$2;
	var less = { pathData };

	return less;

});
