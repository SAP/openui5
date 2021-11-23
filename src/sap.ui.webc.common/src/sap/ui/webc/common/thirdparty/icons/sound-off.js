sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sound-off', './v4/sound-off'], function (Theme, soundOff$2, soundOff$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? soundOff$1 : soundOff$2;
	var soundOff = { pathData };

	return soundOff;

});
