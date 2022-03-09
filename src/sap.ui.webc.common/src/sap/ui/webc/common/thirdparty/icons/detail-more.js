sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/detail-more', './v4/detail-more'], function (Theme, detailMore$2, detailMore$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? detailMore$1 : detailMore$2;
	var detailMore = { pathData };

	return detailMore;

});
