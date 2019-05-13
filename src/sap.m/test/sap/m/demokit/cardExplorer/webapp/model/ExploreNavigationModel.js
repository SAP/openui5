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
				items: [
					{
						title: 'List',
						target: 'exploreSamples',
						key: 'sample.list.manifestUrl',
						manifestUrl: '/samples/list.manifest.json'
					},
					{
						title: 'List highlight',
						target: 'exploreSamples',
						key: 'sample.list.highlight',
						manifestUrl: '/samples/list.highlight.manifest.json'
					},
					{
						title: 'List icon',
						target: 'exploreSamples',
						key: 'sample.list.icon',
						manifestUrl: '/samples/list.icon.manifest.json'
					},
					{
						title: 'List numeric',
						target: 'exploreSamples',
						key: 'sample.list.numeric',
						manifestUrl: '/samples/list.numeric.manifest.json'
					},
					{
						title: 'Analytical',
						target: 'exploreSamples',
						key: 'sample.analytical',
						manifestUrl: '/samples/analytical.manifest.json'
					},
					{
						title: 'Object',
						target: 'exploreSamples',
						key: 'sample.object',
						manifestUrl: '/samples/object.manifest.json'
					},
					{
						title: 'Table',
						target: 'exploreSamples',
						key: 'sample.table',
						manifestUrl: '/samples/table.manifest.json'
					},
					{
						title: 'Timeline',
						target: 'exploreSamples',
						key: 'sample.timeline',
						manifestUrl: '/samples/timeline.manifest.json'
					}
				]
			},
			{
				key: 'features',
				target: 'exploreSamples',
				title: 'Features',
				icon: 'sap-icon://activities',
				items: [
					{
						key: 'sample.actions',
						target: 'exploreSamples',
						title: 'Actions TODO',
						manifestUrl: '/samples/list.manifest.json'
					},
					{
						key: 'sample.data',
						target: 'exploreSamples',
						title: 'Data TODO',
						manifestUrl: '/samples/list.manifest.json'
					}
				]
			}
		]
	});
});
