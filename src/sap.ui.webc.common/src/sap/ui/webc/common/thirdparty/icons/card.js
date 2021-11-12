sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/card', './v4/card'], function (Theme, card$2, card$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? card$1 : card$2;
	var card = { pathData };

	return card;

});
