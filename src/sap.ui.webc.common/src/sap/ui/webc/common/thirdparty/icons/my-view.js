sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/my-view', './v4/my-view'], function (Theme, myView$2, myView$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? myView$1 : myView$2;
	var myView = { pathData };

	return myView;

});
