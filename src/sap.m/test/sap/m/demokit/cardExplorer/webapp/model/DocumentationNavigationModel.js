sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";

	return new JSONModel({
		selectedKey: 'learnGettingStarted',
		navigation: [
			{
				title: 'Getting Started',
				key: 'learnGettingStarted'
			},
			{
				title: 'Authoring Cards',
				icon: 'sap-icon://card',
				key: 'learnAuthoringCards',
				items: [
					{
						title: 'Card schemas',
						key: 'learnCardSchemas'
					},
					{
						title: 'Card types',
						key: 'learnCardTypes'
					},
					{
						title: 'Card Features',
						key: 'learnCardFeatures'
					}
				]
			}
		]
	});
});