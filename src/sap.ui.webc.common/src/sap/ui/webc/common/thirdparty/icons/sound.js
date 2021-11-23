sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sound', './v4/sound'], function (Theme, sound$2, sound$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? sound$1 : sound$2;
	var sound = { pathData };

	return sound;

});
