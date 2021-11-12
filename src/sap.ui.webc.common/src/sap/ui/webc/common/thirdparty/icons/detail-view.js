sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/detail-view', './v4/detail-view'], function (Theme, detailView$2, detailView$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? detailView$1 : detailView$2;
	var detailView = { pathData };

	return detailView;

});
