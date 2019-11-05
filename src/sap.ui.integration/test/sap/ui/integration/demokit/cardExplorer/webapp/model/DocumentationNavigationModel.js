sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";

	return new JSONModel({
		selectedKey: 'overview',
		navigation: [
			{
				title: 'Overview',
				topicTitle: 'Integration Card Overview',
				icon: 'sap-icon://home',
				target: 'learnDetail',
				key: 'overview'
			},
			{
				title: 'Getting Started',
				topicTitle: 'Integration Card Getting Started',
				icon: 'sap-icon://initiative',
				target: 'learnDetail',
				key: 'gettingStarted'
			},
			{
				title: 'Card Headers',
				icon: 'sap-icon://header',
				target: 'learnDetail',
				key: 'headers',
				items: [
					{
						title: 'Default',
						target: 'learnDetail',
						key: 'headerDefault',
						topicTitle: 'Integration Card Headers'
					},
					{
						title: 'Numeric',
						target: 'learnDetail',
						key: 'headerNumeric',
						topicTitle: 'Integration Card Headers'
					}
				]
			},
			{
				title: 'Card Types',
				icon: 'sap-icon://overview-chart',
				target: 'learnDetail',
				key: 'types',
				items: [
					{
						title: 'List',
						topicTitle: 'Integration Card Types',
						target: 'learnDetail',
						key: 'list'
					},
					{
						title: 'Table',
						topicTitle: 'Integration Card Types',
						target: 'learnDetail',
						key: 'table'
					},
					{
						title: 'Object',
						topicTitle: 'Integration Card Types',
						target: 'learnDetail',
						key: 'object'
					},
					{
						title: 'Timeline',
						topicTitle: 'Integration Card Types',
						target: 'learnDetail',
						key: 'timeline'
					},
					{
						title: 'Analytical',
						topicTitle: 'Integration Card Types',
						target: 'learnDetail',
						key: 'analytical'
					},
					{
						title: 'Component',
						topicTitle: 'Integration Card Types',
						target: 'learnDetail',
						key: 'component'
					}
				]
			},
			{
				title: 'Card Features',
				icon: 'sap-icon://activities',
				target: 'learnDetail',
				key: 'features',
				items: [
					{
						title: 'Actions',
						target: 'learnDetail',
						key: 'featureActions',
						topicTitle: 'Integration Card Features'
					},
					{
						title: 'Data',
						target: 'learnDetail',
						key: 'featureData',
						topicTitle: 'Integration Card Features'
					},
					{
						title: 'Translation',
						target: 'learnDetail',
						key: 'featureTranslation',
						topicTitle: 'Integration Card Features'
					},
					{
						title: 'Manifest Parameters',
						target: 'learnDetail',
						key: 'featureManifestParameters',
						topicTitle: 'Integration Card Features'
					},
					{
						title: 'Dynamic Parameters',
						target: 'learnDetail',
						key: 'featureDynamicParameters',
						topicTitle: 'Integration Card Features'
					},
					{
						title: 'Dynamic Counter',
						target: 'learnDetail',
						key: 'featureDynamicCounter',
						topicTitle: 'Integration Card Features'
					},
					{
						title: 'Formatters',
						target: 'learnDetail',
						key: 'featureFormatters',
						topicTitle: 'Integration Card Features'
					}
				]
			},
			{
				title: 'Card Bundle',
				topicTitle: 'Card Bundle',
				icon: 'sap-icon://attachment-zip-file',
				target: 'learnDetail',
				key: 'bundle'
			},
			{
				title: 'Card Formatters',
				icon: 'sap-icon://text-formatting',
				target: 'learnDetail',
				key: 'formatters',
				items: [
					{
						title: 'Date and Time',
						target: 'learnDetail',
						key: 'dateAndTime',
						topicTitle: 'Formatters'
					}
				]
			}
		]
	});
});
