sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/tag', './v4/tag'], function (Theme, tag$2, tag$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? tag$1 : tag$2;
	var tag = { pathData };

	return tag;

});
