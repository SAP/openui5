sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/personnel-view', './v4/personnel-view'], function (Theme, personnelView$2, personnelView$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? personnelView$1 : personnelView$2;
	var personnelView = { pathData };

	return personnelView;

});
