sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/group', './v4/group'], function (Theme, group$2, group$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? group$1 : group$2;
	var group = { pathData };

	return group;

});
