sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/upload', './v4/upload'], function (Theme, upload$2, upload$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? upload$1 : upload$2;
	var upload = { pathData };

	return upload;

});
