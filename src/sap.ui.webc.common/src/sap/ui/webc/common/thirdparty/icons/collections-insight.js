sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/collections-insight', './v4/collections-insight'], function (Theme, collectionsInsight$2, collectionsInsight$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? collectionsInsight$1 : collectionsInsight$2;
	var collectionsInsight = { pathData };

	return collectionsInsight;

});
