sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/detail-less', './v4/detail-less'], function (Theme, detailLess$2, detailLess$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? detailLess$1 : detailLess$2;
	var detailLess = { pathData };

	return detailLess;

});
