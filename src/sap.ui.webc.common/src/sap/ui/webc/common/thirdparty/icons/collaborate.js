sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/collaborate', './v4/collaborate'], function (Theme, collaborate$2, collaborate$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? collaborate$1 : collaborate$2;
	var collaborate = { pathData };

	return collaborate;

});
