sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/offsite-work', './v4/offsite-work'], function (Theme, offsiteWork$2, offsiteWork$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? offsiteWork$1 : offsiteWork$2;
	var offsiteWork = { pathData };

	return offsiteWork;

});
