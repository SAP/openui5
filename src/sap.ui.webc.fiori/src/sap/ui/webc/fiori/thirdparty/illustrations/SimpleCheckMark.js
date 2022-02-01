sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-SimpleCheckMark', './sapIllus-Scene-SimpleCheckMark', './sapIllus-Spot-SimpleCheckMark', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogSimpleCheckMark, sapIllusSceneSimpleCheckMark, sapIllusSpotSimpleCheckMark, i18nDefaults) { 'use strict';

	const name = "SimpleCheckMark";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_SUCCESSSCREEN;
	const subtitle = i18nDefaults.IM_SUBTITLE_SUCCESSSCREEN;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogSimpleCheckMark,
		sceneSvg: sapIllusSceneSimpleCheckMark,
		spotSvg: sapIllusSpotSimpleCheckMark,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogSimpleCheckMark;
	exports.sceneSvg = sapIllusSceneSimpleCheckMark;
	exports.spotSvg = sapIllusSpotSimpleCheckMark;

	Object.defineProperty(exports, '__esModule', { value: true });

});
