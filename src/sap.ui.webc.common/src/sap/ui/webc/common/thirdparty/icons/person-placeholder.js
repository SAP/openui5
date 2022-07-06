sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/person-placeholder', './v4/person-placeholder'], function (exports, Theme, personPlaceholder$1, personPlaceholder$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? personPlaceholder$1.pathData : personPlaceholder$2.pathData;
	var personPlaceholder = "person-placeholder";

	exports.accData = personPlaceholder$1.accData;
	exports.ltr = personPlaceholder$1.ltr;
	exports.default = personPlaceholder;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
