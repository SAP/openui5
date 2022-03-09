sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/hide', './v4/hide'], function (Theme, hide$2, hide$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? hide$1 : hide$2;
	var hide = { pathData };

	return hide;

});
