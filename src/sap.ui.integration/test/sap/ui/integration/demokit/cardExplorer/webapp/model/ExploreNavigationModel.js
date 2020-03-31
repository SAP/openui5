sap.ui.define([
	'sap/ui/model/json/JSONModel'
], function (JSONModel) {
	'use strict';

	// Please order topics alphabetically by "title"
	return new JSONModel({
		selectedKey: 'learnGettingStarted',
		navigation: [
			{
				title: 'Card Types',
				icon: 'sap-icon://overview-chart',
				key: 'types',
				target: 'exploreOverview',
				hasExpander: false,
				items: [
					{
						title: 'Adaptive',
						target: 'exploreSamples',
						key: 'adaptive',
						experimental: true,
						subSamples: [
							{
								title: 'Card',
								key: 'adaptive',
								manifestUrl: '/samples/adaptive/adaptive.json'
							},
							{
								title: 'RichTextBlock',
								key: 'richtext',
								manifestUrl: '/samples/adaptive/richtext.json'
							},
							{
								title: 'Form',
								key: 'form',
								manifestUrl: '/samples/adaptive/form.json'
							},
							{
								title: 'Templating',
								key: 'templating',
								manifestUrl: '/samples/adaptive/templating.json'
							},
							{
								title: 'Data & Templating',
								key: 'data',
								files: [
									{
										url: '/samples/adaptive/data.json',
										name: 'manifest.json',
										key: 'manifest.json',
										content: ''
									},
									{
										url: '/samples/adaptive/data-json.json',
										name: 'data.json',
										key: 'data.json',
										content: ''
									}
								]
							},
							{
								title: 'Markdown',
								key: 'markdown',
								manifestUrl: '/samples/adaptive/markdown.json'
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
						title: 'Calendar',
						target: 'exploreSamples',
						key: 'calendar',
						experimental: true,
						manifestUrl: '/samples/calendar/calendar.json',
						settings: {
							columns: 7
						}
					},
					{
						title: 'Component',
						target: 'exploreSamples',
						key: 'component',
						subSamples: [
							{
								title: 'Media',
								key: 'media',
								files: [
									{
										url: '/samples/component/cardContent/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json',
										content: ''
									},
									{
										url: '/samples/component/cardContent/Component.js',
										name: 'Component.js',
										key: 'Component.js',
										content: ''
									},
									{
										url: '/samples/component/cardContent/Main.controller.js',
										name: 'Main.controller.js',
										key: 'Main.controller.js',
										content: ''
									},
									{
										url: '/samples/component/cardContent/View.view.xml',
										name: 'View.view.xml',
										key: 'View.view.xml',
										content: ''
									},
									{
										url: '/samples/component/cardContent/Image.png',
										name: 'Image.png',
										key: 'Image.png',
										content: ''
									}
								]
							},
							{
								title: 'Media, header at bottom',
								key: 'mediaBottom',
								files: [
									{
										url: '/samples/component/cardContentHeaderBottom/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json',
										content: ''
									},
									{
										url: '/samples/component/cardContentHeaderBottom/Component.js',
										name: 'Component.js',
										key: 'Component.js',
										content: ''
									},
									{
										url: '/samples/component/cardContentHeaderBottom/Main.controller.js',
										name: 'Main.controller.js',
										key: 'Main.controller.js',
										content: ''
									},
									{
										url: '/samples/component/cardContentHeaderBottom/View.view.xml',
										name: 'View.view.xml',
										key: 'View.view.xml',
										content: ''
									},
									{
										url: '/samples/component/cardContentHeaderBottom/Image.png',
										name: 'Image.png',
										key: 'Image.png',
										content: ''
									}
								]
							},
							{
								title: 'Buy bus ticket',
								key: 'busTicket',
								files: [

									{
										url: '/samples/component/cardContentControls/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json',
										content: ''
									},
									{
										url: '/samples/component/cardContentControls/Component.js',
										name: 'Component.js',
										key: 'Component.js',
										content: ''
									},
									{
										url: '/samples/component/cardContentControls/View.view.xml',
										name: 'View.view.xml',
										key: 'View.view.xml',
										content: ''
									},
									{
										url: '/samples/component/cardContentControls/Main.controller.js',
										name: 'Main.controller.js',
										key: 'Main.controller.js',
										content: ''
									}
								]
							}
						]
					},
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
						title: 'Object',
						target: 'exploreSamples',
						key: 'object',
						settings: {
							columns: 5
						},
						manifestUrl: '/samples/object.json'
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
					}
				]
			},
			{
				title: 'Card Features',
				key: 'features',
				target: 'exploreOverview',
				targetKey: 'actions',
				icon: 'sap-icon://activities',
				hasExpander: false,
				items: [
					{
						key: 'cardActions',
						target: 'exploreSamples',
						title: 'Card Actions',
						settings: {
							columns: 3
						},
						manifestUrl: '/samples/cardActions.json'
					},
					{
						key: 'htmlConsumption',
						target: 'exploreSamples',
						title: 'Consumption in HTML',
						useIFrame: true,
						files: [
							{
								url: '/samples/htmlConsumption/indexTemplate.html',
								name: 'index.html',
								key: 'index.html',
								content: ''
							},
							{
								url: '/samples/htmlConsumption/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json',
								content: ''
							},
							{
								url: '/samples/htmlConsumption/i18n/i18n.properties',
								name: 'i18n/i18n.properties',
								key: 'i18n/i18n.properties',
								content: ''
							},
							{
								url: '/samples/htmlConsumption/items.json',
								name: 'items.json',
								key: 'items.json',
								content: ''
							}
						]
					},
					{
						key: 'data',
						target: 'exploreSamples',
						title: 'Data',
						manifestUrl: '/samples/data/manifest.json'
					},
					{
						key: 'dataSources',
						target: 'exploreSamples',
						title: 'Data Sources',
						subSamples: [
							{
								title: 'Top Products',
								key: 'topProducts',
								manifestUrl: '/samples/dataSources/topProducts.json'
							},
							{
								title: 'Product',
								key: 'product',
								settings: {
									columns: 6
								},
								files: [
									{
										url: '/samples/dataSources/product.json',
										name: 'manifest.json',
										key: 'manifest.json',
										content: ''
									},
									{
										url: '/samples/dataSources/i18n/i18n.properties',
										name: 'i18n/i18n.properties',
										key: 'i18n/i18n.properties',
										content: ''
									}
								]
							}
						]
					},
					{
						key: 'dateRange',
						target: 'exploreSamples',
						title: 'Date Ranges',
						experimental: true,
						settings: {
							columns: 7
						},
						manifestUrl: '/samples/dateRange.json'
					},
					{
						key: 'destinations',
						target: 'exploreSamples',
						title: 'Destinations',
						useIFrame: true,
						files: [
							{
								url: '/samples/destinations/index.html',
								name: 'index.html',
								key: 'index.html',
								content: ''
							},
							{
								url: '/samples/destinations/cardManifest.json',
								name: 'cardManifest.json',
								key: 'cardManifest.json',
								content: ''
							},
							{
								url: '/samples/destinations/Destinations.view.xml',
								name: 'Destinations.view.xml',
								key: 'Destinations.view.xml',
								content: ''
							},
							{
								url: '/samples/destinations/Destinations.controller.js',
								name: 'Destinations.controller.js',
								key: 'Destinations.controller.js',
								content: ''
							},
							{
								url: '/samples/destinations/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json',
								content: ''
							},
							{
								url: '/samples/destinations/Component.js',
								name: 'Component.js',
								key: 'Component.js',
								content: ''
							}
						]
					},
					{
						key: 'dynamicCounter',
						target: 'exploreSamples',
						title: 'Dynamic Counter',
						manifestUrl: '/samples/dynamicCounter/manifest.json'
					},
					{
						key: 'hostActions',
						target: 'exploreSamples',
						title: 'Host Actions',
						useIFrame: true,
						files: [
							{
								url: '/samples/hostActions/index.html',
								name: 'index.html',
								key: 'index.html',
								content: ''
							},
							{
								url: '/samples/hostActions/cardManifest.json',
								name: 'cardManifest.json',
								key: 'cardManifest.json',
								content: ''
							},
							{
								url: '/samples/hostActions/HostActions.view.xml',
								name: 'HostActions.view.xml',
								key: 'HostActions.view.xml',
								content: ''
							},
							{
								url: '/samples/hostActions/HostActions.controller.js',
								name: 'HostActions.controller.js',
								key: 'HostActions.controller.js',
								content: ''
							},
							{
								url: '/samples/hostActions/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json',
								content: ''
							},
							{
								url: '/samples/hostActions/Component.js',
								name: 'Component.js',
								key: 'Component.js',
								content: ''
							}
						]
					},
					{
						key: 'parameters',
						target: 'exploreSamples',
						title: 'Parameters',
						manifestUrl: '/samples/parameters.json'
					},
					{
						key: 'translation',
						target: 'exploreSamples',
						title: 'Translation',
						files: [
							{
								url: '/samples/translation/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json',
								content: ''
							},
							{
								url: '/samples/translation/i18n/i18n.properties',
								name: 'i18n/i18n.properties',
								key: 'i18n/i18n.properties',
								content: ''
							}
						]
					}
				]
			},
			{
				title: 'Card Formatters',
				key: 'formatters',
				target: 'exploreOverview',
				targetKey: 'formatters',
				icon: 'sap-icon://text-formatting',
				hasExpander: false,
				items: [
					{
						key: 'currency',
						target: 'exploreSamples',
						title: 'Currency',
						manifestUrl: "/samples/formatters/currency/manifest.json"
					},
					{
						key: 'dateAndTime',
						target: 'exploreSamples',
						title: 'Date and Time',
						manifestUrl: "/samples/formatters/dateAndTime/manifest.json"
					},
					{
						key: 'float',
						target: 'exploreSamples',
						title: 'Float',
						manifestUrl: "/samples/formatters/float/manifest.json"
					},
					{
						key: 'integer',
						target: 'exploreSamples',
						title: 'Integer',
						manifestUrl: "/samples/formatters/integer/manifest.json"
					},
					{
						key: 'percent',
						target: 'exploreSamples',
						title: 'Percent',
						manifestUrl: "/samples/formatters/percent/manifest.json"
					},
					{
						key: 'unit',
						target: 'exploreSamples',
						title: 'Unit of Measurement',
						manifestUrl: "/samples/formatters/unit/manifest.json"
					}
				]
			}
		]
	});
});
