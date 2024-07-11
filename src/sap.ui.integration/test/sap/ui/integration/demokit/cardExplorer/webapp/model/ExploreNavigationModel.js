sap.ui.define([
	'sap/ui/model/json/JSONModel',
	"../util/isDevelopmentBuild"
], function (JSONModel, isDevelopmentBuild) {
	'use strict';

	// Please order topics alphabetically by "title"
	return new JSONModel({
		selectedKey: 'learnGettingStarted',
		navigation: [
			{
				title: 'Declarative Card Types',
				icon: 'sap-icon://SAP-icons-TNT/requirement-diagram',
				key: 'typesDeclarative',
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
									}
								]
							},
							{
								title: 'Numeric Indicators Visibility',
								key: 'numericIndicators',
								files: [
									{
										url: '/samples/list/numericIndicators.json',
										name: 'manifest.json',
										key: 'manifest.json'
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
									}
								]
							},
							{
								title: 'Attributes',
								key: 'attributes',
								files: [
									{
										url: '/samples/list/attributes.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							},
							{
								title: 'Attributes Visibility',
								key: 'attributesVisibility',
								files: [
									{
										url: '/samples/list/attributesVisibility.json',
										name: 'manifest.json',
										key: 'manifest.json'
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
							},
							{
								title: 'Actions Strip',
								key: 'actionsStrip',
								files: [
									{
										url: '/samples/list/actionsStrip/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/list/actionsStrip/Extension.js',
										name: 'Extension.js',
										key: 'Extension.js'
									}
								]
							},
							{
								title: 'Dynamic Actions Strip',
								key: 'dynamicActionsStrip',
								experimental: true,
								files: [
									{
										url: '/samples/list/dynamicActionsStrip/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/list/dynamicActionsStrip/data.json',
										name: 'data.json',
										key: 'data.json'
									}
								]
							},
							{
								title: 'Actions Labels',
								key: 'actionsLabels',
								experimental: true,
								files: [{
										url: '/samples/list/actionsLabels/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							},
							{
								title: 'Grouping',
								key: 'grouping',
								files: [{
									url: '/samples/list/grouping.json',
									name: 'manifest.json',
									key: 'manifest.json'
								}]
							},
							{
								title: 'Icon Visibility',
								key: 'iconVisibility',
								files: [
									{
										url: '/samples/list/iconVisibility.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							},
							{
								title: 'My Campaigns',
								key: 'myCampaigns',
								files: [
									{
										url: '/samples/list/myCampaigns/myCampaigns.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/list/myCampaigns/images/example3.jpg',
										name: 'images/example3.jpg',
										key: 'images/example3.jpg'
									},
									{
										url: '/samples/list/myCampaigns/images/example2.jpg',
										name: 'images/example2.jpg',
										key: 'images/example2.jpg'
									},
									{
										url: '/samples/list/myCampaigns/images/example4.jpg',
										name: 'images/example4.jpg',
										key: 'images/example4.jpg'
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
									}
								]
							},
							{
								title: 'To Do Card',
								key: 'todoCard',
								settings: {
									columns: 4
								},
								files: [
									{
										url: '/samples/object/todo/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							},
							{
								title: 'Additional Object Details',
								key: 'additionalObjectDetails',
								settings: {
									columns: 5
								},
								files: [
									{
										url: '/samples/object/additionalObjectDetails.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							},
							{
								title: 'Form Inputs',
								key: 'form',
								experimental: true,
								settings: {
									columns: 5
								},
								files: [
									{
										url: '/samples/object/form/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							},
							{
								title: 'Form Inputs with Validation',
								key: 'formWithValidation',
								experimental: true,
								settings: {
									columns: 5
								},
								files: [
									{
										url: '/samples/object/formWithValidation/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/object/formWithValidation/i18n/i18n.properties',
										name: 'i18n/i18n.properties',
										key: 'i18n/i18n.properties'
									}
								]
							},
							{
								title: 'Form Inputs with Extension',
								key: 'formWithExtension',
								experimental: true,
								settings: {
									columns: 5
								},
								files: [
									{
										url: '/samples/object/formWithExtension/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/object/formWithExtension/SampleExtension.js',
										name: 'SampleExtension.js',
										key: 'SampleExtension.js'
									},
									{
										url: '/samples/object/formWithExtension/i18n/i18n.properties',
										name: 'i18n/i18n.properties',
										key: 'i18n/i18n.properties'
									}
								]
							},
							{
								title: 'Content Title Max Lines and Label Wrapping',
								key: 'titleMaxLinesAndLabelWrapping',
								experimental: true,
								settings: {
									columns: 5
								},
								files: [{
										url: '/samples/object/titleMaxLinesAndLabelWrapping/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							},
							{
								title: 'Icon Visibility',
								key: 'iconVisibility',
								settings: {
									columns: 5
								},
								files: [
									{
										url: '/samples/object/iconVisibility.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							},
							{
								title: 'Image',
								key: 'objectCardWithImage',
								experimental: true,
								settings: {
									columns: 4
								},
								files: [
									{
										url: '/samples/object/image/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							},
							{
								title: 'Image With Overlay',
								key: 'objectCardWithImageWithOverlay',
								experimental: true,
								settings: {
									columns: 8
								},
								files: [
									{
										url: '/samples/object/imageWithOverlay/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
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
							},
							{
								title: 'Grouping',
								key: 'grouping',
								settings: {
									columns: 6
								},
								files: [{
									url: '/samples/table/grouping.json',
									name: 'manifest.json',
									key: 'manifest.json'
								}]
							},
							{
								title: 'Highlight',
								key: 'highlight',
								settings: {
									columns: 6
								},
								files: [
									{
										url: '/samples/table/highlight.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							}
						]
					}, {
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
									}
								]
							},
							{
								title: 'Bubble',
								key: 'bubble',
								settings: {
									rows: 5,
									columns: 6
								},
								files: [
									{
										url: '/samples/analytical/bubble/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/analytical/bubble/data.json',
										name: 'data.json',
										key: 'data.json'
									}
								]
							},
							{
								title: 'Bar with Reference Lines',
								key: 'barWithReferenceLines',
								settings: {
									rows: 5,
									columns: 6
								},
								files: [
									{
										url: '/samples/analytical/barWithReferenceLines/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/analytical/barWithReferenceLines/data.json',
										name: 'data.json',
										key: 'data.json'
									}
								]
							},
							{
								title: 'Column with Conditional Colors',
								key: 'columnWithConditionalColors',
								settings: {
									rows: 5,
									columns: 6
								},
								files: [
									{
										url: '/samples/analytical/columnWithConditionalColors/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/analytical/columnWithConditionalColors/data.json',
										name: 'data.json',
										key: 'data.json'
									}
								]
							},
							{
								title: 'Navigation from Chart Sectors',
								key: 'chartActions',
								experimental: true,
								settings: {
									rows: 5,
									columns: 4
								},
								files: [
									{
										url: '/samples/analytical/chartActions/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							},
							{
								title: 'Details Popover',
								key: 'detailsPopover',
								experimental: true,
								settings: {
									rows: 5,
									columns: 4
								},
								files: [
									{
										url: '/samples/analytical/detailsPopover/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/analytical/detailsPopover/data.json',
										name: 'data.json',
										key: 'data.json'
									}
								]
							},
							{
								title: 'Popover Actions',
								key: 'popoverActions',
								experimental: true,
								settings: {
									rows: 5,
									columns: 4
								},
								files: [
									{
										url: '/samples/analytical/popoverActions/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/analytical/popoverActions/data.json',
										name: 'data.json',
										key: 'data.json'
									}
								]
							},
							{
								title: 'Popover Extension Actions',
								key: 'popoverExtensionActions',
								experimental: true,
								settings: {
									rows: 5,
									columns: 4
								},
								files: [
									{
										url: '/samples/analytical/popoverExtensionActions/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/analytical/popoverExtensionActions/ChartExtension.js',
										name: 'ChartExtension.js',
										key: 'ChartExtension.js'
									}
								]
							},
							{
								title: 'Column with Time Axis',
								key: 'timeAxis',
								settings: {
									rows: 5,
									columns: 4
								},
								files: [
									{
										url: '/samples/analytical/timeAxis/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/analytical/timeAxis/data.json',
										name: 'data.json',
										key: 'data.json'
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
							}
						]
					},
					{
						title: 'Timeline',
						target: 'exploreSamples',
						key: 'timeline',
						subSamples: [
							{
								title: 'Past Activities',
								key: 'general',
								settings: {
									columns: 3
								},
								files: [
									{
										url: '/samples/timeline/activities.json',
										name: 'manifest.json',
										key: 'manifest.json'
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
				title: 'Other Card Types',
				icon: 'sap-icon://SAP-icons-TNT/internal-block-diagram',
				key: 'typesOther',
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
										url: '/samples/adaptive/templating-content.json',
										name: 'templating-content.json',
										key: 'templating-content.json'
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
									}
								]
							},
							{
								title: 'Submit Action with Custom Payload',
								key: 'adaptive-action-submit-custom-payload',
								files: [
									{
										url: '/samples/adaptive/action-submit-custom-payload.json',
										name: 'manifest.json',
										key: 'manifest.json'
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
									}
								]
							},
							{
								title: 'Styled Actions',
								key: 'styled-actions',
								files: [
									{
										url: '/samples/adaptive/action-styling.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							},
							{
								title: 'Translations',
								key: 'translations',
								files: [
									{
										url: '/samples/adaptive/translationSample/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/adaptive/translationSample/i18n/i18n.properties',
										name: 'i18n/i18n.properties',
										key: 'i18n/i18n.properties'
									}
								]
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
								title: 'Media, Header at Bottom',
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
								title: 'Buy Bus Ticket',
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
										url: '/samples/component/advanced/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									},
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
							},
							{
								title: 'Trigger Action',
								key: 'triggerAction',
								files: [
									{
										url: '/samples/component/triggerAction/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
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
							},
							{
								title: 'No Data Message',
								key: 'noDataMessage',
								files: [
									{
										url: '/samples/component/noDataMessage/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/component/noDataMessage/Component.js',
										name: 'Component.js',
										key: 'Component.js'
									},
									{
										url: '/samples/component/noDataMessage/View.view.xml',
										name: 'View.view.xml',
										key: 'View.view.xml'
									}
								]
							},
							{
								title: 'Custom Image Message',
								key: 'customImage',
								experimental: true,
								files: [
									{
										url: '/samples/component/CustomImageMessage/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/component/CustomImageMessage/Component.js',
										name: 'Component.js',
										key: 'Component.js'
									},
									{
										url: '/samples/component/CustomImageMessage/View.view.xml',
										name: 'View.view.xml',
										key: 'View.view.xml'
									},
									{
										url: '/samples/component/CustomImageMessage/AuthRequired.jpg',
										name: 'AuthRequired.jpg',
										key: 'AuthRequired.jpg'
									}
								]
							},
							{
								title: 'Request Data',
								key: 'requestData',
								mockServer: true,
								files: [
									{
										url: '/samples/component/requestData/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/component/requestData/Component.js',
										name: 'Component.js',
										key: 'Component.js'
									},
									{
										url: '/samples/component/requestData/View.view.xml',
										name: 'View.view.xml',
										key: 'View.view.xml'
									},
									{
										url: '/samples/component/requestData/Main.controller.js',
										name: 'Main.controller.js',
										key: 'Main.controller.js'
									}
								]
							},
							{
								title: 'Component Preload',
								key: 'componentPreload',
								mockServer: true,
								isPreloadProject: true,
								files: [
									{
										url: '/samples/component/componentPreload/ui5.yaml',
										name: 'ui5.yaml',
										key: 'ui5.yaml'
									},
									{
										url: '/samples/component/componentPreload/package.json',
										name: 'package.json',
										key: 'package.json'
									},
									{
										url: '/samples/component/componentPreload/card/manifest.json',
										name: 'card/manifest.json',
										key: 'card/manifest.json'
									},
									{
										url: '/samples/component/componentPreload/card/Component.js',
										name: 'card/Component.js',
										key: 'card/Component.js'
									},
									{
										url: '/samples/component/componentPreload/card/View.view.xml',
										name: 'card/View.view.xml',
										key: 'card/View.view.xml'
									},
									{
										url: '/samples/component/componentPreload/card/Main.controller.js',
										name: 'card/Main.controller.js',
										key: 'card/Main.controller.js'
									},
									{
										url: '/samples/component/componentPreload/card/Image.png',
										name: 'card/Image.png',
										key: 'card/Image.png'
									},
									{
										url: '/samples/component/componentPreload/card/dt/Configuration.js',
										name: 'card/dt/Configuration.js',
										key: 'card/dt/Configuration.js'
									}
								]
							}
						]
					},
					{
						title: 'WebPage',
						target: 'exploreSamples',
						key: 'webPage',
						experimental: true,
						files: [
							{
								url: '/samples/webPage/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json'
							}
						],
						settings: {
							columns: 7
						}
					}
				]
			},
			{
				title: 'Progressive Disclosure',
				icon: 'sap-icon://dimension',
				key: 'progressiveDisclosure',
				target: 'exploreOverview',
				hasExpander: false,
				hidden: !isDevelopmentBuild(),
				items: [
					{
						key: 'progressive',
						target: 'exploreSamples',
						title: 'Samples',
						useIFrame: true,
						experimental: true,
						isApplication: false,
						hidden: !isDevelopmentBuild(),
						files: [
							{
								url: '/samples/progressive/index.html',
								name: 'index.html',
								key: 'index.html'
							},
							{
								url: '/samples/progressive/cardDefaultManifest.json',
								name: 'cardDefaultManifest.json',
								key: 'cardDefaultManifest.json'
							},
							{
								url: '/samples/progressive/cardNumericManifest.json',
								name: 'cardNumericManifest.json',
								key: 'cardNumericManifest.json'
							},
							{
								url: '/samples/progressive/cardWithUnsupportedVariants.json',
								name: 'cardWithUnsupportedVariants.json',
								key: 'cardWithUnsupportedVariants.json'
							},
							{
								url: '/samples/progressive/componentCard/manifest.json',
								name: 'componentCard/manifest.json',
								key: 'componentCard/manifest.json'
							},
							{
								url: '/samples/progressive/componentCard/Component.js ',
								name: 'componentCard/Component.js',
								key: 'componentCard/Component.js'
							},
							{
								url: '/samples/progressive/componentCard/Default.controller.js',
								name: 'componentCard/Default.controller.js',
								key: 'componentCard/Default.controller.js'
							},
							{
								url: '/samples/progressive/componentCard/Default.view.xml',
								name: 'componentCard/Default.view.xml',
								key: 'componentCard/Default.view.xml'
							},
							{
								url: '/samples/progressive/componentCard/Tile.controller.js',
								name: 'componentCard/Tile.controller.js',
								key: 'componentCard/Tile.controller.js'
							},
							{
								url: '/samples/progressive/componentCard/Tile.view.xml',
								name: 'componentCard/Tile.view.xml',
								key: 'componentCard/Tile.view.xml'
							},
							{
								url: '/samples/progressive/componentCard/Wide.controller.js',
								name: 'componentCard/Wide.controller.js',
								key: 'componentCard/Wide.controller.js'
							},
							{
								url: '/samples/progressive/componentCard/Wide.view.xml',
								name: 'componentCard/Wide.view.xml',
								key: 'componentCard/Wide.view.xml'
							},
							{
								url: '/samples/progressive/Preview.view.xml',
								name: 'Preview.view.xml',
								key: 'Preview.view.xml'
							},
							{
								url: '/samples/progressive/Preview.controller.js',
								name: 'Preview.controller.js',
								key: 'Preview.controller.js'
							},
							{
								url: '/samples/progressive/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json',
								isApplicationManifest: true
							},
							{
								url: '/samples/progressive/Component.js',
								name: 'Component.js',
								key: 'Component.js'
							}
						]
					}
				]
			},
			{
				title: 'Card Footer',
				key: 'footer',
				target: 'exploreSamples',
				icon: 'sap-icon://SAP-icons-TNT/local-process-call',
				hasExpander: false,
				subSamples: [
					{
						title: 'General Actions',
						key: 'generalActions',
						settings: {
							columns: 5
						},
						files: [
							{
								url: '/samples/footer/generalActions/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json'
							}
						]
					},
					{
						title: 'Adaptive Card With Dialog',
						key: 'cardWithDialog',
						experimental: true,
						settings: {
							columns: 4
						},
						files: [
							{
								url: '/samples/footer/cardWithDialog/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json'
							},
							{
								url: '/samples/footer/cardWithDialog/DetailsDialogExtension.js',
								name: 'DetailsDialogExtension.js',
								key: 'DetailsDialogExtension.js'
							},
							{
								url: '/samples/footer/cardWithDialog/detailsCard.json',
								name: 'detailsCard.json',
								key: 'detailsCard.json'
							},
							{
								url: '/samples/footer/cardWithDialog/images/DonnaMoore.png',
								name: 'images/DonnaMoore.png',
								key: 'images/DonnaMoore.png'
							}
						]
					},
					{
						title: 'Hidden Footer',
						key: 'hiddenFooter',
						settings: {
							columns: 6
						},
						files: [
							{
								url: '/samples/footer/hiddenFooter/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json'
							}
						]
					}
				]
			},
			{
				title: 'Card Filters',
				key: 'filters',
				target: 'exploreOverview',
				icon: 'sap-icon://filter',
				hasExpander: false,
				items: [
					{
						title: 'ComboBox',
						target: 'exploreSamples',
						key: 'comboBoxFilter',
						experimental: true,
						subSamples: [{
							title: 'Dynamically Defined Filter',
							key: 'dynamicFilter',
							files: [
								{
									url: '/samples/filters/comboBox/dynamicComboBoxFilter.json',
									name: 'manifest.json',
									key: 'manifest.json'
								},
								{
									url: '/samples/filters/comboBox/countries.json',
									name: 'countries.json',
									key: 'countries.json'
								}
							]
						}]
					},
					{
						title: 'DateRange',
						target: 'exploreSamples',
						key: 'dateRangeFilter',
						experimental: true,
						subSamples: [
							{
								title: 'My Activities',
								key: 'general',
								settings: {
									columns: 3
								},
								mockServer: true,
								files: [
									{
										url: '/samples/filters/dateRange/activities.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							},
							{
								title: 'My Agenda',
								key: 'agenda',
								settings: {
									columns: 3
								},
								mockServer: true,
								files: [
									{
										url: '/samples/filters/dateRange/agenda.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							},
							{
								title: "Completed Orders",
								key: "completedOrders",
								files: [
									{
										url: '/samples/filters/dateRange/dateRangeFilter.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							}
						]
					},
					{
						title: 'Search',
						target: 'exploreSamples',
						key: 'searchFilter',
						subSamples: [
							{
								title: 'Single Filter',
								key: 'singleFilter',
								files: [
									{
										url: '/samples/filters/search/singleFilter.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							},
							{
								title: 'Multiple Filters',
								key: 'multipleFilters',
								files: [
									{
										url: '/samples/filters/search/multipleFilters/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							},
							{
								title: 'Multiple Filters with Extension',
								key: 'multipleFiltersWithExtension',
								files: [
									{
										url: '/samples/filters/search/multipleFiltersWithExtension/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/filters/search/multipleFiltersWithExtension/FilterExtension.js',
										name: 'FilterExtension.js',
										key: 'FilterExtension.js'
									}
								]
							}
						]
					},
					{
						title: 'Select',
						target: 'exploreSamples',
						key: 'selectFilter',
						subSamples: [
							{
								title: 'Dynamically Defined Filter',
								key: 'dynamicFilter',
								files: [
									{
										url: '/samples/filters/select/dynamicFilter.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							},
							{
								title: 'Using Static Items',
								key: 'usingStaticItems',
								mockServer: true,
								files: [
									{
										url: '/samples/filters/select/usingStaticItems.json',
										name: 'manifest.json',
										key: 'manifest.json'
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
						subSamples: [
							{
								title: 'Navigation',
								key: 'navigation',
								target: 'exploreSamples',
								settings: {
									columns: 3
								},
								files: [
									{
										url: '/samples/actions/navigation/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							},
							{
								title: 'Intent-Based Navigation',
								key: 'ibn',
								target: 'exploreSamples',
								experimental: true,
								settings: {
									columns: 3
								},
								files: [
									{
										url: '/samples/actions/ibn/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							},
							{
								title: 'Show/Hide Card',
								key: 'showHideCard',
								target: 'exploreSamples',
								experimental: true,
								settings: {
									columns: 3
								},
								files: [
									{
										url: '/samples/actions/showHide/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/actions/showHide/detailsManifest.json',
										name: 'detailsManifest.json',
										key: 'detailsManifest.json'
									}
								]
							},
							{
								title: 'Approve/Deny with popup',
								key: 'approve',
								target: 'exploreSamples',
								experimental: true,
								settings: {
									columns: 3
								},
								files: [{
										url: '/samples/actions/approve/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/actions/approve/detailsManifest.json',
										name: 'detailsManifest.json',
										key: 'detailsManifest.json'
									},
									{
										url: '/samples/actions/approve/ApproveCardExtension.js',
										name: 'ApproveCardExtension.js',
										key: 'ApproveCardExtension.js'
									}
								]
							}
						]
					},
					{
						key: 'cache',
						target: 'exploreSamples',
						title: 'Cache',
						experimental: true,
						subSamples: [
							{
								title: 'Default',
								experimental: true,
								cache: true,
								key: 'default',
								settings: {
									columns: 5
								},
								files: [
									{
										url: '/samples/cache/default/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							},
							{
								title: 'Max Age: 1 Hour',
								experimental: true,
								cache: true,
								key: 'maxAge',
								settings: {
									columns: 5
								},
								files: [
									{
										url: '/samples/cache/maxAge/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							},
							{
								title: 'Disabled Cache',
								experimental: true,
								cache: true,
								key: 'disabledCache',
								settings: {
									columns: 5
								},
								files: [
									{
										url: '/samples/cache/disabledCache/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							}
						]
					},
					{
						key: 'noDataMessages',
						target: 'exploreSamples',
						title: 'No Data Message',
						experimental: true,
						subSamples: [
							{
								title: 'Custom No Data Message',
								key: 'custom',
								files: [
									{
										url: '/samples/noDataMessages/customNoDataMessage/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							},
							{
								title: 'Object Card No Data',
								key: 'object',
								files: [
									{
										url: '/samples/noDataMessages/objectNoDataMessage/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/noDataMessages/objectNoDataMessage/mockdata/employee.json',
										name: 'employee.json',
										key: 'employee.json'
									}
								]
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
									}
								]
							},
							{
								title: 'OData Batch Request',
								key: 'batchRequest',
								mockServer: true,
								experimental: true,
								files: [
									{
										url: '/samples/data/batchRequest/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							},
							{
								title: 'Using a CSRF Token',
								key: 'csrf',
								mockServer: true,
								files: [
									{
										url: '/samples/data/csrf/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							},
							{
								title: 'OAuth 3LO',
								key: 'oauth3lo',
								mockServer: true,
								experimental: true,
								consentFlow: true,
								files: [
									{
										url: '/samples/data/oauth3lo/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							},
							{
								title: 'Mock Data for Preview',
								key: 'mockData',
								experimental: true,
								files: [
									{
										url: '/samples/data/mockData/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/data/mockData/mockData.json',
										name: 'mockData.json',
										key: 'mockData.json'
									}
								]
							},
							{
								title: 'Model Size Limit',
								key: 'modelSizeLimit',
								experimental: true,
								files: [
									{
										url: '/samples/data/modelSizeLimit/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/data/modelSizeLimit/DataExtension.js',
										name: 'DataExtension.js',
										key: 'DataExtension.js'
									}
								]
							}
						]
					},
					{
						key: 'dataTimestamp',
						target: 'exploreSamples',
						title: 'Data Timestamp',
						experimental: true,
						subSamples: [
							{
								title: 'Default Header',
								key: 'defaultHeader',
								experimental: true,
								settings: {
									rows: 5,
									columns: 4
								},
								manifestUrl: '/samples/dataTimestamp/default.json'
							},
							{
								title: 'Numeric Header',
								key: 'numericHeader',
								experimental: true,
								settings: {
									rows: 5,
									columns: 4
								},
								manifestUrl: '/samples/dataTimestamp/numeric.json'
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
										url: '/samples/extension/namedDataSection/DataExtension.js',
										name: 'DataExtension.js',
										key: 'DataExtension.js'
									}
								]
							},
							{
								title: 'Load Third-Party Dependency',
								key: 'loadDependencies',
								experimental: true,
								settings: {
									columns: 5
								},
								files: [
									{
										url: '/samples/extension/loadDependencies/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/extension/loadDependencies/Extension.js',
										name: 'Extension.js',
										key: 'Extension.js'
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
										url: '/samples/extension/northwindImage/NorthwindImageExtension.js',
										name: 'NorthwindImageExtension.js',
										key: 'NorthwindImageExtension.js'
									}
								]
							},
							{
								title: 'Refresh Data',
								key: 'refreshData',
								files: [
									{
										url: '/samples/extension/refreshData/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/extension/refreshData/DataExtension.js',
										name: 'DataExtension.js',
										key: 'DataExtension.js'
									}
								]
							},
							{
								title: 'Show Message',
								key: 'showMessage',
								experimental: true,
								mockServer: true,
								interceptActions: false,
								files: [
									{
										url: '/samples/extension/showMessage/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/extension/showMessage/ShowMessageExtension.js',
										name: 'ShowMessageExtension.js',
										key: 'ShowMessageExtension.js'
									}
								]
							},
							{
								title: 'Shared Extension',
								key: 'sharedExtension',
								experimental: true,
								files: [
									{
										url: '/samples/extension/sharedExtension/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/extension/shared/lib/library.js',
										name: 'shared/lib/library.js',
										key: 'shared/lib/library.js'
									},
									{
										url: '/samples/extension/shared/lib/SharedExtension.js',
										name: 'shared/lib/SharedExtension.js',
										key: 'shared/lib/SharedExtension.js'
									}
								]
							},
							{
								title: 'Shared Extension With Fetch',
								key: 'sharedFetchExtension',
								experimental: true,
								files: [
									{
										url: '/samples/extension/sharedFetchExtension/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/extension/shared/lib/library.js',
										name: 'shared/lib/library.js',
										key: 'shared/lib/library.js'
									},
									{
										url: '/samples/extension/shared/lib/SharedFetchExtension.js',
										name: 'shared/lib/SharedFetchExtension.js',
										key: 'shared/lib/SharedFetchExtension.js'
									}
								]
							}
						]
					},
					{
						key: 'microCharts',
						target: 'exploreSamples',
						title: 'Micro Charts',
						experimental: true,
						subSamples: [
							{
								title: 'Line Chart',
								key: 'lineChart',
								experimental: true,
								files: [
									{
										url: '/samples/microCharts/lineChart/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/microCharts/lineChart/data.json',
										name: 'data.json',
										key: 'data.json'
									}
								]
							},
							{
								title: 'Bullet Chart',
								key: 'bulletChart',
								experimental: true,
								files: [
									{
										url: '/samples/microCharts/bulletChart/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/microCharts/bulletChart/data.json',
										name: 'data.json',
										key: 'data.json'
									}
								]
							},
							{
								title: 'Column Chart',
								key: 'columnChart',
								experimental: true,
								files: [
									{
										url: '/samples/microCharts/columnChart/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/microCharts/columnChart/data.json',
										name: 'data.json',
										key: 'data.json'
									}
								]
							},
							{
								title: 'Harvey Ball Chart',
								key: 'harveyBallChart',
								experimental: true,
								files: [
									{
										url: '/samples/microCharts/harveyBallChart/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/microCharts/harveyBallChart/data.json',
										name: 'data.json',
										key: 'data.json'
									}
								]
							},
							{
								title: 'Radial Chart',
								key: 'radialChart',
								experimental: true,
								files: [
									{
										url: '/samples/microCharts/radialChart/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/microCharts/radialChart/data.json',
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
										url: '/samples/microCharts/stackedBar/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/microCharts/stackedBar/data.json',
										name: 'data.json',
										key: 'data.json'
									}
								]
							},
							{
								title: 'Stacked Bar Chart with Zero Values',
								key: 'stackedBarZeroValues',
								experimental: true,
								files: [
									{
										url: '/samples/microCharts/stackedBarZeroValues/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/microCharts/stackedBarZeroValues/data.json',
										name: 'data.json',
										key: 'data.json'
									}
								]
							}
						]
					},
					{
						key: 'pagination',
						target: 'exploreSamples',
						title: 'Pagination',
						experimental: true,
						subSamples: [
							{
								title: 'Client-Side Pagination',
								key: "client",
								files: [
									{
										url: '/samples/pagination/client/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							},
							{
								title: 'Server-Side Pagination',
								key: "server",
								files: [
									{
										url: '/samples/pagination/server/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							},
							{
								title: 'Server-Side Pagination with Extension',
								key: "extension",
								files: [
									{
										url: '/samples/pagination/extension/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/pagination/extension/DataExtension.js',
										name: 'DataExtension.js',
										key: 'DataExtension.js'
									}
								]
							},
							{
								title: 'Pagination and Actions',
								key: "clientactions",
								files: [
									{
										url: '/samples/pagination/clientactions/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							}
						]
					},
					{
						key: 'parameters',
						target: 'exploreSamples',
						title: 'Parameters',
						subSamples: [
							{
								title: 'Parameters',
								key: 'parameters',
								files: [
									{
										url: '/samples/parameters/parameters/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
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
										url: '/samples/parameters/arrayParameters/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									},
									{
										url: '/samples/parameters/arrayParameters/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									}
								]
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
								url: '/samples/translation/i18n/i18n.properties',
								name: 'i18n/i18n.properties',
								key: 'i18n/i18n.properties'
							},
							{
								url: '/samples/translation/i18n/i18n_en.properties',
								name: 'i18n/i18n_en.properties',
								key: 'i18n/i18n_en.properties'
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
							}
						]
					},
					{
						key: 'dateAndTime',
						target: 'exploreSamples',
						title: 'Date and Time',
						subSamples: [
							{
								key: 'dateAndTime',
								title: 'Date and Time',
								files: [
									{
										url: '/samples/formatters/dateAndTime/dateTime/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							},
							{
								key: 'date',
								title: 'Date',
								files: [
									{
										url: '/samples/formatters/dateAndTime/date/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json'
									}
								]
							}
						]
					},
					{
						key: 'encodeURIComponent',
						target: 'exploreSamples',
						title: 'EncodeURIComponent',
						files: [
							{
								url: '/samples/formatters/encodeURIComponent/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json'
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
							}
						]
					},
					{
						key: 'initials',
						target: 'exploreSamples',
						title: 'Initials',
						files: [
							{
								url: '/samples/formatters/initials/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json'
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
						key: 'preview',
						target: 'exploreSamples',
						title: 'Preview',
						experimental: true,
						subSamples: [
							{
								title: 'All Modes',
								key: "allModes",
								useIFrame: true,
								isApplication: true,
								files: [
									{
										url: '/samples/preview/allModes/indexTemplate.html',
										name: 'index.html',
										key: 'index.html'
									},
									{
										url: '/samples/preview/allModes/View.view.xml',
										name: 'View.view.xml',
										key: 'View.view.xml'
									},
									{
										url: '/samples/preview/allModes/PreviewMode.controller.js',
										name: 'Controller.controller.js',
										key: 'Controller.controller.js'
									},
									{
										url: '/samples/preview/allModes/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json',
										isApplicationManifest: true
									},
									{
										url: '/samples/preview/allModes/Component.js',
										name: 'Component.js',
										key: 'Component.js'
									},
									{
										url: '/samples/preview/allModes/listCard/manifest.json',
										name: 'listCard/manifest.json',
										key: 'listCard/manifest.json'
									},
									{
										url: '/samples/preview/allModes/listCard/mockData.json',
										name: 'listCard/mockData.json',
										key: 'listCard/mockData.json'
									}
								]
							},
							{
								title: 'Missing Mock Data Configuration',
								key: "missingMockConfiguration",
								useIFrame: true,
								isApplication: true,
								files: [
									{
										url: '/samples/preview/missingMockConfiguration/indexTemplate.html',
										name: 'index.html',
										key: 'index.html'
									},
									{
										url: '/samples/preview/missingMockConfiguration/View.view.xml',
										name: 'View.view.xml',
										key: 'View.view.xml'
									},
									{
										url: '/samples/preview/missingMockConfiguration/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json',
										isApplicationManifest: true
									},
									{
										url: '/samples/preview/missingMockConfiguration/Component.js',
										name: 'Component.js',
										key: 'Component.js'
									},
									{
										url: '/samples/preview/missingMockConfiguration/tableCard/manifest.json',
										name: 'tableCard/manifest.json',
										key: 'tableCard/manifest.json'
									}
								]
							},
							{
								title: 'Component Card',
								key: "component",
								useIFrame: true,
								isApplication: true,
								files: [
									{
										url: '/samples/preview/component/indexTemplate.html',
										name: 'index.html',
										key: 'index.html'
									},
									{
										url: '/samples/preview/component/View.view.xml',
										name: 'View.view.xml',
										key: 'View.view.xml'
									},
									{
										url: '/samples/preview/component/manifest.json',
										name: 'manifest.json',
										key: 'manifest.json',
										isApplicationManifest: true
									},
									{
										url: '/samples/preview/component/Component.js',
										name: 'Component.js',
										key: 'Component.js'
									},
									{
										url: '/samples/preview/component/sampleComponent/manifest.json',
										name: 'sampleComponent/manifest.json',
										key: 'sampleComponent/manifest.json'
									},
									{
										url: '/samples/preview/component/sampleComponent/Component.js',
										name: 'sampleComponent/Component.js',
										key: 'sampleComponent/Component.js'
									},
									{
										url: '/samples/preview/component/sampleComponent/Main.view.xml',
										name: 'sampleComponent/Main.view.xml',
										key: 'sampleComponent/Main.view.xml'
									}
								]
							}
						]
					},
					{
						key: 'configurationChanges',
						target: 'exploreSamples',
						title: 'Configuration Changes',
						useIFrame: true,
						isApplication: true,
						experimental: true,
						files: [
							{
								url: '/samples/configurationChanges/indexTemplate.html',
								name: 'index.html',
								key: 'index.html'
							},
							{
								url: '/samples/configurationChanges/cardManifest.json',
								name: 'cardManifest.json',
								key: 'cardManifest.json'
							},
							{
								url: '/samples/configurationChanges/ConfigurationChanges.view.xml',
								name: 'HostActions.view.xml',
								key: 'HostActions.view.xml'
							},
							{
								url: '/samples/configurationChanges/ConfigurationChanges.controller.js',
								name: 'HostActions.controller.js',
								key: 'HostActions.controller.js'
							},
							{
								url: '/samples/configurationChanges/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json',
								isApplicationManifest: true
							},
							{
								url: '/samples/configurationChanges/Component.js',
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
								key: 'manifest.json',
								isApplicationManifest: true
							},
							{
								url: '/samples/hostContext/Component.js',
								name: 'Component.js',
								key: 'Component.js'
							}
						]
					},
					{
						key: 'design',
						target: 'exploreSamples',
						title: 'Design',
						useIFrame: true,
						isApplication: true,
						experimental: true,
						files: [{
								url: '/samples/design/indexTemplate.html',
								name: 'index.html',
								key: 'index.html'
							},
							{
								url: '/samples/design/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json',
								isApplicationManifest: true
							},
							{
								url: '/samples/design/Design.view.xml',
								name: 'Design.view.xml',
								key: 'Design.view.xml'
							},
							{
								url: '/samples/design/Design.controller.js',
								name: 'Design.controller.js',
								key: 'Design.controller.js'
							},
							{
								url: '/samples/design/objectCardManifest.json',
								name: 'objectManifest.json',
								key: 'objectManifest.json'
							},
							{
								url: '/samples/design/listCardManifest.json',
								name: 'listCardManifest.json',
								key: 'listCardManifest.json'
							},
							{
								url: '/samples/design/Component.js',
								name: 'Component.js',
								key: 'Component.js'
							}
						]
					},
					{
						key: 'blockingMessage',
						target: 'exploreSamples',
						title: 'Blocking Message',
						useIFrame: true,
						isApplication: true,
						experimental: true,
						files: [
							{
								url: '/samples/blockingMessage/index.html',
								name: 'index.html',
								key: 'index.html'
							},
							{
								url: '/samples/blockingMessage/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json'
							},
							{
								url: '/samples/blockingMessage/Main.view.xml',
								name: 'Main.view.xml',
								key: 'Main.view.xml'
							},
							{
								url: '/samples/blockingMessage/Main.controller.js',
								name: 'Main.controller.js',
								key: 'Main.controller.js'
							},
							{
								url: '/samples/blockingMessage/Component.js',
								name: 'Component.js',
								key: 'Component.js'
							},
							{
								url: '/samples/blockingMessage/cards/listCard.json',
								name: 'listCard.json',
								key: 'listCard.json'
							},
							{
								url: '/samples/blockingMessage/cards/listCardEmpty.json',
								name: 'listCardEmpty.json',
								key: 'listCardEmpty.json'
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
				items: [
					{
						key: 'designtimeAdmin',
						target: 'exploreSamples',
						title: 'Administrator Editor',
						editorMode: 'AdminContent',
						files: [
							{
								url: '/samples/designtimeAdmin/dt/Configuration.js',
								name: 'dt/Configuration.js',
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
						key: 'designtimeTranslation',
						target: 'exploreSamples',
						title: 'Translator Editor',
						editorMode: 'Translation',
						files: [
							{
								url: '/samples/designtimeTranslation/dt/Configuration.js',
								name: 'dt/Configuration.js',
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
						key: 'designtimePreview',
						target: 'exploreSamples',
						title: 'Editor Preview Settings',
						subSamples: [
							{
								title: 'Default preview',
								key: 'defaultPreview',
								files: [
									{
										url: '/samples/designtimePreview/dt/Configuration.js',
										name: 'dt/Configuration.js',
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
							},
							{
								title: 'Preview interactive: true',
								key: 'previewInteractiveTrue',
								files: [
									{
										url: '/samples/designtimePreviewInteractive/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									},
									{
										url: '/samples/designtimePreviewInteractive/manifest.json',
										name: 'manifest.json',
										key: 'cardManifest.json'
									},
									{
										url: '/samples/designtimePreviewInteractive/i18n/i18n.properties',
										name: 'i18n/i18n.properties',
										key: 'i18n.properties'
									}
								]
							},
							{
								title: 'Preview position: left',
								key: 'previewPositionLeft',
								previewPosition: 'left',
								files: [
									{
										url: '/samples/designtimePreviewPositionLeft/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									},
									{
										url: '/samples/designtimePreviewPositionLeft/manifest.json',
										name: 'manifest.json',
										key: 'cardManifest.json'
									},
									{
										url: '/samples/designtimePreviewPositionLeft/i18n/i18n.properties',
										name: 'i18n/i18n.properties',
										key: 'i18n.properties'
									}
								]
							},
							{
								title: 'Preview position: right',
								key: 'previewPositionRight',
								previewPosition: 'right',
								files: [
									{
										url: '/samples/designtimePreviewPositionRight/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									},
									{
										url: '/samples/designtimePreviewPositionRight/manifest.json',
										name: 'manifest.json',
										key: 'cardManifest.json'
									},
									{
										url: '/samples/designtimePreviewPositionRight/i18n/i18n.properties',
										name: 'i18n/i18n.properties',
										key: 'i18n.properties'
									}
								]
							},
							{
								title: 'Preview position: top',
								key: 'previewPositionTop',
								previewPosition: 'top',
								files: [
									{
										url: '/samples/designtimePreviewPositionTop/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									},
									{
										url: '/samples/designtimePreviewPositionTop/manifest.json',
										name: 'manifest.json',
										key: 'cardManifest.json'
									},
									{
										url: '/samples/designtimePreviewPositionTop/i18n/i18n.properties',
										name: 'i18n/i18n.properties',
										key: 'i18n.properties'
									}
								]
							},
							{
								title: 'Preview position: bottom',
								key: 'previewPositionBottom',
								previewPosition: 'bottom',
								files: [
									{
										url: '/samples/designtimePreviewPositionBottom/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									},
									{
										url: '/samples/designtimePreviewPositionBottom/manifest.json',
										name: 'manifest.json',
										key: 'cardManifest.json'
									},
									{
										url: '/samples/designtimePreviewPositionBottom/i18n/i18n.properties',
										name: 'i18n/i18n.properties',
										key: 'i18n.properties'
									}
								]
							},
							{
								title: 'Preview position: separate',
								key: 'previewPositionSeparate',
								previewPosition: 'separate',
								files: [
									{
										url: '/samples/designtimePreviewPositionSeparate/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									},
									{
										url: '/samples/designtimePreviewPositionSeparate/manifest.json',
										name: 'manifest.json',
										key: 'cardManifest.json'
									},
									{
										url: '/samples/designtimePreviewPositionSeparate/i18n/i18n.properties',
										name: 'i18n/i18n.properties',
										key: 'i18n.properties'
									}
								]
							}
						]
					},
					{
						title: 'Playground',
						target: 'exploreSamples',
						key: 'playground',
						subSamples: [
							{
								title: 'Fields',
								key: 'designtimeFields',
								files: [
									{
										url: '/samples/designtimeFields/dt/Configuration.js',
										name: 'dt/Configuration.js',
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
								title: 'Formatters',
								key: 'designtimeFormatter',
								files: [
									{
										url: '/samples/designtimeFormatter/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									},
									{
										url: '/samples/designtimeFormatter/manifest.json',
										name: 'manifest.json',
										key: 'cardManifest.json'
									},
									{
										url: '/samples/designtimeFormatter/i18n/i18n.properties',
										name: 'i18n/i18n.properties',
										key: 'i18n.properties'
									}
								]
							},
							{
								title: 'Data Extension',
								key: 'designtimeDataExtension',
								files: [
									{
										url: '/samples/designtimeDataExtension/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									},
									{
										url: '/samples/designtimeDataExtension/manifest.json',
										name: 'manifest.json',
										key: 'cardManifest.json'
									},
									{
										url: '/samples/designtimeDataExtension/i18n/i18n.properties',
										name: 'i18n/i18n.properties',
										key: 'i18n.properties'
									},
									{
										url: '/samples/designtimeDataExtension/DataExtension.js',
										name: 'DataExtension.js',
										key: 'dataExtension.js'
									}
								]
							},
							{
								title: 'Shared Data Extension',
								key: 'designtimeSharedDataExtension',
								files: [
									{
										url: '/samples/designtimeSharedDataExtension/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									},
									{
										url: '/samples/designtimeSharedDataExtension/manifest.json',
										name: 'manifest.json',
										key: 'cardManifest.json'
									},
									{
										url: '/samples/designtimeSharedDataExtension/i18n/i18n.properties',
										name: 'i18n/i18n.properties',
										key: 'i18n.properties'
									},
									{
										url: '/testLib/SharedDataExtension.js',
										name: 'testLib/SharedDataExtension.js',
										key: 'dataExtension.js'
									}
								]
							},
							{
								title: 'Filter',
								key: 'designtimeFilter',
								files: [
									{
										url: '/samples/designtimeFilter/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									},
									{
										url: '/samples/designtimeFilter/manifest.json',
										name: 'manifest.json',
										key: 'cardManifest.json'
									},
									{
										url: '/samples/designtimeFilter/i18n/i18n.properties',
										name: 'i18n/i18n.properties',
										key: 'i18n.properties'
									}
								]
							},
							{
								title: 'Linked Parameters',
								key: 'designtimeLinkedPara',
								files: [
									{
										url: '/samples/designtimeLinkedParameter/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									},
									{
										url: '/samples/designtimeLinkedParameter/manifest.json',
										name: 'manifest.json',
										key: 'cardManifest.json'
									},
									{
										url: '/samples/designtimeLinkedParameter/i18n/i18n.properties',
										name: 'i18n/i18n.properties',
										key: 'i18n.properties'
									}
								]
							},
							{
								title: 'Validation',
								key: 'designtimeValidation',
								files: [
									{
										url: '/samples/designtimeValidation/dt/configuration.js',
										name: 'dt/configuration.js',
										key: 'designtime.js'
									},
									{
										url: '/samples/designtimeValidation/manifest.json',
										name: 'manifest.json',
										key: 'cardManifest.json'
									},
									{
										url: '/samples/designtimeValidation/i18n/i18n.properties',
										name: 'i18n/i18n.properties',
										key: 'i18n.properties'
									}
								]
							},
							{
								title: 'Layout',
								key: 'designtimeLayout',
								files: [
									{
										url: '/samples/designtimeLayout/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									},
									{
										url: '/samples/designtimeLayout/manifest.json',
										name: 'manifest.json',
										key: 'cardManifest.json'
									},
									{
										url: '/samples/designtimeLayout/i18n/i18n.properties',
										name: 'i18n/i18n.properties',
										key: 'i18n.properties'
									}
								]
							},
							/*{
								title: 'Separate Config to JSON',
								key: 'designtimeSepareteConfigToJSON',
								files: [
									{
										url: '/samples/designtimeSepareteConfigToJSON/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									},
									{
										url: '/samples/designtimeSepareteConfigToJSON/manifest.json',
										name: 'manifest.json',
										key: 'cardManifest.json'
									},
									{
										url: '/samples/designtimeSepareteConfigToJSON/i18n/i18n.properties',
										name: 'i18n/i18n.properties',
										key: 'i18n.properties'
									},
									{
										url: '/samples/designtimeSepareteConfigToJSON/DataExtensionImpl.js',
										name: 'DataExtensionImpl.js',
										key: 'DataExtensionImpl.js'
									},
									{
										url: '/samples/designtimeSepareteConfigToJSON/locations.xml',
										name: 'locations.xml',
										key: 'locations.xml'
									},
									{
										url: '/samples/designtimeSepareteConfigToJSON/dt/items1.json',
										name: 'dt/items1.json',
										key: 'items1.json'
									},
									{
										url: '/samples/designtimeSepareteConfigToJSON/dt/items2.json',
										name: 'dt/items2.json',
										key: 'items2.json'
									},
									{
										url: '/samples/designtimeSepareteConfigToJSON/dt/Functions.js',
										name: 'dt/Functions.js',
										key: 'Functions.js'
									}
								]
							},*/
							{
								title: 'Separate Configuration',
								key: 'designtimeSepareteConfigToJS',
								files: [
									{
										url: '/samples/designtimeSepareteConfigToJS/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									},
									{
										url: '/samples/designtimeSepareteConfigToJS/manifest.json',
										name: 'manifest.json',
										key: 'cardManifest.json'
									},
									{
										url: '/samples/designtimeSepareteConfigToJS/i18n/i18n.properties',
										name: 'i18n/i18n.properties',
										key: 'i18n.properties'
									},
									{
										url: '/samples/designtimeSepareteConfigToJS/DataExtensionImpl.js',
										name: 'DataExtensionImpl.js',
										key: 'DataExtensionImpl.js'
									},
									{
										url: '/samples/designtimeSepareteConfigToJS/locations.xml',
										name: 'locations.xml',
										key: 'locations.xml'
									},
									{
										url: '/samples/designtimeSepareteConfigToJS/dt/Items1.js',
										name: 'dt/Items1.js',
										key: 'Items1.js'
									},
									{
										url: '/samples/designtimeSepareteConfigToJS/dt/Items2.js',
										name: 'dt/Items2.js',
										key: 'Items2.js'
									},
									{
										url: '/samples/designtimeSepareteConfigToJS/dt/Functions.js',
										name: 'dt/Functions.js',
										key: 'Functions.js'
									}
								]
							},
							{
								title: 'Custom Field',
								key: 'designtimeCustomField',
								files: [
									{
										url: '/samples/designtimeCustomField/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									},
									{
										url: '/samples/designtimeCustomField/manifest.json',
										name: 'manifest.json',
										key: 'cardManifest.json'
									},
									{
										url: '/samples/designtimeCustomField/i18n/i18n.properties',
										name: 'i18n/i18n.properties',
										key: 'i18n.properties'
									},
									{
										url: '/samples/designtimeCustomField/viz/CustomDateRangeSelection.js',
										name: 'viz/CustomDateRangeSelection.js',
										key: 'CustomDateRangeSelection.js'
									},
									{
										url: '/samples/designtimeCustomField/viz/Input.fragment.xml',
										name: 'viz/Input.fragment.xml',
										key: 'Input.fragment.xml'
									},
									{
										url: '/samples/designtimeCustomField/viz/Input.controller.js',
										name: 'viz/Input.controller.js',
										key: 'Input.controller.js'
									}
								]
							},
							{
								title: 'Destinations',
								key: 'designtimeDestinations',
								files: [
									{
										url: '/samples/designtimeDestinations/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									},
									{
										url: '/samples/designtimeDestinations/manifest.json',
										name: 'manifest.json',
										key: 'cardManifest.json'
									},
									{
										url: '/samples/designtimeDestinations/i18n/i18n.properties',
										name: 'i18n/i18n.properties',
										key: 'i18n.properties'
									}
								]
							},
							{
								title: 'Destinations at top',
								key: 'designtimeDestinationsAtTop',
								files: [
									{
										url: '/samples/designtimeDestinationsAtTop/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									},
									{
										url: '/samples/designtimeDestinationsAtTop/manifest.json',
										name: 'manifest.json',
										key: 'cardManifest.json'
									},
									{
										url: '/samples/designtimeDestinationsAtTop/i18n/i18n.properties',
										name: 'i18n/i18n.properties',
										key: 'i18n.properties'
									}
								]
							},
							{
								title: 'Destinations with sorters and filters',
								key: 'designtimeDestinationsSorterAndFilter',
								files: [
									{
										url: '/samples/designtimeDestinationsSorterAndFilter/dt/Configuration.js',
										name: 'dt/Configuration.js',
										key: 'designtime.js'
									},
									{
										url: '/samples/designtimeDestinationsSorterAndFilter/manifest.json',
										name: 'manifest.json',
										key: 'cardManifest.json'
									},
									{
										url: '/samples/designtimeDestinationsSorterAndFilter/i18n/i18n.properties',
										name: 'i18n/i18n.properties',
										key: 'i18n.properties'
									}
								]
							}
						]
					}
				]
			}
		]
	});
});
