sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/it-system', './v4/it-system'], function (Theme, itSystem$2, itSystem$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? itSystem$1 : itSystem$2;
	var itSystem = { pathData };

	return itSystem;

});
