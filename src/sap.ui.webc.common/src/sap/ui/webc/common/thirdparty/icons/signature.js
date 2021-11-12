sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/signature', './v4/signature'], function (Theme, signature$2, signature$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? signature$1 : signature$2;
	var signature = { pathData };

	return signature;

});
