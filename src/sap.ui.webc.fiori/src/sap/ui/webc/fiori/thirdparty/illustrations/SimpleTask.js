sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-SimpleTask', './sapIllus-Scene-SimpleTask', './sapIllus-Spot-SimpleTask', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogSimpleTask, sapIllusSceneSimpleTask, sapIllusSpotSimpleTask, i18nDefaults) { 'use strict';

	const name = "SimpleTask";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_NOTASKS;
	const subtitle = i18nDefaults.IM_SUBTITLE_NOTASKS;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogSimpleTask,
		sceneSvg: sapIllusSceneSimpleTask,
		spotSvg: sapIllusSpotSimpleTask,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogSimpleTask;
	exports.sceneSvg = sapIllusSceneSimpleTask;
	exports.spotSvg = sapIllusSpotSimpleTask;

	Object.defineProperty(exports, '__esModule', { value: true });

});
