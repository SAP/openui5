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
										key: 'manifest.json'
									},
									{
										url: '/samples/adaptive/data-json.json',
										name: 'data.json',
										key: 'data.json'
									}
								]
							},
							{
								title: 'Markdown',
								key: 'markdown',
								manifestUrl: '/samples/adaptive/markdown.json'
							},
							{
								title: 'Submit Action',
								key: 'adaptive-action-submit',
								manifestUrl: '/samples/adaptive/action-submit.json'
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
										key: 'manifest.json'
									},
									{
										url: '/samples/component/cardContent/Component.js',
										name: 'Component.js',
										key: 'Component.js'
									},
									{
										url: '/samples/component/cardContent/Main.controller.js',
										name: 'Main.controller.js',
										key: 'Main.controller.js'
									},
									{
										url: '/samples/component/cardContent/View.view.xml',
										name: 'View.view.xml',
										key: 'View.view.xml'
									},
									{
										url: '/samples/component/cardContent/Image.png',
										name: 'Image.png',
										key: 'Image.png'
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
										key: 'manifest.json'
									},
									{
										url: '/samples/component/cardContentHeaderBottom/Component.js',
										name: 'Component.js',
										key: 'Component.js'
									},
									{
										url: '/samples/component/cardContentHeaderBottom/Main.controller.js',
										name: 'Main.controller.js',
										key: 'Main.controller.js'
									},
									{
										url: '/samples/component/cardContentHeaderBottom/View.view.xml',
										name: 'View.view.xml',
										key: 'View.view.xml'
									},
									{
										url: '/samples/component/cardContentHeaderBottom/Image.png',
										name: 'Image.png',
										key: 'Image.png'
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
										key: 'manifest.json'
									},
									{
										url: '/samples/component/cardContentControls/Component.js',
										name: 'Component.js',
										key: 'Component.js'
									},
									{
										url: '/samples/component/cardContentControls/View.view.xml',
										name: 'View.view.xml',
										key: 'View.view.xml'
									},
									{
										url: '/samples/component/cardContentControls/Main.controller.js',
										name: 'Main.controller.js',
										key: 'Main.controller.js'
									}
								]
							},
							{
								title: 'Advanced',
								key: 'advanced',
								files: [
									{
										url: '/samples/component/advanced/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/component/advanced/Component.js',
										name: 'Component.js',
										key: 'Component.js'
									},
									{
										url: '/samples/component/advanced/Main.controller.js',
										name: 'Main.controller.js',
										key: 'Main.controller.js'
									},
									{
										url: '/samples/component/advanced/View.view.xml',
										name: 'View.view.xml',
										key: 'View.view.xml'
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
							},
							{
								title: 'Bullet Chart',
								key: 'bulletChart',
								experimental: true,
								files: [
									{
										url: '/samples/list/bulletChart/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/list/bulletChart/data.json',
										name: 'data.json',
										key: 'data.json'
									}
								]
							},
							{
								title: 'Stacked Bar Chart',
								key: 'stackedBar',
								experimental: true,
								files: [
									{
										url: '/samples/list/stackedBar/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/list/stackedBar/data.json',
										name: 'data.json',
										key: 'data.json'
									}
								]
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
								mockServer: true,
								manifestUrl: '/samples/dataSources/topProducts.json'
							},
							{
								title: 'Product',
								key: 'product',
								mockServer: true,
								settings: {
									columns: 6
								},
								files: [
									{
										url: '/samples/dataSources/product.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/dataSources/i18n/i18n.properties',
										name: 'i18n/i18n.properties',
										key: 'i18n/i18n.properties'
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
						key: 'dynamicCounter',
						target: 'exploreSamples',
						title: 'Dynamic Counter',
						files: [
							{
								url: '/samples/dynamicCounter/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json'
							},
							{
								url: '/samples/dynamicCounter/i18n/i18n.properties',
								name: 'i18n/i18n.properties',
								key: 'i18n/i18n.properties'
							}
						]
					},
					{
						key: 'extension',
						target: 'exploreSamples',
						title: 'Extension',
						experimental: true,
						subSamples: [
							{
								title: 'Getting Data From Multiple Sources',
								key: 'gettingData',
								files: [
									{
										url: '/samples/extension/gettingData/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/extension/gettingData/myExtension.js',
										name: 'myExtension.js',
										key: 'myExtension.js'
									}
								]
							},
							{
								title: 'Custom Formatters',
								key: 'customFormatters',
								files: [
									{
										url: '/samples/extension/customFormatters/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/extension/customFormatters/myExtension.js',
										name: 'myExtension.js',
										key: 'myExtension.js'
									}
								]
							},
							{
								title: 'Custom Actions',
								key: 'customActions',
								files: [
									{
										url: '/samples/extension/customActions/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/extension/customActions/myExtension.js',
										name: 'myExtension.js',
										key: 'myExtension.js'
									}
								]
							}
						]
					},
					{
						key: 'filtering',
						target: 'exploreSamples',
						title: 'Filtering',
						experimental: true,
						mockServer: true,
						manifestUrl: '/samples/filtering/products.json'
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
								key: 'manifest.json'
							},
							{
								url: '/samples/translation/i18n/i18n.properties',
								name: 'i18n/i18n.properties',
								key: 'i18n/i18n.properties'
							}
						]
					}
				]
			},
			{
				title: 'Card Formatters',
				key: 'formatters',
				target: 'exploreOverview',
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
			},
			{
				title: 'Integration',
				icon: 'sap-icon://puzzle',
				key: 'integration',
				target: 'exploreOverview',
				hasExpander: false,
				items: [
					{
						key: 'htmlConsumption',
						target: 'exploreSamples',
						title: 'Consumption in HTML',
						useIFrame: true,
						isApplication: true,
						files: [
							{
								url: '/samples/htmlConsumption/indexTemplate.html',
								name: 'index.html',
								key: 'index.html'
							},
							{
								url: '/samples/htmlConsumption/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json'
							},
							{
								url: '/samples/htmlConsumption/i18n/i18n.properties',
								name: 'i18n/i18n.properties',
								key: 'i18n/i18n.properties'
							},
							{
								url: '/samples/htmlConsumption/items.json',
								name: 'items.json',
								key: 'items.json'
							}
						]
					},
					{
						key: 'destinations',
						target: 'exploreSamples',
						title: 'Destinations',
						subSamples: [
							{
								title: 'General',
								key: 'general',
								useIFrame: true,
								isApplication: true,
								files: [
									{
										url: '/samples/destinations/general/indexTemplate.html',
										name: 'index.html',
										key: 'index.html'
									},
									{
										url: '/samples/destinations/general/cardManifest.json',
										name: 'cardManifest.json',
										key: 'cardManifest.json'
									},
									{
										url: '/samples/destinations/general/Destinations.view.xml',
										name: 'Destinations.view.xml',
										key: 'Destinations.view.xml'
									},
									{
										url: '/samples/destinations/general/Destinations.controller.js',
										name: 'Destinations.controller.js',
										key: 'Destinations.controller.js'
									},
									{
										url: '/samples/destinations/general/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json',
										isApplicationManifest: true
									},
									{
										url: '/samples/destinations/general/Component.js',
										name: 'Component.js',
										key: 'Component.js'
									}
								]
							},
							{
								title: 'Component Card',
								key: 'component',
								useIFrame: true,
								isApplication: true,
								files: [
									{
										url: '/samples/destinations/component/indexTemplate.html',
										name: 'index.html',
										key: 'index.html'
									},
									{
										url: '/samples/destinations/component/Destinations.view.xml',
										name: 'Destinations.view.xml',
										key: 'Destinations.view.xml'
									},
									{
										url: '/samples/destinations/component/Destinations.controller.js',
										name: 'Destinations.controller.js',
										key: 'Destinations.controller.js'
									},
									{
										url: '/samples/destinations/component/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json',
										isApplicationManifest: true
									},
									{
										url: '/samples/destinations/component/Component.js',
										name: 'Component.js',
										key: 'Component.js'
									},
									{
										url: '/samples/destinations/component/sampleComponent/manifest.json',
										name: 'sampleComponent/manifest.json',
										key: 'sampleComponent/manifest.json'
									},
									{
										url: '/samples/destinations/component/sampleComponent/Component.js',
										name: 'sampleComponent/Component.js',
										key: 'sampleComponent/Component.js'
									},
									{
										url: '/samples/destinations/component/sampleComponent/Main.view.xml',
										name: 'sampleComponent/Main.view.xml',
										key: 'sampleComponent/Main.view.xml'
									}
								]
							},
							{
								title: 'Extension Using Destinations',
								key: 'extensionUsingDestinations',
								useIFrame: true,
								isApplication: true,
								files: [
									{
										url: '/samples/destinations/extensionUsingDestinations/indexTemplate.html',
										name: 'index.html',
										key: 'index.html'
									},
									{
										url: '/samples/destinations/extensionUsingDestinations/cardBundle/cardManifest.json',
										name: 'cardBundle/cardManifest.json',
										key: 'cardBundle/cardManifest.json'
									},
									{
										url: '/samples/destinations/extensionUsingDestinations/cardBundle/myExtension.js',
										name: 'cardBundle/myExtension.js',
										key: 'cardBundle/myExtension.js'
									},
									{
										url: '/samples/destinations/extensionUsingDestinations/View.view.xml',
										name: 'Destinations.view.xml',
										key: 'Destinations.view.xml'
									},
									{
										url: '/samples/destinations/extensionUsingDestinations/Controller.controller.js',
										name: 'Destinations.controller.js',
										key: 'Destinations.controller.js'
									},
									{
										url: '/samples/destinations/extensionUsingDestinations/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json',
										isApplicationManifest: true
									},
									{
										url: '/samples/destinations/extensionUsingDestinations/Component.js',
										name: 'Component.js',
										key: 'Component.js'
									}
								]
							}
						]
					},
					{
						key: 'hostActions',
						target: 'exploreSamples',
						title: 'Host Actions',
						useIFrame: true,
						isApplication: true,
						files: [
							{
								url: '/samples/hostActions/indexTemplate.html',
								name: 'index.html',
								key: 'index.html'
							},
							{
								url: '/samples/hostActions/cardManifest.json',
								name: 'cardManifest.json',
								key: 'cardManifest.json'
							},
							{
								url: '/samples/hostActions/adaptiveCardManifest.json',
								name: 'adaptiveCardManifest.json',
								key: 'adaptiveCardManifest.json'
							},
							{
								url: '/samples/hostActions/HostActions.view.xml',
								name: 'HostActions.view.xml',
								key: 'HostActions.view.xml'
							},
							{
								url: '/samples/hostActions/HostActions.controller.js',
								name: 'HostActions.controller.js',
								key: 'HostActions.controller.js'
							},
							{
								url: '/samples/hostActions/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json'
							},
							{
								url: '/samples/hostActions/Component.js',
								name: 'Component.js',
								key: 'Component.js'
							}
						]
					},
					{
						key: 'hostAndExtensionActions',
						target: 'exploreSamples',
						title: 'Host and Extension Actions',
						useIFrame: true,
						isApplication: true,
						files: [
							{
								url: '/samples/hostAndExtensionActions/indexTemplate.html',
								name: 'index.html',
								key: 'index.html'
							},
							{
								url: '/samples/hostAndExtensionActions/cardBundle/cardManifest.json',
								name: 'cardBundle/cardManifest.json',
								key: 'cardBundle/cardManifest.json'
							},
							{
								url: '/samples/hostAndExtensionActions/cardBundle/myExtension.js',
								name: 'cardBundle/myExtension.js',
								key: 'cardBundle/myExtension.js'
							},
							{
								url: '/samples/hostAndExtensionActions/View.view.xml',
								name: 'View.view.xml',
								key: 'View.view.xml'
							},
							{
								url: '/samples/hostAndExtensionActions/Controller.controller.js',
								name: 'Controller.controller.js',
								key: 'Controller.controller.js'
							},
							{
								url: '/samples/hostAndExtensionActions/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json',
								isApplicationManifest: true
							},
							{
								url: '/samples/hostAndExtensionActions/Component.js',
								name: 'Component.js',
								key: 'Component.js'
							}
						]
					}
				]
			}
		]
	});
});
