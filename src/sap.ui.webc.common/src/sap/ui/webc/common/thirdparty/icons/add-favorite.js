sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/add-favorite', './v4/add-favorite'], function (Theme, addFavorite$2, addFavorite$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? addFavorite$1 : addFavorite$2;
	var addFavorite = { pathData };

	return addFavorite;

});
