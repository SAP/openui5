sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/unfavorite', './v4/unfavorite'], function (Theme, unfavorite$2, unfavorite$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? unfavorite$1 : unfavorite$2;
	var unfavorite = { pathData };

	return unfavorite;

});
