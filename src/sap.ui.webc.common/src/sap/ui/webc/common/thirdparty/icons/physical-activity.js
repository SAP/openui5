sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/physical-activity', './v4/physical-activity'], function (Theme, physicalActivity$2, physicalActivity$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? physicalActivity$1 : physicalActivity$2;
	var physicalActivity = { pathData };

	return physicalActivity;

});
