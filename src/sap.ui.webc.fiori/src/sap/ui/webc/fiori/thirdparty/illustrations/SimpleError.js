sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-SimpleError', './sapIllus-Scene-SimpleError', './sapIllus-Spot-SimpleError', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogSimpleError, sapIllusSceneSimpleError, sapIllusSpotSimpleError, i18nDefaults) { 'use strict';

	const name = "SimpleError";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_UNABLETOUPLOAD;
	const subtitle = i18nDefaults.IM_SUBTITLE_UNABLETOUPLOAD;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogSimpleError,
		sceneSvg: sapIllusSceneSimpleError,
		spotSvg: sapIllusSpotSimpleError,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogSimpleError;
	exports.sceneSvg = sapIllusSceneSimpleError;
	exports.spotSvg = sapIllusSpotSimpleError;

	Object.defineProperty(exports, '__esModule', { value: true });

});
