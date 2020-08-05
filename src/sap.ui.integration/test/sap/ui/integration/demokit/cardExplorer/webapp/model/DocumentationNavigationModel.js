sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";

	// Please order topics alphabetically by "title"
	return new JSONModel({
		selectedKey: 'gettingStarted',
		navigation: [
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
						key: 'default',
						topicTitle: 'Integration Card Headers'
					},
					{
						title: 'Numeric',
						target: 'learnDetail',
						key: 'numeric',
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
						title: 'Adaptive',
						topicTitle: 'AdaptiveCard',
						target: 'learnDetail',
						key: 'adaptive'
					},
					{
						title: 'Analytical',
						topicTitle: 'Integration Card Types',
						target: 'learnDetail',
						key: 'analytical'
					},
					{
						title: 'Calendar',
						topicTitle: 'Integration Card Types',
						target: 'learnDetail',
						key: 'calendar',
						experimental: true
					},
					{
						title: 'Component',
						topicTitle: 'Integration Card Types',
						target: 'learnDetail',
						key: 'component'
					},
					{
						title: 'List',
						topicTitle: 'Integration Card Types',
						target: 'learnDetail',
						key: 'list'
					},
					{
						title: 'Object',
						topicTitle: 'Integration Card Types',
						target: 'learnDetail',
						key: 'object'
					},
					{
						title: 'Table',
						topicTitle: 'Integration Card Types',
						target: 'learnDetail',
						key: 'table'
					},
					{
						title: 'Timeline',
						topicTitle: 'Integration Card Types',
						target: 'learnDetail',
						key: 'timeline'
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
						title: 'Card Actions',
						target: 'learnDetail',
						key: 'cardActions',
						topicTitle: 'Integration Card Features'
					},
					{
						title: 'Data',
						target: 'learnDetail',
						key: 'data',
						topicTitle: 'Integration Card Features'
					},
					{
						title: 'Data Sources',
						target: 'learnDetail',
						key: 'dataSources',
						topicTitle: 'Integration Card Data Sources'
					},
					{
						title: 'Date Ranges',
						target: 'learnDetail',
						key: 'dateRanges',
						topicTitle: 'Integration Card Date Range Handling',
						experimental: true
					},
					{
						title: 'Destinations',
						target: 'learnDetail',
						key: 'destinations',
						topicTitle: 'Integration'
					},
					{
						title: 'Dynamic Counter',
						target: 'learnDetail',
						key: 'dynamicCounter',
						topicTitle: 'Integration Card Features'
					},
					{
						title: 'Dynamic Parameters',
						target: 'learnDetail',
						key: 'dynamicParameters',
						topicTitle: 'Integration Card Features'
					},
					{
						title: 'Extension',
						target: 'learnDetail',
						key: 'extension',
						topicTitle: 'Integration Card Features',
						experimental: true
					},
					{
						title: 'Filters',
						target: 'learnDetail',
						key: 'filters',
						topicTitle: 'Integration Card Features',
						experimental: true
					},
					{
						title: 'Manifest Parameters',
						target: 'learnDetail',
						key: 'manifestParameters',
						topicTitle: 'Integration Card Features'
					},
					{
						title: 'Microcharts',
						target: 'learnDetail',
						key: 'microcharts',
						topicTitle: 'Card Microcharts',
						experimental: true
					},
					{
						title: 'Translation',
						target: 'learnDetail',
						key: 'translation',
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
						title: 'Currency',
						target: 'learnDetail',
						key: 'currency',
						topicTitle: 'Formatters'
					},
					{
						title: 'Date and Time',
						target: 'learnDetail',
						key: 'dateAndTime',
						topicTitle: 'Formatters'
					},
					{
						title: 'Float',
						target: 'learnDetail',
						key: 'float',
						topicTitle: 'Formatters'
					},
					{
						title: 'Integer',
						target: 'learnDetail',
						key: 'integer',
						topicTitle: 'Formatters'
					},
					{
						title: 'Percent',
						target: 'learnDetail',
						key: 'percent',
						topicTitle: 'Formatters'
					},
					{
						title: 'Unit of Measurement',
						target: 'learnDetail',
						key: 'unit',
						topicTitle: 'Formatters'
					}
				]
			}
		]
	});
});
