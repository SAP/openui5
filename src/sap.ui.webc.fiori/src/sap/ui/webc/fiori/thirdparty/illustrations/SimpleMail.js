sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-SimpleMail', './sapIllus-Scene-SimpleMail', './sapIllus-Spot-SimpleMail', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogSimpleMail, sapIllusSceneSimpleMail, sapIllusSpotSimpleMail, i18nDefaults) { 'use strict';

	const name = "SimpleMail";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_NOMAIL;
	const subtitle = i18nDefaults.IM_SUBTITLE_NOMAIL;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogSimpleMail,
		sceneSvg: sapIllusSceneSimpleMail,
		spotSvg: sapIllusSpotSimpleMail,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogSimpleMail;
	exports.sceneSvg = sapIllusSceneSimpleMail;
	exports.spotSvg = sapIllusSpotSimpleMail;

	Object.defineProperty(exports, '__esModule', { value: true });

});
