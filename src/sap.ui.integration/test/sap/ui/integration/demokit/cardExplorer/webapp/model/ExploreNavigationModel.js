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
							},
							{
								title: 'Submit with Extension',
								key: 'extension',
								manifestUrl: '/samples/adaptive/extensionSample/manifest.json',
								files: [
									{
										url: '/samples/adaptive/extensionSample/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/adaptive/extensionSample/SampleExtension.js',
										name: 'SampleExtension.js',
										key: 'SampleExtension.js'
									},
									{
										url: '/samples/adaptive/extensionSample/i18n/i18n.properties',
										name: 'i18n/i18n.properties',
										key: 'i18n/i18n.properties'
									}
								]
							},
							{
								title: 'Open URL Action',
								key: 'adaptive-action-openurl',
								manifestUrl: '/samples/adaptive/action-openurl.json'
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
							},
							{
								title: 'Friend Requests',
								key: 'friendRequests',
								files: [
									{
										url: '/samples/list/friendRequests/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/list/friendRequests/images/John_Miller.png',
										name: 'images/John_Miller.png',
										key: 'images/John_Miller.png'
									},
									{
										url: '/samples/list/friendRequests/images/Donna_Moore.png',
										name: 'images/Donna_Moore.png',
										key: 'images/Donna_Moore.png'
									},
									{
										url: '/samples/list/friendRequests/images/Elena_Petrova.jpg',
										name: 'images/Elena_Petrova.jpg',
										key: 'images/Elena_Petrova.jpg'
									}
								]
							}
						]
					},
					{
						title: 'Object',
						target: 'exploreSamples',
						key: 'object',
						subSamples: [
							{
								title: 'Object',
								key: 'object1',
								manifestUrl: '/samples/object/object.json',
								settings: {
									columns: 5
								}
							},
							{
								title: 'Visible Object Attributes',
								key: 'visibleObjects',
								manifestUrl: '/samples/object/visibleObject.json',
								settings: {
									columns: 5
								}
							}
						]
					},
					{
						title: 'Table',
						target: 'exploreSamples',
						key: 'table',
						subSamples: [
							{
								title: 'Table',
								key: 'table1',
								manifestUrl: '/samples/table/table.json',
								settings: {
									columns: 6
								}
							},
							{
								title: 'Visible Columns',
								key: 'visibleColumns',
								manifestUrl: '/samples/table/visibleColumns.json',
								settings: {
									columns: 5
								}
							},
							{
								title: 'Employees',
								key: 'employees',
								settings: {
									columns: 5
								},
								files: [
									{
										url: '/samples/table/employees/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/table/employees/images/John_Miller.png',
										name: 'images/John_Miller.png',
										key: 'images/John_Miller.png'
									},
									{
										url: '/samples/table/employees/images/Donna_Moore.png',
										name: 'images/Donna_Moore.png',
										key: 'images/Donna_Moore.png'
									},
									{
										url: '/samples/table/employees/images/Elena_Petrova.jpg',
										name: 'images/Elena_Petrova.jpg',
										key: 'images/Elena_Petrova.jpg'
									}
								]
							}
						]
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
								files: [
									{
										url: '/samples/timeline/members.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/timeline/images/Alain_Chevalier.png',
										name: 'images/Alain_Chevalier.png',
										key: 'images/Alain_Chevalier.png'
									},
									{
										url: '/samples/timeline/images/Laurent_Dubois.png',
										name: 'images/Laurent_Dubois.png',
										key: 'images/Laurent_Dubois.png'
									},
									{
										url: '/samples/timeline/images/Monique_Legrand.png',
										name: 'images/Monique_Legrand.png',
										key: 'images/Monique_Legrand.png'
									},
									{
										url: '/samples/timeline/images/Sabine_Mayer.png',
										name: 'images/Sabine_Mayer.png',
										key: 'images/Sabine_Mayer.png'
									}
								]
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
										url: '/samples/extension/gettingData/DataExtension.js',
										name: 'DataExtension.js',
										key: 'DataExtension.js'
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
										url: '/samples/extension/customFormatters/CustomFormattersExtension.js',
										name: 'CustomFormattersExtension.js',
										key: 'CustomFormattersExtension.js'
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
										url: '/samples/extension/customActions/CustomActionsExtension.js',
										name: 'CustomActionsExtension.js',
										key: 'CustomActionsExtension.js'
									}
								]
							},
							{
								title: 'Northwind Image Conversion',
								key: 'northwindImage',
								files: [
									{
										url: '/samples/extensioan/northwindImage/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/extension/northwindImage/NorthwindImageExtension.js',
										name: 'NorthwindImageExtension.js',
										key: 'NorthwindImageExtension.js'
									}
								]
							}
						]
					},
					{
						key: 'filters',
						target: 'exploreSamples',
						title: 'Filters',
						experimental: true,
						subSamples: [
							{
								title: 'Dynamically Defined Filter',
								key: 'dynamicFilter',
								manifestUrl: '/samples/filters/dynamicFilter.json'
							},
							{
								title: 'Using Static Items',
								key: 'usingStaticItems',
								mockServer: true,
								manifestUrl: '/samples/filters/usingStaticItems.json'
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
						key: 'adaptiveCustomizedActions',
						target: 'exploreSamples',
						title: 'Adaptive - Custom Actions',
						useIFrame: true,
						isApplication: true,
						files: [
							{
								url: '/samples/adaptiveCustomizedActions/indexTemplate.html',
								name: 'index.html',
								key: 'index.html'
							},
							{
								url: '/samples/adaptiveCustomizedActions/cardManifest.json',
								name: 'cardManifest.json',
								key: 'cardManifest.json'
							},
							{
								url: '/samples/adaptiveCustomizedActions/AdaptiveCustomizedActions.view.xml',
								name: 'AdaptiveCustomizedActions.view.xml',
								key: 'AdaptiveCustomizedActions.view.xml'
							},
							{
								url: '/samples/adaptiveCustomizedActions/AdaptiveCustomizedActions.controller.js',
								name: 'AdaptiveCustomizedActions.controller.js',
								key: 'AdaptiveCustomizedActions.controller.js'
							},
							{
								url: '/samples/adaptiveCustomizedActions/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json'
							},
							{
								url: '/samples/adaptiveCustomizedActions/Component.js',
								name: 'Component.js',
								key: 'Component.js'
							},
							{
								url: '/samples/adaptiveCustomizedActions/CustomizedActionsExtension.js',
								name: 'CustomizedActionsExtension.js',
								key: 'CustomizedActionsExtension.js'
							}
						]
					},
					{
						key: 'badge',
						target: 'exploreSamples',
						title: 'Text Badge',
						useIFrame: true,
						isApplication: true,
						files: [
							{
								url: '/samples/badge/indexTemplate.html',
								name: 'index.html',
								key: 'index.html'
							},
							{
								url: '/samples/badge/cardManifest.json',
								name: 'cardManifest.json',
								key: 'cardManifest.json'
							},
							{
								url: '/samples/badge/Badge.view.xml',
								name: 'Badge.view.xml',
								key: 'Badge.view.xml'
							},
							{
								url: '/samples/badge/Badge.controller.js',
								name: 'Badge.controller.js',
								key: 'Badge.controller.js'
							},
							{
								url: '/samples/badge/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json'
							},
							{
								url: '/samples/badge/Component.js',
								name: 'Component.js',
								key: 'Component.js'
							}
						]
					},
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
										url: '/samples/destinations/extensionUsingDestinations/cardBundle/DataExtension.js',
										name: 'cardBundle/DataExtension.js',
										key: 'cardBundle/DataExtension.js'
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
							},
							{
								title: 'SAP Cloud Platform',
								key: 'scp',
								useIFrame: true,
								isApplication: true,
								mockServer: true,
								files: [
									{
										url: '/samples/destinations/scp/indexTemplate.html',
										name: 'index.html',
										key: 'index.html'
									},
									{
										url: '/samples/destinations/scp/cardBundle/cardManifest.json',
										name: 'cardBundle/cardManifest.json',
										key: 'cardBundle/cardManifest.json'
									},
									{
										url: '/samples/destinations/scp/neo-app.json',
										name: 'neo-app.json',
										key: 'neo-app.json'
									},
									{
										url: '/samples/destinations/scp/View.view.xml',
										name: 'Destinations.view.xml',
										key: 'Destinations.view.xml'
									},
									{
										url: '/samples/destinations/scp/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json',
										isApplicationManifest: true
									},
									{
										url: '/samples/destinations/scp/Component.js',
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
								url: '/samples/hostAndExtensionActions/cardBundle/ActionsExtension.js',
								name: 'ActionsExtension.js',
								key: 'ActionsExtension.js'
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
					},
					{
						key: 'hostContext',
						target: 'exploreSamples',
						title: 'Host Context',
						useIFrame: true,
						isApplication: true,
						experimental: true,
						files: [
							{
								url: '/samples/hostContext/indexTemplate.html',
								name: 'index.html',
								key: 'index.html'
							},
							{
								url: '/samples/hostContext/cardManifest.json',
								name: 'cardManifest.json',
								key: 'cardManifest.json'
							},
							{
								url: '/samples/hostContext/HostContext.view.xml',
								name: 'HostContext.view.xml',
								key: 'HostContext.view.xml'
							},
							{
								url: '/samples/hostContext/HostContext.controller.js',
								name: 'HostContext.controller.js',
								key: 'HostContext.controller.js'
							},
							{
								url: '/samples/hostContext/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json'
							},
							{
								url: '/samples/hostContext/Component.js',
								name: 'Component.js',
								key: 'Component.js'
							}
						]
					}
				]
			},
			{
				title: 'Card Editor Design-time',
				icon: 'sap-icon://create-form',
				key: 'designtime',
				target: 'exploreOverview',
				hasExpander: false,
				hidden: !window._isinternal,
				items: [
					{
						key: 'designtimeAdmin',
						target: 'exploreSamples',
						title: 'Administrator Editor',
						useIFrame: true,
						isApplication: true,
						files: [
							{
								url: '/samples/designtimeAdmin/index.html',
								name: 'index.html',
								key: 'index.html'
							},
							{
								url: '/samples/designtimeAdmin/dt/designtime.js',
								name: 'dt/designtime.js',
								key: 'designtime.js'
							},
							{
								url: '/samples/designtimeAdmin/manifest.json',
								name: 'manifest.json',
								key: 'cardManifest.json'
							},
							{
								url: '/samples/designtimeAdmin/i18n/i18n.properties',
								name: 'i18n/i18n.properties',
								key: 'i18n.properties'
							}
						]
					},
					{
						key: 'designtimeContent',
						target: 'exploreSamples',
						title: 'Page/Content Administrator Editor',
						useIFrame: true,
						isApplication: true,
						files: [
							{
								url: '/samples/designtimeContent/index.html',
								name: 'index.html',
								key: 'index.html'
							},
							{
								url: '/samples/designtimeContent/dt/designtime.js',
								name: 'dt/designtime.js',
								key: 'designtime.js'
							},
							{
								url: '/samples/designtimeContent/manifest.json',
								name: 'manifest.json',
								key: 'cardManifest.json'
							},
							{
								url: '/samples/designtimeAdmin/i18n/i18n.properties',
								name: 'i18n/i18n.properties',
								key: 'i18n.properties'
							}
						]
					},
					{
						key: 'designtimeTranslation',
						target: 'exploreSamples',
						title: 'Translator Editor',
						useIFrame: true,
						isApplication: true,
						files: [
							{
								url: '/samples/designtimeTranslation/index.html',
								name: 'index.html',
								key: 'index.html'
							},
							{
								url: '/samples/designtimeTranslation/dt/designtime.js',
								name: 'dt/designtime.js',
								key: 'designtime.js'
							},
							{
								url: '/samples/designtimeTranslation/manifest.json',
								name: 'manifest.json',
								key: 'cardManifest.json'
							},
							{
								url: '/samples/designtimeTranslation/i18n/i18n_fr.properties',
								name: 'i18n/i18n_fr.properties',
								key: 'i18n.properties'
							},
							{
								url: '/samples/designtimeTranslation/i18n/i18n_de.properties',
								name: 'i18n/i18n_de.properties',
								key: 'i18n.properties'
							},
							{
								url: '/samples/designtimeTranslation/i18n/i18n.properties',
								name: 'i18n/i18n.properties',
								key: 'i18n.properties'
							}
						]
					},
					{
						key: 'designtimeFields',
						target: 'exploreSamples',
						title: 'Field Playground',
						useIFrame: true,
						isApplication: true,
						files: [
							{
								url: '/samples/designtimeFields/index.html',
								name: 'index.html',
								key: 'index.html'
							},
							{
								url: '/samples/designtimeFields/dt/designtime.js',
								name: 'dt/designtime.js',
								key: 'designtime.js'
							},
							{
								url: '/samples/designtimeFields/manifest.json',
								name: 'manifest.json',
								key: 'cardManifest.json'
							},
							{
								url: '/samples/designtimeFields/i18n/i18n.properties',
								name: 'i18n/i18n.properties',
								key: 'i18n.properties'
							}
						]
					},
					{
						key: 'designtimePreview',
						target: 'exploreSamples',
						title: 'Editor Preview Settings ',
						useIFrame: true,
						isApplication: true,
						files: [
							{
								url: '/samples/designtimePreview/index.html',
								name: 'index.html',
								key: 'index.html'
							},
							{
								url: '/samples/designtimePreview/dt/designtime.js',
								name: 'dt/designtime.js',
								key: 'designtime.js'
							},
							{
								url: '/samples/designtimePreview/manifest.json',
								name: 'manifest.json',
								key: 'cardManifest.json'
							},
							{
								url: '/samples/designtimePreview/i18n/i18n.properties',
								name: 'i18n/i18n.properties',
								key: 'i18n.properties'
							}
						]
					}
				]
			}
		]
	});
});
