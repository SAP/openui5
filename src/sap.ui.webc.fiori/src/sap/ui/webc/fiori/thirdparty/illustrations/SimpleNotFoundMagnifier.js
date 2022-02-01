sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-SimpleNotFoundMagnifier', './sapIllus-Scene-SimpleNotFoundMagnifier', './sapIllus-Spot-SimpleNotFoundMagnifier', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogSimpleNotFoundMagnifier, sapIllusSceneSimpleNotFoundMagnifier, sapIllusSpotSimpleNotFoundMagnifier, i18nDefaults) { 'use strict';

	const name = "SimpleNotFoundMagnifier";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_NOSEARCHRESULTS;
	const subtitle = i18nDefaults.IM_SUBTITLE_NOSEARCHRESULTS;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogSimpleNotFoundMagnifier,
		sceneSvg: sapIllusSceneSimpleNotFoundMagnifier,
		spotSvg: sapIllusSpotSimpleNotFoundMagnifier,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogSimpleNotFoundMagnifier;
	exports.sceneSvg = sapIllusSceneSimpleNotFoundMagnifier;
	exports.spotSvg = sapIllusSpotSimpleNotFoundMagnifier;

	Object.defineProperty(exports, '__esModule', { value: true });

});
