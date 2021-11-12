sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/waiver', './v4/waiver'], function (Theme, waiver$2, waiver$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? waiver$1 : waiver$2;
	var waiver = { pathData };

	return waiver;

});
