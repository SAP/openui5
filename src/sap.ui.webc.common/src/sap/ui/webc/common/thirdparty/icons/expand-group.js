sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/expand-group', './v4/expand-group'], function (Theme, expandGroup$2, expandGroup$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? expandGroup$1 : expandGroup$2;
	var expandGroup = { pathData };

	return expandGroup;

});
