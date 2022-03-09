sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/theater', './v4/theater'], function (Theme, theater$2, theater$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? theater$1 : theater$2;
	var theater = { pathData };

	return theater;

});
