sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";

	return new JSONModel({
		selectedKey: 'learnGettingStarted',
		navigation: [
			{
				title: 'Integration Card Types',
				icon: 'sap-icon://overview-chart',
				key: 'types',
				target: 'exploreOverview',
				hasExpander: false,
				items: [
					{
						title: 'List',
						target: 'exploreSamples',
						key: 'list',
						subSamples: [
							{
								title: 'Highlight',
								key: 'highlight',
								manifestUrl: '/samples/list/highlight.json'
							},
							{
								title: 'Icon',
								key: 'icon',
								manifestUrl: '/samples/list/icon.json'
							},
							{
								title: 'Numeric',
								key: 'numeric',
								manifestUrl: '/samples/list/numeric.json'
							},
							{
								title: 'Quick Links',
								key: 'quickLinks',
								settings: {
									columns: 3
								},
								manifestUrl: '/samples/list/quickLinks.json'
							}
						]
					},
					{
						title: 'Table',
						target: 'exploreSamples',
						key: 'table',
						settings: {
							columns: 6
						},
						manifestUrl: '/samples/table.json'
					},
					{
						title: 'Object',
						target: 'exploreSamples',
						key: 'object',
						settings: {
							columns: 5
						},
						manifestUrl: '/samples/object.json'
					},
					{
						title: 'Timeline',
						target: 'exploreSamples',
						key: 'timeline',
						subSamples: [
							{
								title: 'Upcoming Activities',
								key: 'general',
								manifestUrl: '/samples/timeline/activities.json',
								settings: {
									columns: 3
								}
							},
							{
								title: 'New Team Members',
								key: 'line',
								manifestUrl: '/samples/timeline/members.json'
							}
						]
					},
					{
						title: 'Analytical',
						target: 'exploreSamples',
						key: 'analytical',
						subSamples: [
							{
								title: 'Line',
								key: 'line',
								settings: {
									rows: 5,
									columns: 4
								},
								manifestUrl: '/samples/analytical/line.json'
							},
							{
								title: 'Stacked Column',
								key: 'stackedColumn',
								settings: {
									rows: 5,
									columns: 4
								},
								manifestUrl: '/samples/analytical/stackedColumn.json'
							},
							{
								title: 'Donut',
								key: 'donut',
								settings: {
									rows: 3,
									columns: 3
								},
								manifestUrl: '/samples/analytical/donut.json'
							}
						]
					},
					{
						title: 'Component',
						target: 'exploreSamples',
						key: 'component',
						subSamples: [
							{
								title: 'Media',
								key: 'media',
								manifestUrl: '/samples/component/cardContent/manifest.json'
							},
							{
								title: 'Media, header at bottom',
								key: 'mediaBottom',
								manifestUrl: '/samples/component/cardContentHeaderBottom/manifest.json'
							},
							{
								title: 'Buy bus ticket',
								key: 'busTicket',
								manifestUrl: '/samples/component/cardContentControls/manifest.json'
							}
						]
					}
				]
			},
			{
				title: 'Integration Card Features',
				key: 'features',
				target: 'exploreOverview',
				targetKey: 'actions',
				icon: 'sap-icon://activities',
				hasExpander: false,
				items: [
					{
						key: 'actions',
						target: 'exploreSamples',
						title: 'Actions',
						settings: {
							columns: 3
						},
						manifestUrl: '/samples/actions.json'
					},
					{
						key: 'data',
						target: 'exploreSamples',
						title: 'Data',
						manifestUrl: '/samples/data/manifest.json'
					},
					{
						key: 'translation',
						target: 'exploreSamples',
						title: 'Translation',
						manifestUrl: '/samples/translation/manifest.json'
					},
					{
						key: 'parameters',
						target: 'exploreSamples',
						title: 'Parameters',
						manifestUrl: '/samples/parameters.json'
					},
					{
						key: 'dynamicCounter',
						target: 'exploreSamples',
						title: 'Dynamic Counter',
						manifestUrl: '/samples/dynamicCounter/manifest.json'
					}
				]
			}
		]
	});
});
