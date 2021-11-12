sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/status-positive', './v4/status-positive'], function (Theme, statusPositive$2, statusPositive$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? statusPositive$1 : statusPositive$2;
	var statusPositive = { pathData };

	return statusPositive;

});
