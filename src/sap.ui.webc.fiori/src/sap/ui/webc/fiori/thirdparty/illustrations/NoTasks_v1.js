sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-NoTasks_v1', './sapIllus-Scene-NoTasks_v1', './sapIllus-Spot-NoTasks_v1', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogNoTasks_v1, sapIllusSceneNoTasks_v1, sapIllusSpotNoTasks_v1, i18nDefaults) { 'use strict';

	const name = "NoTasks_v1";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_NOTASKS;
	const subtitle = i18nDefaults.IM_SUBTITLE_NOTASKS;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogNoTasks_v1,
		sceneSvg: sapIllusSceneNoTasks_v1,
		spotSvg: sapIllusSpotNoTasks_v1,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogNoTasks_v1;
	exports.sceneSvg = sapIllusSceneNoTasks_v1;
	exports.spotSvg = sapIllusSpotNoTasks_v1;

	Object.defineProperty(exports, '__esModule', { value: true });

});
