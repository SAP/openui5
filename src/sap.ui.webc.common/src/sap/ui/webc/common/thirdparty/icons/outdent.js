sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/outdent', './v4/outdent'], function (Theme, outdent$2, outdent$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? outdent$1 : outdent$2;
	var outdent = { pathData };

	return outdent;

});
