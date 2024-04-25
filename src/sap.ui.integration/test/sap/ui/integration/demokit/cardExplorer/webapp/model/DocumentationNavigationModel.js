sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";

	// Please order topics alphabetically by "title"
	return new JSONModel({
		selectedKey: 'gettingStarted',
		navigation: [
			{
				title: 'Getting Started',
				icon: 'sap-icon://initiative',
				target: 'learnDetail',
				key: 'gettingStarted'
			},
			{
				title: 'Card Manifest',
				icon: 'sap-icon://syntax',
				target: 'learnDetail',
				key: 'cardManifest'
			},
			{
				title: 'Card Headers',
				icon: 'sap-icon://header',
				target: 'learnDetail',
				key: 'headers',
				items: [
					{
						title: 'Default',
						target: 'learnDetail',
						key: 'default'
					},
					{
						title: 'Numeric',
						target: 'learnDetail',
						key: 'numeric'
					}
				]
			},
			{
				title: 'Declarative Card Types',
				icon: 'sap-icon://SAP-icons-TNT/requirement-diagram',
				target: 'learnDetail',
				key: 'typesDeclarative',
				items: [
					{
						title: 'List',
						target: 'learnDetail',
						key: 'list'
					},
					{
						title: 'Object',
						target: 'learnDetail',
						key: 'object'
					},
					{
						title: 'Table',
						target: 'learnDetail',
						key: 'table'
					},
					{
						title: 'Analytical',
						target: 'learnDetail',
						key: 'analytical'
					},
					{
						title: 'Calendar',
						target: 'learnDetail',
						key: 'calendar'
					},
					{
						title: 'Timeline',
						target: 'learnDetail',
						key: 'timeline'
					}
				]
			},
			{
				title: 'Other Card Types',
				icon: 'sap-icon://SAP-icons-TNT/internal-block-diagram',
				target: 'learnDetail',
				key: 'typesOther',
				items: [
					{
						title: 'Adaptive',
						target: 'learnDetail',
						key: 'adaptive'
					},
					{
						title: 'Component',
						target: 'learnDetail',
						key: 'component'
					},
					{
						title: 'WebPage',
						target: 'learnDetail',
						key: 'webPage',
						experimental: true
					}
				]
			},
			{
				title: 'Card Footer',
				key: 'footer',
				target: 'learnDetail',
				icon: 'sap-icon://SAP-icons-TNT/local-process-call'
			},
			{
				title: 'Card Configuration',
				key: 'configuration',
				target: 'learnDetail',
				icon: 'sap-icon://settings',
				items: [
					{
						title: 'Action Handlers',
						target: 'learnDetail',
						key: 'actionHandlers'
					},
					{
						title: 'No Data Message',
						target: 'learnDetail',
						key: 'customNoDataMessages',
						experimental: true
					},
					{
						title: 'CSRF Tokens',
						target: 'learnDetail',
						key: 'csrfTokens'
					},
					{
						title: 'Destinations',
						target: 'learnDetail',
						key: 'destinations'
					},
					{
						title: 'Help ID',
						target: 'learnDetail',
						key: 'helpId',
						experimental: true
					},
					{
						title: 'Manifest Parameters',
						target: 'learnDetail',
						key: 'manifestParameters'
					}
				]
			},
			{
				title: 'Card Filters',
				key: "filters",
				target: 'learnDetail',
				icon: 'sap-icon://filter',
				items: [
					{
						title: 'ComboBox',
						target: 'learnDetail',
						key: 'comboBox',
						experimental: true
					},
					{
						title: 'DateRange',
						target: 'learnDetail',
						key: 'dateRange',
						experimental: true
					},
					{
						title: 'Search',
						target: 'learnDetail',
						key: 'search'
					},
					{
						title: 'Select',
						target: 'learnDetail',
						key: 'select'
					}
				]
			},
			{
				title: 'Card Features',
				icon: 'sap-icon://activities',
				target: 'learnDetail',
				key: 'features',
				items: [
					{
						title: 'Actions Strip',
						target: 'learnDetail',
						key: 'actionsStrip'
					},
					{
						title: 'Data',
						target: 'learnDetail',
						key: 'data'
					},
					{
						title: 'Date Ranges',
						target: 'learnDetail',
						key: 'dateRanges',
						experimental: true
					},
					{
						title: 'Dynamic Counter',
						target: 'learnDetail',
						key: 'dynamicCounter'
					},
					{
						title: 'Dynamic Parameters',
						target: 'learnDetail',
						key: 'dynamicParameters'
					},
					{
						title: 'Extension',
						target: 'learnDetail',
						key: 'extension'
					},
					{
						title: 'Input Validation',
						target: 'learnDetail',
						key: 'inputValidation',
						experimental: true
					},
					{
						title: 'Micro Charts',
						target: 'learnDetail',
						key: 'microcharts',
						experimental: true
					},
					{
						title: 'OAuth 3LO',
						target: 'learnDetail',
						key: 'oauth3lo',
						experimental: true
					},
					{
						title: 'Pagination',
						target: 'learnDetail',
						key: 'pagination',
						experimental: true
					},
					{
						title: 'Sizing',
						target: 'learnDetail',
						key: 'sizing',
						topicTitle: 'Sizing'
					},
					{
						title: 'Translation',
						target: 'learnDetail',
						key: 'translation'
					}
				]
			},
			{
				title: 'Card Actions',
				icon: 'sap-icon://action',
				target: 'learnDetail',
				key: 'actions',
				items: [
					{
						title: 'Navigation',
						target: 'learnDetail',
						key: 'navigation'
					},
					{
						title: 'Submit',
						target: 'learnDetail',
						key: 'submit'
					},
					{
						title: 'Custom',
						target: 'learnDetail',
						key: 'custom',
						experimental: true
					},
					{
						title: 'ShowCard',
						target: 'learnDetail',
						key: 'showCard',
						experimental: true
					},
					{
						title: 'HideCard',
						target: 'learnDetail',
						key: 'hideCard',
						experimental: true
					}
				]
			},
			{
				title: 'Card Bundle',
				icon: 'sap-icon://attachment-zip-file',
				target: 'learnDetail',
				key: 'bundle',
				items: [
					{
						title: 'Component Preload',
						target: 'learnDetail',
						key: 'componentPreload'
					}
				]
			},
			{
				title: 'Card Formatters',
				icon: 'sap-icon://text-formatting',
				target: 'learnDetail',
				key: 'formatters',
				items: [
					{
						title: 'Currency',
						target: 'learnDetail',
						key: 'currency'
					},
					{
						title: 'Date and Time',
						target: 'learnDetail',
						key: 'dateAndTime'
					},
					{
						title: 'Float',
						target: 'learnDetail',
						key: 'float'
					},
					{
						title: 'Initials',
						target: 'learnDetail',
						key: 'initials'
					},
					{
						title: 'Integer',
						target: 'learnDetail',
						key: 'integer'
					},
					{
						title: 'Percent',
						target: 'learnDetail',
						key: 'percent'
					},
					{
						title: 'Text',
						target: 'learnDetail',
						key: 'text'
					},
					{
						title: 'Unit of Measurement',
						target: 'learnDetail',
						key: 'unit'
					}
				]
			}
		]
	});
});
