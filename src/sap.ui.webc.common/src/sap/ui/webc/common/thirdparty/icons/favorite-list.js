sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/favorite-list', './v4/favorite-list'], function (Theme, favoriteList$2, favoriteList$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? favoriteList$1 : favoriteList$2;
	var favoriteList = { pathData };

	return favoriteList;

});
