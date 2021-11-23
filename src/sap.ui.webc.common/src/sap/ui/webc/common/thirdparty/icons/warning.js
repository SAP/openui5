sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/warning', './v4/warning'], function (Theme, warning$2, warning$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? warning$1 : warning$2;
	var warning = { pathData };

	return warning;

});
