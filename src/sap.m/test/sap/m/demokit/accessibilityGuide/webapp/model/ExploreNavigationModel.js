sap.ui.define([
	'sap/ui/model/json/JSONModel'
], function (JSONModel) {
	'use strict';

	// Please order topics alphabetically by "title"
	return new JSONModel({
		selectedKey: 'learnGettingStarted',
		navigation: [
			{
				title: 'Landmark API',
				icon: 'sap-icon://puzzle',
				key: 'landmark',
				target: 'exploreOverview',
				hasExpander: false,
				items: [
					{
						key: 'dynamicPage',
						target: 'exploreSamples',
						title: 'Dynamic Page',
						useIFrame: true,
						isApplication: true,
						files: [
							{
								url: '/samples/dynamicPage/View.view.xml',
								name: 'View.view.xml',
								key: 'View.view.xml'
							},
							{
								url: '/samples/dynamicPage/index.html',
								name: 'index.html',
								key: 'index.html'
							},
							{
								url: '/samples/dynamicPage/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json',
								isApplicationManifest: true
							},
							{
								url: '/samples/dynamicPage/Component.js',
								name: 'Component.js',
								key: 'Component.js'
							},
							{
								url: '/samples/dynamicPage/Controller.controller.js',
								name: 'Controller.controller.js',
								key: 'Controller.controller.js'
							}
						]
					},
                    {
                        key: 'page',
                        target: 'exploreSamples',
                        title: 'Page',
                        useIFrame: true,
                        isApplication: true,
                        files: [
                            {
                                url: '/samples/page/View.view.xml',
                                name: 'View.view.xml',
                                key: 'View.view.xml'
                            },
                            {
                                url: '/samples/page/index.html',
                                name: 'index.html',
                                key: 'index.html'
                            },
                            {
                                url: '/samples/page/manifest.json',
                                name: 'manifest.json',
                                key: 'manifest.json',
                                isApplicationManifest: true
                            },
                            {
                                url: '/samples/page/Component.js',
                                name: 'Component.js',
                                key: 'Component.js'
                            },
                            {
                                url: '/samples/page/Controller.controller.js',
                                name: 'Controller.controller.js',
                                key: 'Controller.controller.js'
                            }
                        ]
                    },
                    {
                        key: 'panel',
                        target: 'exploreSamples',
                        title: 'Panel',
                        useIFrame: true,
                        isApplication: true,
                        files: [
                            {
                                url: '/samples/panel/View.view.xml',
                                name: 'View.view.xml',
                                key: 'View.view.xml'
                            },
                            {
                                url: '/samples/panel/index.html',
                                name: 'index.html',
                                key: 'index.html'
                            },
                            {
                                url: '/samples/panel/manifest.json',
                                name: 'manifest.json',
                                key: 'manifest.json',
                                isApplicationManifest: true
                            },
                            {
                                url: '/samples/panel/Component.js',
                                name: 'Component.js',
                                key: 'Component.js'
                            }
                        ]
                    },
                    {
                        key: 'objectPage',
                        target: 'exploreSamples',
                        title: 'Object Page',
                        useIFrame: true,
                        isApplication: true,
                        files: [
                            {
                                url: '/samples/objectPage/View.view.xml',
                                name: 'View.view.xml',
                                key: 'View.view.xml'
                            },
                            {
                                url: '/samples/objectPage/index.html',
                                name: 'index.html',
                                key: 'index.html'
                            },
                            {
                                url: '/samples/objectPage/manifest.json',
                                name: 'manifest.json',
                                key: 'manifest.json',
                                isApplicationManifest: true
                            },
                            {
                                url: '/samples/objectPage/Component.js',
                                name: 'Component.js',
                                key: 'Component.js'
                            }
                        ]
                    }
				]
			},
			{
				title: 'Labeling and Description',
				icon: 'sap-icon://tag',
				key: 'labeling',
				target: 'exploreOverview',
				hasExpander: false,
				items: [
                    {
                        key: 'select',
                        target: 'exploreSamples',
                        title: 'Select',
                        useIFrame: true,
                        isApplication: true,
                        files: [
                            {
                                url: '/samples/select/Controller.controller.js',
                                name: 'Controller.controller.js',
                                key: 'Controller.controller.js'
                            },
                            {
                                url: '/samples/select/View.view.xml',
                                name: 'View.view.xml',
                                key: 'View.view.xml'
                            },
                            {
                                url: '/samples/select/index.html',
                                name: 'index.html',
                                key: 'index.html'
                            },
                            {
                                url: '/samples/select/manifest.json',
                                name: 'manifest.json',
                                key: 'manifest.json',
                                isApplicationManifest: true
                            },
                            {
                                url: '/samples/select/Component.js',
                                name: 'Component.js',
                                key: 'Component.js'
                            }
                        ]
                    },
                    {
                        key: 'dialog',
                        target: 'exploreSamples',
                        title: 'Dialog',
                        useIFrame: true,
                        isApplication: true,
                        files: [
                            {
                                url: '/samples/dialog/Controller.controller.js',
                                name: 'Controller.controller.js',
                                key: 'Controller.controller.js'
                            },
                            {
                                url: '/samples/dialog/View.view.xml',
                                name: 'View.view.xml',
                                key: 'View.view.xml'
                            },
                            {
                                url: '/samples/dialog/index.html',
                                name: 'index.html',
                                key: 'index.html'
                            },
                            {
                                url: '/samples/dialog/i18n.properties',
                                name: 'i18n.properties',
                                key: 'i18n.properties'
                            },
                            {
                                url: '/samples/dialog/manifest.json',
                                name: 'manifest.json',
                                key: 'manifest.json',
                                isApplicationManifest: true
                            },
                            {
                                url: '/samples/dialog/Component.js',
                                name: 'Component.js',
                                key: 'Component.js'
                            }
                        ]
                    },
					{
						key: 'simpleForm',
						target: 'exploreSamples',
						title: 'Simple Form',
						useIFrame: true,
						isApplication: true,
						files: [
							{
								url: '/samples/simpleForm/View.view.xml',
								name: 'View.view.xml',
								key: 'View.view.xml'
							},
							{
								url: '/samples/simpleForm/index.html',
								name: 'index.html',
								key: 'index.html'
							},
							{
								url: '/samples/simpleForm/i18n.properties',
								name: 'i18n.properties',
								key: 'i18n.properties'
							},
							{
								url: '/samples/simpleForm/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json',
								isApplicationManifest: true
							},
							{
								url: '/samples/simpleForm/Component.js',
								name: 'Component.js',
								key: 'Component.js'
							},
							{
								url: '/samples/simpleForm/Controller.controller.js',
								name: 'Controller.controller.js',
								key: 'Controller.controller.js'
							}
						]
					},
					{
						key: 'inputs',
						target: 'exploreSamples',
						title: 'User Inputs',
						useIFrame: true,
						isApplication: true,
						files: [
							{
								url: '/samples/inputs/View.view.xml',
								name: 'View.view.xml',
								key: 'View.view.xml'
							},
							{
								url: '/samples/inputs/index.html',
								name: 'index.html',
								key: 'index.html'
							},
							{
								url: '/samples/inputs/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json',
								isApplicationManifest: true
							},
							{
								url: '/samples/inputs/Component.js',
								name: 'Component.js',
								key: 'Component.js'
							},
							{
								url: '/samples/inputs/Controller.controller.js',
								name: 'Controller.controller.js',
								key: 'Controller.controller.js'
							}
						]
					},
					{
						key: 'inputsDescription',
						target: 'exploreSamples',
						title: 'Input with description',
						useIFrame: true,
						isApplication: true,
						files: [
							{
								url: '/samples/inputsDescription/View.view.xml',
								name: 'View.view.xml',
								key: 'View.view.xml'
							},
							{
								url: '/samples/inputsDescription/index.html',
								name: 'index.html',
								key: 'index.html'
							},
							{
								url: '/samples/inputsDescription/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json',
								isApplicationManifest: true
							},
							{
								url: '/samples/inputsDescription/Component.js',
								name: 'Component.js',
								key: 'Component.js'
							}
						]
					},
					{
						key: 'popover',
						target: 'exploreSamples',
						title: 'Popover',
						useIFrame: true,
						isApplication: true,
						files: [
							{
								url: '/samples/popover/View.view.xml',
								name: 'View.view.xml',
								key: 'View.view.xml'
							},
							{
								url: '/samples/popover/index.html',
								name: 'index.html',
								key: 'index.html'
							},
							{
								url: '/samples/popover/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json',
								isApplicationManifest: true
							},
							{
								url: '/samples/popover/Component.js',
								name: 'Component.js',
								key: 'Component.js'
							},
							{
								url: '/samples/popover/Controller.controller.js',
								name: 'Controller.controller.js',
								key: 'Controller.controller.js'
							}
						]
					},
					{
						key: 'popoverDescribedby',
						target: 'exploreSamples',
						title: 'Popover with description',
						useIFrame: true,
						isApplication: true,
						files: [
							{
								url: '/samples/popoverDescribedby/View.view.xml',
								name: 'View.view.xml',
								key: 'View.view.xml'
							},
							{
								url: '/samples/popoverDescribedby/index.html',
								name: 'index.html',
								key: 'index.html'
							},
							{
								url: '/samples/popoverDescribedby/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json',
								isApplicationManifest: true
							},
							{
								url: '/samples/popoverDescribedby/Component.js',
								name: 'Component.js',
								key: 'Component.js'
							},
							{
								url: '/samples/popoverDescribedby/Controller.controller.js',
								name: 'Controller.controller.js',
								key: 'Controller.controller.js'
							}
						]
					},
                    {
                        key: 'tooltipsText',
                        target: 'exploreSamples',
                        title: 'Tooltips and Alternative text',
                        useIFrame: true,
                        isApplication: true,
                        files: [
                            {
                                url: '/samples/tooltipsText/View.view.xml',
                                name: 'View.view.xml',
                                key: 'View.view.xml'
                            },
                            {
                                url: '/samples/tooltipsText/index.html',
                                name: 'index.html',
                                key: 'index.html'
                            },
                            {
                                url: '/samples/tooltipsText/i18n.properties',
                                name: 'i18n.properties',
                                key: 'i18n.properties'
                            },
                            {
                                url: '/samples/tooltipsText/manifest.json',
                                name: 'manifest.json',
                                key: 'manifest.json',
                                isApplicationManifest: true
                            },
                            {
                                url: '/samples/tooltipsText/Component.js',
                                name: 'Component.js',
                                key: 'Component.js'
                            },
                            {
                                url: '/samples/tooltipsText/Controller.controller.js',
                                name: 'Controller.controller.js',
                                key: 'Controller.controller.js'
                            }
                        ]
                    },
                    {
                        key: 'iconOnlyButtons',
                        target: 'exploreSamples',
                        title: 'Icon only buttons',
                        useIFrame: true,
                        isApplication: true,
                        files: [
                            {
                                url: '/samples/iconOnlyButtons/View.view.xml',
                                name: 'View.view.xml',
                                key: 'View.view.xml'
                            },
                            {
                                url: '/samples/iconOnlyButtons/index.html',
                                name: 'index.html',
                                key: 'index.html'
                            },
                            {
                                url: '/samples/iconOnlyButtons/i18n.properties',
                                name: 'i18n.properties',
                                key: 'i18n.properties'
                            },
                            {
                                url: '/samples/iconOnlyButtons/manifest.json',
                                name: 'manifest.json',
                                key: 'manifest.json',
                                isApplicationManifest: true
                            },
                            {
                                url: '/samples/iconOnlyButtons/Component.js',
                                name: 'Component.js',
                                key: 'Component.js'
                            },
                            {
                                url: '/samples/iconOnlyButtons/Controller.controller.js',
                                name: 'Controller.controller.js',
                                key: 'Controller.controller.js'
                            }
                        ]
                    },
                    {
                        key: 'nonDecorativeImages',
                        target: 'exploreSamples',
                        title: 'Non-decorative images',
                        useIFrame: true,
                        isApplication: true,
                        files: [
                            {
                                url: '/samples/nonDecorativeImages/Controller.controller.js',
                                name: 'Controller.controller.js',
                                key: 'Controller.controller.js'
                            },
                            {
                                url: '/samples/nonDecorativeImages/View.view.xml',
                                name: 'View.view.xml',
                                key: 'View.view.xml'
                            },
                            {
                                url: '/samples/nonDecorativeImages/images/HT-6120-large.jpg',
                                name: 'images/HT-6120-large.jpg',
                                key: 'HT-6120-large.jpg'
                            },
                            {
                                url: '/samples/nonDecorativeImages/images/HT-7777-large.jpg',
                                name: 'images/HT-7777-large.jpg',
                                key: 'HT-7777-large.jpg'
                            },
                            {
                                url: '/samples/nonDecorativeImages/img.json',
                                name: 'img.json',
                                key: 'img.json'
                            },
                            {
                                url: '/samples/nonDecorativeImages/index.html',
                                name: 'index.html',
                                key: 'index.html'
                            },
                            {
                                url: '/samples/nonDecorativeImages/manifest.json',
                                name: 'manifest.json',
                                key: 'manifest.json',
                                isApplicationManifest: true
                            },
                            {
                                url: '/samples/nonDecorativeImages/Component.js',
                                name: 'Component.js',
                                key: 'Component.js'
                            }
                        ]
                    }
				]
			},
            {
                title: 'Focus handling',
                icon: 'sap-icon://tag',
                key: 'focusHandling',
                target: 'exploreOverview',
                hasExpander: false,
                items: [
                    {
                        key: 'dialogInitialFocus',
                        target: 'exploreSamples',
                        title: 'Dialog initial focus position',
                        useIFrame: true,
                        isApplication: true,
                        files: [
                            {
                                url: '/samples/dialogInitialFocus/Controller.controller.js',
                                name: 'Controller.controller.js',
                                key: 'Controller.controller.js'
                            },
                            {
                                url: '/samples/dialogInitialFocus/View.view.xml',
                                name: 'View.view.xml',
                                key: 'View.view.xml'
                            },
                            {
                                url: '/samples/dialogInitialFocus/index.html',
                                name: 'index.html',
                                key: 'index.html'
                            },
                            {
                                url: '/samples/dialogInitialFocus/i18n.properties',
                                name: 'i18n.properties',
                                key: 'i18n.properties'
                            },
                            {
                                url: '/samples/dialogInitialFocus/manifest.json',
                                name: 'manifest.json',
                                key: 'manifest.json',
                                isApplicationManifest: true
                            },
                            {
                                url: '/samples/dialogInitialFocus/Component.js',
                                name: 'Component.js',
                                key: 'Component.js'
                            }
                        ]
                    },
                    {
                        key: 'popoverInitialFocus',
                        target: 'exploreSamples',
                        title: 'Popover initial focus position',
                        useIFrame: true,
                        isApplication: true,
                        files: [
                            {
                                url: '/samples/popoverInitialFocus/Controller.controller.js',
                                name: 'Controller.controller.js',
                                key: 'Controller.controller.js'
                            },
                            {
                                url: '/samples/popoverInitialFocus/View.view.xml',
                                name: 'View.view.xml',
                                key: 'View.view.xml'
                            },
                            {
                                url: '/samples/popoverInitialFocus/index.html',
                                name: 'index.html',
                                key: 'index.html'
                            },
                            {
                                url: '/samples/popoverInitialFocus/manifest.json',
                                name: 'manifest.json',
                                key: 'manifest.json',
                                isApplicationManifest: true
                            },
                            {
                                url: '/samples/popoverInitialFocus/Component.js',
                                name: 'Component.js',
                                key: 'Component.js'
                            }
                        ]
                    },
                    {
                        key: 'toolbarActive',
                        target: 'exploreSamples',
                        title: 'Active Toolbar',
                        useIFrame: true,
                        isApplication: true,
                        files: [
                            {
                                url: '/samples/toolbarActive/Controller.controller.js',
                                name: 'Controller.controller.js',
                                key: 'Controller.controller.js'
                            },
                            {
                                url: '/samples/toolbarActive/View.view.xml',
                                name: 'View.view.xml',
                                key: 'View.view.xml'
                            },
                            {
                                url: '/samples/toolbarActive/index.html',
                                name: 'index.html',
                                key: 'index.html'
                            },
                            {
                                url: '/samples/toolbarActive/manifest.json',
                                name: 'manifest.json',
                                key: 'manifest.json',
                                isApplicationManifest: true
                            },
                            {
                                url: '/samples/toolbarActive/Component.js',
                                name: 'Component.js',
                                key: 'Component.js'
                            }
                        ]
                    }
                ]
            },
            {
                title: 'Keyboard Shortcuts',
                icon: 'sap-icon://tag',
                key: 'keyboardShortcuts',
                target: 'exploreOverview',
                hasExpander: false,
                items: [
                    {
                        key: 'buttonShortcut',
                        target: 'exploreSamples',
                        title: 'Button with Shortcut',
                        useIFrame: true,
                        isApplication: true,
                        files: [
                            {
                                url: '/samples/buttonShortcut/Controller.controller.js',
                                name: 'Controller.controller.js',
                                key: 'Controller.controller.js'
                            },
                            {
                                url: '/samples/buttonShortcut/View.view.xml',
                                name: 'View.view.xml',
                                key: 'View.view.xml'
                            },
                            {
                                url: '/samples/buttonShortcut/index.html',
                                name: 'index.html',
                                key: 'index.html'
                            },
                            {
                                url: '/samples/buttonShortcut/i18n.properties',
                                name: 'i18n.properties',
                                key: 'i18n.properties'
                            },
                            {
                                url: '/samples/buttonShortcut/manifest.json',
                                name: 'manifest.json',
                                key: 'manifest.json',
                                isApplicationManifest: true
                            },
                            {
                                url: '/samples/buttonShortcut/Component.js',
                                name: 'Component.js',
                                key: 'Component.js'
                            }
                        ]
                    },
                    {
                        key: 'tableShortcuts',
                        target: 'exploreSamples',
                        title: 'Table with Shortcuts',
                        useIFrame: true,
                        isApplication: true,
                        files: [
                            {
                                url: '/samples/tableShortcuts/Controller.controller.js',
                                name: 'Controller.controller.js',
                                key: 'Controller.controller.js'
                            },
                            {
                                url: '/samples/tableShortcuts/View.view.xml',
                                name: 'View.view.xml',
                                key: 'View.view.xml'
                            },
                            {
                                url: '/samples/tableShortcuts/index.html',
                                name: 'index.html',
                                key: 'index.html'
                            },
                            {
                                url: '/samples/tableShortcuts/i18n.properties',
                                name: 'i18n.properties',
                                key: 'i18n.properties'
                            },
                            {
                                url: '/samples/tableShortcuts/manifest.json',
                                name: 'manifest.json',
                                key: 'manifest.json',
                                isApplicationManifest: true
                            },
                            {
                                url: '/samples/tableShortcuts/Component.js',
                                name: 'Component.js',
                                key: 'Component.js'
                            }
                        ]
                    }
                ]
            },
            {
                title: 'Fast Navigation',
                icon: 'sap-icon://tag',
                key: 'fastNavigation',
                target: 'exploreOverview',
                hasExpander: false,
                items: [
                    {
                        key: 'f6',
                        target: 'exploreSamples',
                        title: 'F6',
                        useIFrame: true,
                        isApplication: true,
                        files: [
                            {
                                url: '/samples/f6/Controller.controller.js',
                                name: 'Controller.controller.js',
                                key: 'Controller.controller.js'
                            },
                            {
                                url: '/samples/f6/View.view.xml',
                                name: 'View.view.xml',
                                key: 'View.view.xml'
                            },
                            {
                                url: '/samples/f6/index.html',
                                name: 'index.html',
                                key: 'index.html'
                            },
                            {
                                url: '/samples/f6/i18n.properties',
                                name: 'i18n.properties',
                                key: 'i18n.properties'
                            },
                            {
                                url: '/samples/f6/manifest.json',
                                name: 'manifest.json',
                                key: 'manifest.json',
                                isApplicationManifest: true
                            },
                            {
                                url: '/samples/f6/Component.js',
                                name: 'Component.js',
                                key: 'Component.js'
                            }
                        ]
                    }
                ]
            },
            {
                title: 'Invisible Content',
                icon: 'sap-icon://tag',
                key: 'invisibleContent',
                target: 'exploreOverview',
                hasExpander: false,
                items: [
                    {
                        key: 'invisibleMessaging',
                        target: 'exploreSamples',
                        title: 'Invisible Messaging',
                        useIFrame: true,
                        isApplication: true,
                        files: [
                            {
                                url: '/samples/invisibleMessaging/Controller.controller.js',
                                name: 'Controller.controller.js',
                                key: 'Controller.controller.js'
                            },
                            {
                                url: '/samples/invisibleMessaging/View.view.xml',
                                name: 'View.view.xml',
                                key: 'View.view.xml'
                            },
                            {
                                url: '/samples/invisibleMessaging/index.html',
                                name: 'index.html',
                                key: 'index.html'
                            },
                            {
                                url: '/samples/invisibleMessaging/manifest.json',
                                name: 'manifest.json',
                                key: 'manifest.json',
                                isApplicationManifest: true
                            },
                            {
                                url: '/samples/invisibleMessaging/Component.js',
                                name: 'Component.js',
                                key: 'Component.js'
                            }
                        ]
                    },
                    {
                        key: 'invisibleText',
                        target: 'exploreSamples',
                        title: 'Invisible Text',
                        useIFrame: true,
                        isApplication: true,
                        files: [
                            {
                                url: '/samples/invisibleText/View.view.xml',
                                name: 'View.view.xml',
                                key: 'View.view.xml'
                            },
                            {
                                url: '/samples/invisibleText/index.html',
                                name: 'index.html',
                                key: 'index.html'
                            },
                            {
                                url: '/samples/invisibleText/manifest.json',
                                name: 'manifest.json',
                                key: 'manifest.json',
                                isApplicationManifest: true
                            },
                            {
                                url: '/samples/invisibleText/Component.js',
                                name: 'Component.js',
                                key: 'Component.js'
                            }
                        ]
                    }
                ]
            },
            {
                title: 'Colors and Theming',
                icon: 'sap-icon://tag',
                key: 'colorsTheming',
                target: 'exploreOverview',
                hasExpander: false,
                items: [
                    {
                        key: 'customCss',
                        target: 'exploreSamples',
                        title: 'Custom CSS',
                        useIFrame: true,
                        isApplication: true,
                        files: [
                            {
                                url: '/samples/invisibleMessaging/Controller.controller.js',
                                name: 'Controller.controller.js',
                                key: 'Controller.controller.js'
                            },
                            {
                                url: '/samples/invisibleMessaging/View.view.xml',
                                name: 'View.view.xml',
                                key: 'View.view.xml'
                            },
                            {
                                url: '/samples/invisibleMessaging/index.html',
                                name: 'index.html',
                                key: 'index.html'
                            },
                            {
                                url: '/samples/invisibleMessaging/i18n.properties',
                                name: 'i18n.properties',
                                key: 'i18n.properties'
                            },
                            {
                                url: '/samples/invisibleMessaging/manifest.json',
                                name: 'manifest.json',
                                key: 'manifest.json',
                                isApplicationManifest: true
                            },
                            {
                                url: '/samples/invisibleMessaging/Component.js',
                                name: 'Component.js',
                                key: 'Component.js'
                            }
                        ]
                    }
                ]
            },
            {
                title: 'Text Size and Fonts',
                icon: 'sap-icon://tag',
                key: 'textFonts',
                target: 'exploreOverview',
                hasExpander: false,
                items: [
                    {
                        key: 'textSizes',
                        target: 'exploreSamples',
                        title: 'Text Sizes',
                        useIFrame: true,
                        isApplication: true,
                        files: [
                            {
                                url: '/samples/textSizes/Controller.controller.js',
                                name: 'Controller.controller.js',
                                key: 'Controller.controller.js'
                            },
                            {
                                url: '/samples/textSizes/View.view.xml',
                                name: 'View.view.xml',
                                key: 'View.view.xml'
                            },
                            {
                                url: '/samples/textSizes/index.html',
                                name: 'index.html',
                                key: 'index.html'
                            },
                            {
                                url: '/samples/textSizes/i18n.properties',
                                name: 'i18n.properties',
                                key: 'i18n.properties'
                            },
                            {
                                url: '/samples/textSizes/manifest.json',
                                name: 'manifest.json',
                                key: 'manifest.json',
                                isApplicationManifest: true
                            },
                            {
                                url: '/samples/textSizes/Component.js',
                                name: 'Component.js',
                                key: 'Component.js'
                            }
                        ]
                    }
                ]
            },
            {
                title: 'Message Handling',
                icon: 'sap-icon://tag',
                key: 'messageHandling',
                target: 'exploreOverview',
                hasExpander: false,
                items: [
                    {
                        key: 'messageHandlingConcept',
                        target: 'exploreSamples',
                        title: 'Message Handling Concept',
                        useIFrame: true,
                        isApplication: true,
                        files: [
                            {
                                url: '/samples/messageHandlingConcept/Controller.controller.js',
                                name: 'Controller.controller.js',
                                key: 'Controller.controller.js'
                            },
                            {
                                url: '/samples/messageHandlingConcept/View.view.xml',
                                name: 'View.view.xml',
                                key: 'View.view.xml'
                            },
                            {
                                url: '/samples/messageHandlingConcept/index.html',
                                name: 'index.html',
                                key: 'index.html'
                            },
                            {
                                url: '/samples/messageHandlingConcept/manifest.json',
                                name: 'manifest.json',
                                key: 'manifest.json',
                                isApplicationManifest: true
                            },
                            {
                                url: '/samples/messageHandlingConcept/Component.js',
                                name: 'Component.js',
                                key: 'Component.js'
                            },
                            {
                                url: '/samples/messageHandlingConcept/localService/mockdata/FormsModel.json',
                                name: 'FormsModel.json',
                                key: 'FormsModel.json'
                            }
                        ]
                    },
					{
						key: 'messageToast',
						target: 'exploreSamples',
						title: 'Message Toast',
						useIFrame: true,
						isApplication: true,
						files: [
							{
								url: '/samples/messageToast/Controller.controller.js',
								name: 'Controller.controller.js',
								key: 'Controller.controller.js'
							},
							{
								url: '/samples/messageToast/View.view.xml',
								name: 'View.view.xml',
								key: 'View.view.xml'
							},
							{
								url: '/samples/messageToast/index.html',
								name: 'index.html',
								key: 'index.html'
							},
							{
								url: '/samples/messageToast/manifest.json',
								name: 'manifest.json',
								key: 'manifest.json',
								isApplicationManifest: true
							},
							{
								url: '/samples/messageToast/Component.js',
								name: 'Component.js',
								key: 'Component.js'
							}
						]
					},
                    {
                        key: 'messageBoxes',
                        target: 'exploreSamples',
                        title: 'Message Boxes',
                        useIFrame: true,
                        isApplication: true,
                        files: [
                            {
                                url: '/samples/messageBoxes/Controller.controller.js',
                                name: 'Controller.controller.js',
                                key: 'Controller.controller.js'
                            },
                            {
                                url: '/samples/messageBoxes/View.view.xml',
                                name: 'View.view.xml',
                                key: 'View.view.xml'
                            },
                            {
                                url: '/samples/messageBoxes/index.html',
                                name: 'index.html',
                                key: 'index.html'
                            },
                            {
                                url: '/samples/messageBoxes/i18n.properties',
                                name: 'i18n.properties',
                                key: 'i18n.properties'
                            },
                            {
                                url: '/samples/messageBoxes/manifest.json',
                                name: 'manifest.json',
                                key: 'manifest.json',
                                isApplicationManifest: true
                            },
                            {
                                url: '/samples/messageBoxes/Component.js',
                                name: 'Component.js',
                                key: 'Component.js'
                            }
                        ]
                    }
                ]
            }
		]
	});
});
