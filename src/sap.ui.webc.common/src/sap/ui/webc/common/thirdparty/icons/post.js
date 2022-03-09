sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/post', './v4/post'], function (Theme, post$2, post$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? post$1 : post$2;
	var post = { pathData };

	return post;

});
