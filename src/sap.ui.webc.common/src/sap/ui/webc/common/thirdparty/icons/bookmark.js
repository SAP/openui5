sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/bookmark', './v4/bookmark'], function (Theme, bookmark$2, bookmark$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? bookmark$1 : bookmark$2;
	var bookmark = { pathData };

	return bookmark;

});
