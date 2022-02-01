sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-SimpleMagnifier', './sapIllus-Scene-SimpleMagnifier', './sapIllus-Spot-SimpleMagnifier', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogSimpleMagnifier, sapIllusSceneSimpleMagnifier, sapIllusSpotSimpleMagnifier, i18nDefaults) { 'use strict';

	const name = "SimpleMagnifier";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_BEFORESEARCH;
	const subtitle = i18nDefaults.IM_SUBTITLE_BEFORESEARCH;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogSimpleMagnifier,
		sceneSvg: sapIllusSceneSimpleMagnifier,
		spotSvg: sapIllusSpotSimpleMagnifier,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogSimpleMagnifier;
	exports.sceneSvg = sapIllusSceneSimpleMagnifier;
	exports.spotSvg = sapIllusSpotSimpleMagnifier;

	Object.defineProperty(exports, '__esModule', { value: true });

});
