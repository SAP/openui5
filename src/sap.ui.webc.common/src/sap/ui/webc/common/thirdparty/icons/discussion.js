sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/discussion', './v4/discussion'], function (Theme, discussion$2, discussion$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? discussion$1 : discussion$2;
	var discussion = { pathData };

	return discussion;

});
