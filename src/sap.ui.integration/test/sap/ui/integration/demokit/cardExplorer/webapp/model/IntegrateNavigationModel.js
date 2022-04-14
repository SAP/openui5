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
				target: 'integrate',
				key: 'overview'
			},
			{
				title: 'Use Cards in Apps',
				icon: 'sap-icon://initiative',
				target: 'integrate',
				key: 'usage'
			},
			{
				title: 'Card API',
				icon: 'sap-icon://header',
				target: 'integrate',
				key: 'api'
			},
			{
				title: 'Handle Actions',
				icon: 'sap-icon://SAP-icons-TNT/aggregator',
				target: 'integrate',
				key: 'handleActions'
			},
			{
				title: 'Layouts',
				icon: 'sap-icon://SAP-icons-TNT/auto-layout',
				target: 'integrate',
				key: 'layouts'
			},
			{
				title: 'Caching (Experimental)',
				icon: 'sap-icon://past',
				target: 'integrate',
				key: 'caching'
			},
			{
				title: 'Destinations',
				icon: 'sap-icon://connected',
				target: 'integrate',
				key: 'destinations'
			},
			{
				title: 'CSRF Tokens',
				icon: 'sap-icon://validate',
				target: 'integrate',
				key: 'csrfTokens',
				experimental: true
			},
			{
				title: 'Host Actions',
				icon: 'sap-icon://overflow',
				target: 'integrate',
				key: 'hostActions'
			},
			{
				title: 'Text Badge',
				icon: 'sap-icon://badge',
				target: 'integrate',
				key: 'badge'
			},
			{
				title: 'Troubleshooting',
				icon: 'sap-icon://wrench',
				target: 'integrate',
				key: 'troubleshooting'
			}
		]
	});
});