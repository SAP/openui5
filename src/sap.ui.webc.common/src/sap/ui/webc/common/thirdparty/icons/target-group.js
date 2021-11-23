sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/target-group', './v4/target-group'], function (Theme, targetGroup$2, targetGroup$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? targetGroup$1 : targetGroup$2;
	var targetGroup = { pathData };

	return targetGroup;

});
