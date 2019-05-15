sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";

	return new JSONModel({
		selectedKey: 'learnGettingStarted',
		navigation: [
			{
				title: 'Types',
				icon: 'sap-icon://card',
				key: 'types',
				target: 'exploreSamples',
				targetKey: 'list',
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
								title: 'General',
								key: 'general',
								manifestUrl: '/samples/list/general.json'
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
									width: 'auto'
								},
								manifestUrl: '/samples/list/quickLinks.json'
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
									height: '464px'
								},
								manifestUrl: '/samples/analytical/line.json'
							},
							{
								title: 'Stacked Column',
								key: 'stackedColumn',
								settings: {
									height: '464px'
								},
								manifestUrl: '/samples/analytical/stackedColumn.json'
							},
							{
								title: 'Donut',
								key: 'donut',
								settings: {
									width: '272px',
									height: '272px'
								},
								manifestUrl: '/samples/analytical/donut.json'
							}
						]
					},
					{
						title: 'Object',
						target: 'exploreSamples',
						key: 'object',
						manifestUrl: '/samples/object.json'
					},
					{
						title: 'Table',
						target: 'exploreSamples',
						key: 'table',
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
									width: '272px'
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
				key: 'features',
				target: 'exploreSamples',
				targetKey: 'actions',
				title: 'Features',
				icon: 'sap-icon://activities',
				hasExpander: false,
				items: [
					{
						key: 'actions',
						target: 'exploreSamples',
						title: 'Actions',
						settings: {
							width: 'auto'
						},
						manifestUrl: '/samples/actions.json'
					},
					{
						key: 'data',
						target: 'exploreSamples',
						title: 'Data TODO',
						manifestUrl: '/samples/table.json'
					},
					{
						key: 'parameters',
						target: 'exploreSamples',
						title: 'Parameters',
						manifestUrl: '/samples/parameters.json'
					}
				]
			}
		]
	});
});
