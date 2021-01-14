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
						key: 'default'
					},
					{
						title: 'Numeric',
						target: 'learnDetail',
						key: 'numeric'
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
						target: 'learnDetail',
						key: 'adaptive'
					},
					{
						title: 'Analytical',
						target: 'learnDetail',
						key: 'analytical'
					},
					{
						title: 'Calendar',
						target: 'learnDetail',
						key: 'calendar'
					},
					{
						title: 'Component',
						target: 'learnDetail',
						key: 'component'
					},
					{
						title: 'List',
						target: 'learnDetail',
						key: 'list'
					},
					{
						title: 'Object',
						target: 'learnDetail',
						key: 'object'
					},
					{
						title: 'Table',
						target: 'learnDetail',
						key: 'table'
					},
					{
						title: 'Timeline',
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
						title: 'Actions',
						target: 'learnDetail',
						key: 'cardActions'
					},
					{
						title: 'Data',
						target: 'learnDetail',
						key: 'data'
					},
					{
						title: 'Data Sources',
						target: 'learnDetail',
						key: 'dataSources'
					},
					{
						title: 'Date Ranges',
						target: 'learnDetail',
						key: 'dateRanges',
						experimental: true
					},
					{
						title: 'Destinations',
						target: 'learnDetail',
						key: 'destinations'
					},
					{
						title: 'Dynamic Counter',
						target: 'learnDetail',
						key: 'dynamicCounter'
					},
					{
						title: 'Dynamic Parameters',
						target: 'learnDetail',
						key: 'dynamicParameters'
					},
					{
						title: 'Extension',
						target: 'learnDetail',
						key: 'extension'
					},
					{
						title: 'Filters',
						target: 'learnDetail',
						key: 'filters',
						experimental: true
					},
					{
						title: 'Manifest Parameters',
						target: 'learnDetail',
						key: 'manifestParameters'
					},
					{
						title: 'Microcharts',
						target: 'learnDetail',
						key: 'microcharts',
						experimental: true
					},
					{
						title: 'Sizing',
						target: 'learnDetail',
						key: 'sizing',
						topicTitle: 'Sizing'
					},
					{
						title: 'Translation',
						target: 'learnDetail',
						key: 'translation'
					}
				]
			},
			{
				title: 'Card Bundle',
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
						key: 'currency'
					},
					{
						title: 'Date and Time',
						target: 'learnDetail',
						key: 'dateAndTime'
					},
					{
						title: 'Float',
						target: 'learnDetail',
						key: 'float'
					},
					{
						title: 'Integer',
						target: 'learnDetail',
						key: 'integer'
					},
					{
						title: 'Percent',
						target: 'learnDetail',
						key: 'percent'
					},
					{
						title: 'Text',
						target: 'learnDetail',
						key: 'text'
					},
					{
						title: 'Unit of Measurement',
						target: 'learnDetail',
						key: 'unit'
					}
				]
			}
		]
	});
});
