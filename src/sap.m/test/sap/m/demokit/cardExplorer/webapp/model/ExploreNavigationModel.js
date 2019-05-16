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
								title: 'General',
								key: 'general',
								manifestUrl: '/samples/list.manifest.json'
							},
							{
								title: 'Highlight',
								key: 'highlight',
								manifestUrl: '/samples/list.highlight.manifest.json'
							},
							{
								title: 'Icon',
								key: 'icon',
								manifestUrl: '/samples/list.icon.manifest.json'
							},
							{
								title: 'Numeric',
								key: 'numeric',
								manifestUrl: '/samples/list.numeric.manifest.json'
							}
						]
					},

					{
						title: 'Analytical',
						target: 'exploreSamples',
						key: 'analytical',
						settings: {
							height: '400px'
						},
						manifestUrl: '/samples/analytical.manifest.json'
					},
					{
						title: 'Object',
						target: 'exploreSamples',
						key: 'object',
						manifestUrl: '/samples/object.manifest.json'
					},
					{
						title: 'Table',
						target: 'exploreSamples',
						key: 'table',
						manifestUrl: '/samples/table.manifest.json'
					},
					{
						title: 'Timeline',
						target: 'exploreSamples',
						key: 'timeline',
						manifestUrl: '/samples/timeline.manifest.json'
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
						title: 'Actions TODO',
						manifestUrl: '/samples/list.manifest.json'
					},
					{
						key: 'data',
						target: 'exploreSamples',
						title: 'Data TODO',
						manifestUrl: '/samples/list.manifest.json'
					}
				]
			}
		]
	});
});
