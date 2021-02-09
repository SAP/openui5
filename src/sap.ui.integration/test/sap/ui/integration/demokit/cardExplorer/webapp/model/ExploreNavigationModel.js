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
								files: [
									{
										url: '/samples/adaptive/adaptive.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/adaptive/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									}
								]
							},
							{
								title: 'RichTextBlock',
								key: 'richtext',
								files: [
									{
										url: '/samples/adaptive/richtext.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/adaptive/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									}
								]
							},
							{
								title: 'Form',
								key: 'form',
								files: [
									{
										url: '/samples/adaptive/form.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/adaptive/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									}
								]
							},
							{
								title: 'Templating',
								key: 'templating',
								files: [
									{
										url: '/samples/adaptive/templating.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/adaptive/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									}
								]
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
									},
									{
										url: '/samples/adaptive/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									}
								]
							},
							{
								title: 'Markdown',
								key: 'markdown',
								files: [
									{
										url: '/samples/adaptive/markdown.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/adaptive/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									}
								]
							},
							{
								title: 'Submit Action',
								key: 'adaptive-action-submit',
								files: [
									{
										url: '/samples/adaptive/action-submit.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/adaptive/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									}
								]
							},
							{
								title: 'Submit with Extension',
								key: 'extension',
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
									},
									{
										url: '/samples/adaptive/extensionSample/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									}
								]
							},
							{
								title: 'Open URL Action',
								key: 'adaptive-action-openurl',
								files: [
									{
										url: '/samples/adaptive/action-openurl.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/adaptive/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									}
								]
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
								files: [
									{
										url: '/samples/analytical/line.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/analytical/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									}
								]
							},
							{
								title: 'Stacked Column',
								key: 'stackedColumn',
								settings: {
									rows: 5,
									columns: 4
								},
								files: [
									{
										url: '/samples/analytical/stackedColumn.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/analytical/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									}
								]
							},
							{
								title: 'Donut',
								key: 'donut',
								settings: {
									rows: 3,
									columns: 3
								},
								files: [
									{
										url: '/samples/analytical/donut.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/analytical/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									}
								]
							}
						]
					},
					{
						title: 'Calendar',
						target: 'exploreSamples',
						key: 'calendar',
						subSamples: [
							{
								title: 'Calendar',
								key: 'calendar',
								settings: {
									columns: 7
								},
								files: [
									{
										url: '/samples/calendar/calendar.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							},
							{
								title: 'Fetch Data with Extension',
								key: 'extension',
								experimental: true,
								settings: {
									columns: 7
								},
								files: [
									{
										url: '/samples/calendar/extensionSample/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/calendar/extensionSample/SampleExtension.js',
										name: 'SampleExtension.js',
										key: 'SampleExtension.js'
									}
								]
							}
						],
						settings: {
							columns: 7
						},
						files: [
							{
								url: '/samples/calendar/calendar.json',
								name: 'manifest.json',
								key: 'manifest.json'
							},
							{
								url: '/samples/calendar/dt/Configuration.js',
								name: 'dt/Configuration.js',
								key: 'designtime.js'
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
								files: [
									{
										url: '/samples/component/cardContent/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/component/cardContent/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
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
										url: '/samples/component/cardContentHeaderBottom/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
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
										url: '/samples/component/cardContentControls/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
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
										url: '/samples/component/advanced/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
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
							},
							{
								title: 'Trigger action',
								key: 'triggerAction',
								files: [
									{
										url: '/samples/component/triggerAction/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/component/triggerAction/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									},
									{
										url: '/samples/component/triggerAction/Component.js',
										name: 'Component.js',
										key: 'Component.js'
									},
									{
										url: '/samples/component/triggerAction/Main.controller.js',
										name: 'Main.controller.js',
										key: 'Main.controller.js'
									},
									{
										url: '/samples/component/triggerAction/View.view.xml',
										name: 'View.view.xml',
										key: 'View.view.xml'
									}
								]
							},
							{
								title: 'Custom Actions',
								key: 'customActions',
								files: [
									{
										url: '/samples/component/customActions/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/component/customActions/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									},
									{
										url: '/samples/component/customActions/Component.js',
										name: 'Component.js',
										key: 'Component.js'
									},
									{
										url: '/samples/component/customActions/Main.controller.js',
										name: 'Main.controller.js',
										key: 'Main.controller.js'
									},
									{
										url: '/samples/component/customActions/View.view.xml',
										name: 'View.view.xml',
										key: 'View.view.xml'
									},
									{
										url: '/samples/component/customActions/Image.png',
										name: 'Image.png',
										key: 'Image.png'
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
								files: [
									{
										url: '/samples/list/highlight.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/list/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									}
								]
							},
							{
								title: 'Icon',
								key: 'icon',
								files: [
									{
										url: '/samples/list/icon.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/list/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									}
								]
							},
							{
								title: 'Numeric',
								key: 'numeric',
								files: [
									{
										url: '/samples/list/numeric.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/list/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									}
								]
							},
							{
								title: 'Quick Links',
								key: 'quickLinks',
								settings: {
									columns: 3
								},
								files: [
									{
										url: '/samples/list/quickLinks.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/list/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									}
								]
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
										url: '/samples/list/bulletChart/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
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
										url: '/samples/list/stackedBar/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
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
										url: '/samples/list/friendRequests/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
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
								title: 'Multiple Groups',
								key: 'object1',
								settings: {
									columns: 5
								},
								files: [
									{
										url: '/samples/object/object.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/object/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									}
								]
							},
							{
								title: 'Conditional Visibility Attributes',
								key: 'visibleObjects',
								settings: {
									columns: 5
								},
								files: [
									{
										url: '/samples/object/visibleObject.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/object/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									}
								]
							},
							{
								title: 'Array Parameters',
								key: 'arrayParameters',
								settings: {
									columns: 5
								},
								files: [
									{
										url: '/samples/object/arrayParameters.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/object/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									}
								]
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
								settings: {
									columns: 6
								},
								files: [
									{
										url: '/samples/table/table.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/table/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									}
								]
							},
							{
								title: 'Visible Columns',
								key: 'visibleColumns',
								settings: {
									columns: 5
								},
								files: [
									{
										url: '/samples/table/visibleColumns.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/table/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									}
								]
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
										url: '/samples/table/employees/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
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
								settings: {
									columns: 3
								},
								files: [
									{
										url: '/samples/timeline/activities.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/timeline/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									}
								]
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
										url: '/samples/timeline/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
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
						files: [
							{
								url: '/samples/actions/quickLinks/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json'
							},
							{
								url: '/samples/actions/quickLinks/dt/Configuration.js',
								name: 'dt/Configuration.js',
								key: 'designtime.js'
							}
						]
					},
					{
						key: 'data',
						target: 'exploreSamples',
						title: 'Data',
						subSamples: [
							{
								title: 'Basic Data Request',
								key: 'basic',
								files: [
									{
										url: '/samples/data/basic/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/data/basic/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									}
								]
							},
							{
								title: 'Using GraphQL',
								key: 'graphql',
								mockServer: true,
								files: [
									{
										url: '/samples/data/graphql/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/data/graphql/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									}
								]
							}
						]
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
								files: [
									{
										url: '/samples/dataSources/topProducts.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/dataSources/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									}
								]
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
										url: '/samples/dataSources/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
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
						files: [
							{
								url: '/samples/dateRanges/card1/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json'
							},
							{
								url: '/samples/dateRanges/card1/dt/Configuration.js',
								name: 'dt/Configuration.js',
								key: 'designtime.js'
							}
						]
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
								url: '/samples/dynamicCounter/dt/Configuration.js',
								name: 'dt/Configuration.js',
								key: 'designtime.js'
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
										url: '/samples/extension/gettingData/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
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
										url: '/samples/extension/customFormatters/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
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
										url: '/samples/extension/customActions/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									},
									{
										url: '/samples/extension/customActions/CustomActionsExtension.js',
										name: 'CustomActionsExtension.js',
										key: 'CustomActionsExtension.js'
									}
								]
							},
							{
								title: 'Named Data Section',
								key: 'namedDataSection',
								experimental: true,
								files: [
									{
										url: '/samples/extension/namedDataSection/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/extension/namedDataSection/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									},
									{
										url: '/samples/extension/namedDataSection/DataExtension.js',
										name: 'DataExtension.js',
										key: 'DataExtension.js'
									}
								]
							},
							{
								title: 'Northwind Image Conversion',
								key: 'northwindImage',
								files: [
									{
										url: '/samples/extension/northwindImage/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/extension/northwindImage/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
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
								files: [
									{
										url: '/samples/filters/dynamicFilter.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/filters/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									}
								]
							},
							{
								title: 'Using Static Items',
								key: 'usingStaticItems',
								mockServer: true,
								files: [
									{
										url: '/samples/filters/usingStaticItems.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/filters/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									}
								]
							}
						]
					},
					{
						key: 'parameters',
						target: 'exploreSamples',
						title: 'Parameters',
						files: [
							{
								url: '/samples/parameters/parameters/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json'
							},
							{
								url: '/samples/parameters/parameters/dt/Configuration.js',
								name: 'dt/Configuration.js',
								key: 'designtime.js'
							}
						]
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
								url: '/samples/translation/dt/Configuration.js',
								name: 'dt/Configuration.js',
								key: 'designtime.js'
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
						files: [
							{
								url: '/samples/formatters/currency/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json'
							},
							{
								url: '/samples/formatters/currency/dt/Configuration.js',
								name: 'dt/Configuration.js',
								key: 'designtime.js'
							}
						]
					},
					{
						key: 'dateAndTime',
						target: 'exploreSamples',
						title: 'Date and Time',
						files: [
							{
								url: '/samples/formatters/dateAndTime/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json'
							},
							{
								url: '/samples/formatters/dateAndTime/dt/Configuration.js',
								name: 'dt/Configuration.js',
								key: 'designtime.js'
							}
						]
					},
					{
						key: 'float',
						target: 'exploreSamples',
						title: 'Float',
						files: [
							{
								url: '/samples/formatters/float/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json'
							},
							{
								url: '/samples/formatters/float/dt/Configuration.js',
								name: 'dt/Configuration.js',
								key: 'designtime.js'
							}
						]
					},
					{
						key: 'integer',
						target: 'exploreSamples',
						title: 'Integer',
						files: [
							{
								url: '/samples/formatters/integer/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json'
							},
							{
								url: '/samples/formatters/integer/dt/Configuration.js',
								name: 'dt/Configuration.js',
								key: 'designtime.js'
							}
						]
					},
					{
						key: 'percent',
						target: 'exploreSamples',
						title: 'Percent',
						files: [
							{
								url: '/samples/formatters/percent/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json'
							},
							{
								url: '/samples/formatters/percent/dt/Configuration.js',
								name: 'dt/Configuration.js',
								key: 'designtime.js'
							}
						]
					},
					{
						key: 'text',
						target: 'exploreSamples',
						title: 'Text',
						files: [
							{
								url: '/samples/formatters/text/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json'
							},
							{
								url: '/samples/formatters/text/dt/Configuration.js',
								name: 'dt/Configuration.js',
								key: 'designtime.js'
							},
							{
								url: '/samples/formatters/text/i18n/i18n.properties',
								name: 'i18n.properties',
								key: 'i18n.properties'
							},
							{
								url: '/samples/formatters/text/i18n/i18n_de.properties',
								name: 'i18n_de.properties',
								key: 'i18n_de.properties'
							}
						]
					},
					{
						key: 'unit',
						target: 'exploreSamples',
						title: 'Unit of Measurement',
						files: [
							{
								url: '/samples/formatters/unit/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json'
							},
							{
								url: '/samples/formatters/unit/dt/Configuration.js',
								name: 'dt/Configuration.js',
								key: 'designtime.js'
							}
						]
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
								url: '/samples/adaptiveCustomizedActions/dt/Configuration.js',
								name: 'dt/Configuration.js',
								key: 'designtime.js'
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
								key: 'manifest.json',
								isApplicationManifest: true
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
								url: '/samples/badge/dt/Configuration.js',
								name: 'dt/Configuration.js',
								key: 'designtime.js'
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
								key: 'manifest.json',
								isApplicationManifest: true
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
								url: '/samples/htmlConsumption/dt/Configuration.js',
								name: 'dt/Configuration.js',
								key: 'designtime.js'
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
										url: '/samples/destinations/general/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
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
										url: '/samples/destinations/component/sampleComponent/dt/Configuration.js',
										name: 'sampleComponent/dt/Configuration.js',
										key: 'designtime.js'
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
										url: '/samples/destinations/extensionUsingDestinations/cardBundle/dt/Configuration.js',
										name: 'cardBundle/dt/Configuration.js',
										key: 'designtime.js'
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
										url: '/samples/destinations/scp/cardBundle/dt/Configuration.js',
										name: 'cardBundle/dt/Configuration.js',
										key: 'designtime.js'
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
								url: '/samples/hostActions/dt/Configuration.js',
								name: 'dt/Configuration.js',
								key: 'designtime.js'
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
								key: 'manifest.json',
								isApplicationManifest: true
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
								url: '/samples/hostAndExtensionActions/cardBundle/dt/Configuration.js',
								name: 'cardBundle/dt/Configuration.js',
								key: 'designtime.js'
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
								url: '/samples/hostContext/dt/Configuration.js',
								name: 'dt/Configuration.js',
								key: 'designtime.js'
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
								key: 'manifest.json',
								isApplicationManifest: true
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
				title: 'Configuration Editor',
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
								key: 'i18n_fr.properties'
							},
							{
								url: '/samples/designtimeTranslation/i18n/i18n_de.properties',
								name: 'i18n/i18n_de.properties',
								key: 'i18n_de.properties'
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
