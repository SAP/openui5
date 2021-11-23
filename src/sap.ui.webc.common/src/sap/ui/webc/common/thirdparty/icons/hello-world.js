sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/hello-world', './v4/hello-world'], function (Theme, helloWorld$2, helloWorld$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? helloWorld$1 : helloWorld$2;
	var helloWorld = { pathData };

	return helloWorld;

});
