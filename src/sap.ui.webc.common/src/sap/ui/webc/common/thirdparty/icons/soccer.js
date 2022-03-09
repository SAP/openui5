sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/soccer', './v4/soccer'], function (Theme, soccer$2, soccer$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? soccer$1 : soccer$2;
	var soccer = { pathData };

	return soccer;

});
