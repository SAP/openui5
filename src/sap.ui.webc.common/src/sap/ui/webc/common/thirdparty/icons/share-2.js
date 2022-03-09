sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/share-2', './v4/share-2'], function (Theme, share2$2, share2$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? share2$1 : share2$2;
	var share2 = { pathData };

	return share2;

});
