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
                icon: 'sap-icon://activities',
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
                        title: 'Keyboard Shortcuts',
                        target: 'overview',
                        key: 'keyboardShortcut'
                    },
                    {
                        title: 'Fast Navigation',
                        target: 'overview',
                        key: 'fastNavigation'
                    },
                    {
                        title: 'Invisible Content',
                        target: 'overview',
                        key: 'invisibleContent'
                    },
                    {
                        title: 'Colors and Theming',
                        target: 'overview',
                        key: 'colorsTheming'
                    },
                    {
                        title: 'Text Size and Fonts',
                        target: 'overview',
                        key: 'textSizeFonts'
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
                icon: 'sap-icon://activities',
                target: 'overview',
                key: 'controlDeveloper',
                items: [
                    {
                        title: 'Screen reader support',
                        target: 'overview',
                        key: 'screenReader'
                    },
                    {
                        title: 'Keyboard handling support',
                        target: 'overview',
                        key: 'keyboardHandling'
                    }
                ]
			}
		]
	});
});
