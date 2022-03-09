sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/person-placeholder', './v4/person-placeholder'], function (Theme, personPlaceholder$2, personPlaceholder$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? personPlaceholder$1 : personPlaceholder$2;
	var personPlaceholder = { pathData };

	return personPlaceholder;

});
