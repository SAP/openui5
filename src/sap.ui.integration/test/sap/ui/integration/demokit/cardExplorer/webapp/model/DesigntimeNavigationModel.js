sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";

	return new JSONModel({
		selectedKey: 'overview',
		navigation: [
			{
				title: 'Overview',
				icon: 'sap-icon://home',
				target: 'designtime',
				key: 'overview'
			},
			{
				title: 'Create a Configuration',
				icon: 'sap-icon://create-form',
				target: 'designtime',
				key: 'create'
			},
			{
				title: 'Configurations and API',
				icon: 'sap-icon://header',
				target: 'designtime',
				key: 'api',
				items: [
					{
						title: 'Fields and Layouts',
						target: 'designtime',
						key: 'fieldslayout'
					},
					{
						title: 'Preview',
						target: 'designtime',
						key: 'preview'
					}
				]
			},
			{
				title: 'Host Configuration Capabilities',
				icon: 'sap-icon://bbyd-dashboard',
				target: 'designtime',
				key: 'hostCapabilities'
			},
			{
				title: 'Playground',
				icon: 'sap-icon://popup-window',
				target: 'designtime',
				key: 'playground'
			}/*,
			{
				title: 'Advanced',
				icon: 'sap-icon://create-form',
				target: 'designtime',
				key: 'advanced',
				items: [
					{
						title: 'Separate the Configuration',
						target: 'designtime',
						key: 'separate'
					},
					{
						title: 'Custom the Field',
						target: 'designtime',
						key: 'customField'
					}
				]
			}*/
		]
	});
});