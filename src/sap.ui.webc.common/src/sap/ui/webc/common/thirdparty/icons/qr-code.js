sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/qr-code', './v4/qr-code'], function (Theme, qrCode$2, qrCode$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? qrCode$1 : qrCode$2;
	var qrCode = { pathData };

	return qrCode;

});
