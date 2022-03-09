sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/manager-insight', './v4/manager-insight'], function (Theme, managerInsight$2, managerInsight$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? managerInsight$1 : managerInsight$2;
	var managerInsight = { pathData };

	return managerInsight;

});
