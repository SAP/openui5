sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";

	return new JSONModel({
		selectedKey: 'overview',
		navigation: [
			{
				title: 'Overview',
				topicTitle: 'Integration Card Overview',
				icon: 'sap-icon://home',
				target: 'integrate',
				key: 'overview'
			},
			{
				title: 'Use Cards in Apps',
				topicTitle: 'Integration Card Getting Started',
				icon: 'sap-icon://initiative',
				target: 'integrate',
				key: 'usage'
			},
			{
				title: 'API',
				icon: 'sap-icon://header',
				target: 'integrate',
				key: 'api'
			}
		]
	});
});