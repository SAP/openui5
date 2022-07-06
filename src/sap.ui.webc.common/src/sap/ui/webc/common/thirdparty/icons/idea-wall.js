sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/idea-wall', './v4/idea-wall'], function (exports, Theme, ideaWall$1, ideaWall$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? ideaWall$1.pathData : ideaWall$2.pathData;
	var ideaWall = "idea-wall";

	exports.accData = ideaWall$1.accData;
	exports.ltr = ideaWall$1.ltr;
	exports.default = ideaWall;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
