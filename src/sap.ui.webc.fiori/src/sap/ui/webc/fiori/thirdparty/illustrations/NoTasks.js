sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-NoTasks', './sapIllus-Scene-NoTasks', './sapIllus-Spot-NoTasks', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogNoTasks, sapIllusSceneNoTasks, sapIllusSpotNoTasks, i18nDefaults) { 'use strict';

	const name = "NoTasks";
	const title = i18nDefaults.IM_TITLE_NOTASKS;
	const subtitle = i18nDefaults.IM_SUBTITLE_NOTASKS;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogNoTasks,
		sceneSvg: sapIllusSceneNoTasks,
		spotSvg: sapIllusSpotNoTasks,
		title,
		subtitle,
	});

	exports.dialogSvg = sapIllusDialogNoTasks;
	exports.sceneSvg = sapIllusSceneNoTasks;
	exports.spotSvg = sapIllusSpotNoTasks;

	Object.defineProperty(exports, '__esModule', { value: true });

});
