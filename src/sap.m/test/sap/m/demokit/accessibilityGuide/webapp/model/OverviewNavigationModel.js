sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";

	return new JSONModel({
		selectedKey: "overview",
		navigation: [
			{
				title: "Introduction",
				icon: "sap-icon://home",
				target: "overview",
				key: "introduction"
			},
			{
				title: 'Application Developer',
				icon: 'sap-icon://SAP-icons-TNT/application',
				target: 'overview',
				key: 'applicationDeveloper',
				items: [
					{
						title: 'Labeling and Description',
						target: 'overview',
						key: 'labeling'
					},
					{
						title: 'Landmark API',
						target: 'overview',
						key: 'landmark'
					},
					{
						title: 'Focus Handling',
						target: 'overview',
						key: 'focusHandling'
					},
					{
						title: 'Invisible Content',
						target: 'overview',
						key: 'invisibleContent'
					},
					{
						title: 'Empty Display Control Readings',
						target: 'overview',
						key: 'emptyDisplayControlReadings'
					},
					{
						title: 'Message Handling',
						target: 'overview',
						key: 'messageHandling'
					}
				]
			},
			{
				title: 'Control Developer',
				icon: 'sap-icon://SAP-icons-TNT/parts',
				target: 'overview',
				key: 'controlDeveloper',
				items: [
					{
						title: 'Screen-Reader Support',
						target: 'overview',
						key: 'screenReader'
					},
					{
						title: 'Keyboard-Handling Support',
						target: 'overview',
						key: 'keyboardHandling'
					}
				]
			}
		]
	});
});
