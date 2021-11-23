sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/nurse', './v4/nurse'], function (Theme, nurse$2, nurse$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? nurse$1 : nurse$2;
	var nurse = { pathData };

	return nurse;

});
