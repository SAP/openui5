sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/record', './v4/record'], function (Theme, record$2, record$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? record$1 : record$2;
	var record = { pathData };

	return record;

});
