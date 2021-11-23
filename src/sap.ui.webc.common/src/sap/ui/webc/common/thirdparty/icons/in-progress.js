sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/in-progress', './v4/in-progress'], function (Theme, inProgress$2, inProgress$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? inProgress$1 : inProgress$2;
	var inProgress = { pathData };

	return inProgress;

});
