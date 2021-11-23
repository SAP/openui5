sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/it-instance', './v4/it-instance'], function (Theme, itInstance$2, itInstance$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? itInstance$1 : itInstance$2;
	var itInstance = { pathData };

	return itInstance;

});
