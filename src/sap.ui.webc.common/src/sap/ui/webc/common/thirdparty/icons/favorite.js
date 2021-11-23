sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/favorite', './v4/favorite'], function (Theme, favorite$2, favorite$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? favorite$1 : favorite$2;
	var favorite = { pathData };

	return favorite;

});
