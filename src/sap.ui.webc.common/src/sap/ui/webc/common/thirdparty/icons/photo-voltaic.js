sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/photo-voltaic', './v4/photo-voltaic'], function (Theme, photoVoltaic$2, photoVoltaic$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? photoVoltaic$1 : photoVoltaic$2;
	var photoVoltaic = { pathData };

	return photoVoltaic;

});
