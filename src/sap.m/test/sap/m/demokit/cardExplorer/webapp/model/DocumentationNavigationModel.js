sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";

	return new JSONModel({
		selectedKey: 'learnOverview',
		navigation: [
			{
				title: 'Overview',
				icon: 'sap-icon://home',
				target: 'learnDetail',
				key: 'overview'
			},
			{
				title: 'Getting Started',
				icon: 'sap-icon://initiative',
				target: 'learnDetail',
				key: 'gettingStarted'
			},
			{
				title: 'Headers',
				icon: 'sap-icon://header',
				target: 'learnDetail',
				key: 'headers',
				items: [
					{
						title: 'Default',
						target: 'learnDetail',
						key: 'headerDefault'
					},
					{
						title: 'Numeric',
						target: 'learnDetail',
						key: 'headerNumeric'
					}
				]
			},
			{
				title: 'Types',
				icon: 'sap-icon://overview-chart',
				target: 'learnDetail',
				key: 'types',
				items: [
					{
						title: 'List',
						target: 'learnDetail',
						key: 'typeList'
					},
					{
						title: 'Table',
						target: 'learnDetail',
						key: 'typeTable'
					},
					{
						title: 'Object',
						target: 'learnDetail',
						key: 'typeObject'
					},
					{
						title: 'Timeline',
						target: 'learnDetail',
						key: 'typeTimeline'
					},
					{
						title: 'Analytical',
						target: 'learnDetail',
						key: 'typeAnalytical'
					},
					{
						title: 'Component',
						target: 'learnDetail',
						key: 'typeComponent'
					}
				]
			},
			{
				title: 'Features',
				icon: 'sap-icon://activities',
				target: 'learnDetail',
				key: 'features',
				items: [
					{
						title: 'Actions',
						target: 'learnDetail',
						key: 'featureActions'
					},
					{
						title: 'Data',
						target: 'learnDetail',
						key: 'featureData'
					},
					{
						title: 'Parameters',
						target: 'learnDetail',
						key: 'featureParameters'
					},
					{
						title: 'Translation',
						target: 'learnDetail',
						key: 'featureTranslation'
					}
				]
			}
		]
	});
});