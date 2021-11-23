sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/enter-more', './v4/enter-more'], function (Theme, enterMore$2, enterMore$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? enterMore$1 : enterMore$2;
	var enterMore = { pathData };

	return enterMore;

});
