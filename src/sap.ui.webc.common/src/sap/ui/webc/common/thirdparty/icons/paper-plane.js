sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/paper-plane', './v4/paper-plane'], function (Theme, paperPlane$2, paperPlane$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? paperPlane$1 : paperPlane$2;
	var paperPlane = { pathData };

	return paperPlane;

});
