sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/bookmark-2', './v4/bookmark-2'], function (Theme, bookmark2$2, bookmark2$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? bookmark2$1 : bookmark2$2;
	var bookmark2 = { pathData };

	return bookmark2;

});
