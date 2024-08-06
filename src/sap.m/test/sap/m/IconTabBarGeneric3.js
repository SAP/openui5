sap.ui.define([
	"sap/m/App",
	"sap/m/IconTabBar",
	"sap/m/IconTabFilter",
	"sap/m/IconTabSeparator",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/Page",
	"sap/m/RatingIndicator",
	"sap/m/Text",
	"sap/ui/core/Theming",
	"sap/ui/core/library",
	"sap/m/CheckBox"
],
function(App, IconTabBar, IconTabFilter, IconTabSeparator, Input, Label, Library, Page, RatingIndicator, Text, Theming, coreLibrary, CheckBox) {
	"use strict";

	// shortcut for sap.ui.core.IconColor
	const IconColor = coreLibrary.IconColor;

	// shortcut for sap.m.TabsOverflowMode
	var TabsOverflowMode = Library.TabsOverflowMode;

	var app = new App("myApp", { initialPage: "page1" });

	var label1 = new Label({
		text: "Text only IconTabBar with sub filters (Two click areas)"
	});
	label1.addStyleClass("labelGen3");

	var label1a = new Label({
		text: "IconTabBar with start and end overflow sub filters (Two click areas) "
	});
	label1a.addStyleClass("labelGen3");

	var label1b = new Label({
		text: "Text only IconTabBar with filters with NO own content (non selectable) and only sub filters (Single click area)"
	});
	label1b.addStyleClass("labelGen3");

	var label1b2 = new Label({
		text: "Text only IconTabBar with filters for demonstrating 'interactionMode' property"
	});
	label1b2.addStyleClass("labelGen3");

	var label1c = new Label({
		text: "Text only IconTabBar with filters and icons"
	});
	label1c.addStyleClass("labelGen3");

	var label2a = new Label({
		text: "Drag and Drop IconTabBar"
	});
	label2a.addStyleClass("labelGen3");

	var label2b = new Label({
		text: "Drag and Drop IconTabBar (maxNestingLevel=5)"
	});
	label2b.addStyleClass("labelGen3");

	var label3 = new Label({
		text: "With selectedKey"
	});

	label3.addStyleClass("labelGen3");

	var label4 = new Label({
		text: "Text and counter IconTabBar with sub filters"
	});
	label4.addStyleClass("labelGen3");

	var label4a = new Label({
		text: "Text and counter IconTabBar with filters with NO own content (non selectable) and only sub filters"
	});
	label4a.addStyleClass("labelGen3");

	var label4b = new Label({
		text: "IconTabBar text only with Hindi texts"
	});
	label4b.addStyleClass("labelGen3");

	var label5 = new Label({
		text: "IconTabBar with sub filters"
	});
	label5.addStyleClass("labelGen3");

	var label5a = new Label({
		text: "IconTabBar with filters with NO own content (non selectable) and only sub filters"
	});
	label5a.addStyleClass("labelGen3");

	var label6 = new Label({
		text: "Horizontal IconTabBar with sub filters"
	});
	label6.addStyleClass("labelGen3");

	var label6a = new Label({
		text: "Horizontal IconTabBar with filters with NO own content (non selectable) and only sub filters"
	});
	label6a.addStyleClass("labelGen3");

	var label7 = new Label({
		text: "IconTabBar icons only with sub filters"
	});
	label7.addStyleClass("labelGen3");

	var label7a = new Label({
		text: "IconTabBar icons only with filters with NO own content (non selectable) and only sub filters"
	});
	label7a.addStyleClass("labelGen3");

	var itb1 = new IconTabBar("itb1", {
		upperCase: true,
		selectedKey: "mid",
		items: [
			new IconTabFilter("itf1", {
				iconColor: IconColor.Default,
				text: "1.Filter - Two click areas",
				key: "first",
				content: [
					new Label({
						text: "info info info"
					})
				],
				items: [
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "1.1.Filter",
						content: [
							new RatingIndicator({
								value: 1
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Critical,
						text: "1.2.Filter",
						content: [
							new RatingIndicator({
								value: 2
							})
						],
						items: [
							new IconTabFilter({
								iconColor: IconColor.Default,
								text: "1.2.1.Filter",
								content: [
									new RatingIndicator({
										value: 3
									})
								],
								items: [
									new IconTabFilter({
										iconColor: IconColor.Positive,
										text: "1.2.1.1.Filter",
										content: [
											new RatingIndicator({
												value: 4
											})
										]
									}),
									new IconTabFilter({
										iconColor: IconColor.Negative,
										text: "1.2.1.2.Filter",
										content: [
											new RatingIndicator({
												value: 5
											})
										]
									})
								]
							}),
							new IconTabFilter({
								iconColor: IconColor.Default,
								text: "1.2.2.Filter",
								content: [
									new RatingIndicator({
										value: 0
									})
								]
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "1.3.Filter",
						content: [
							new RatingIndicator({
								value: 5
							})
						]
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "2.Filter",
				content: [
					new Input({
						placeholder: "input placeholder"
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "3.Filter",
				enabled: false,
				content: [
					new RatingIndicator({
						value: 0
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "4.Filter",
				content: [
					new RatingIndicator({
						value: 3
					})
				],
				items: [
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "4.1.Filter",
						content: [
							new RatingIndicator({
								value: 1
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "4.2.Filter",
						content: [
							new RatingIndicator({
								value: 2
							})
						]
					}),
					new IconTabSeparator({ icon: "sap-icon://process" }),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "4.3.Filter",
						content: [
							new RatingIndicator({
								value: 3
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "4.4.Filter",
						content: [
							new RatingIndicator({
								value: 4
							})
						]
					}),
					new IconTabSeparator({}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "4.5.Filter",
						content: [
							new RatingIndicator({
								value: 1
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "4.6.Filter",
						content: [
							new RatingIndicator({
								value: 2
							})
						]
					}),
					new IconTabSeparator({ icon: "sap-icon://vertical-grip" }),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "4.7.Filter",
						content: [
							new RatingIndicator({
								value: 3
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "4.8.Filter",
						content: [
							new RatingIndicator({
								value: 4
							})
						]
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Positive,
				text: "5.Filter",
				content: [
					new RatingIndicator({
						value: 2
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Negative,
				text: "6.Filter",
				content: [
					new RatingIndicator({
						value: 4
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Critical,
				text: "7.Filter",
				key: "withNestedSeparators",
				content: [
					new RatingIndicator({
						value: 0
					})
				],
				items: [
				new IconTabSeparator({}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "7.1.Filter",
						icon: "sap-icon://shipping-status",
						content: [
							new RatingIndicator({
								value: 0
							})
						],
						items: [
							new IconTabFilter({
								iconColor: IconColor.Default,
								text: "7.1.1.Filter",
								content: [
									new RatingIndicator({
										value: 1
									})
								],
								items: [
									new IconTabFilter({
										iconColor: IconColor.Default,
										text: "7.1.1.1.Filter",
										content: [
											new RatingIndicator({
												value: 4
											})
										]
									}),
									new IconTabSeparator({}),
									new IconTabFilter({
										iconColor: IconColor.Default,
										text: "7.1.1.2.Filter",
										content: [
											new RatingIndicator({
												value: 2
											})
										]
									}),
									new IconTabFilter({
										iconColor: IconColor.Default,
										text: "7.1.1.3.Filter",
										content: [
											new RatingIndicator({
												value: 3
											})
										]
									}),
									new IconTabSeparator({}),
									new IconTabFilter({
										iconColor: IconColor.Default,
										text: "7.1.1.4.Filter",
										content: [
											new RatingIndicator({
												value: 4
											})
										]
									})
								]
							})
						]
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "8.Filter",
				content: [
					new RatingIndicator({
						value: 1
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "9.Filter",
				content: [
					new RatingIndicator({
						value: 5
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "10.Filter",
				content: [
					new RatingIndicator({
						value: 4
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "11.Filter",
				content: [
					new RatingIndicator({
						value: 3
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "12.Filter",
				content: [
					new RatingIndicator({
						value: 2
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "13.Filter",
				content: [
					new RatingIndicator({
						value: 1
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "14.Filter",
				content: [
					new RatingIndicator({
						value: 0
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "15.Filter",
				content: [
					new RatingIndicator({
						value: 5
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "16.The Long Text Filter",
				key: "mid",
				content: [
					new RatingIndicator({
						value: 3
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "17.Filter",
				content: [
					new RatingIndicator({
						value: 4
					})
				],
				items: [
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "17.1.Filter",
						content: [
							new RatingIndicator({
								value: 1
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "17.2.Filter",
						content: [
							new RatingIndicator({
								value: 2
							})
						],
						items: [
							new IconTabFilter({
								iconColor: IconColor.Default,
								text: "17.2.1.Filter",
								content: [
									new RatingIndicator({
										value: 3
									})
								],
								items: [
									new IconTabFilter({
										iconColor: IconColor.Default,
										text: "17.2.1.1.Filter",
										content: [
											new RatingIndicator({
												value: 4
											})
										]
									}),
									new IconTabFilter({
										iconColor: IconColor.Critical,
										text: "17.2.1.2.Filter",
										content: [
											new RatingIndicator({
												value: 5
											})
										]
									})
								]
							}),
							new IconTabFilter({
								iconColor: IconColor.Default,
								text: "17.2.2.Filter",
								content: [
									new RatingIndicator({
										value: 0
									})
								]
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "17.3.Filter",
						content: [
							new RatingIndicator({
								value: 5
							})
						]
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "18.Filter",
				content: [
					new RatingIndicator({
						value: 1
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "19.Filter",
				content: [
					new RatingIndicator({
						value: 2
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "20.Filter",
				content: [
					new RatingIndicator({
						value: 0
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "21.Filter",
				content: [
					new RatingIndicator({
						value: 1
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "22.Filter",
				content: [
					new RatingIndicator({
						value: 3
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "23.Filter",
				content: [
					new RatingIndicator({
						value: 2
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "24.Filter",
				content: [
					new RatingIndicator({
						value: 5
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "25.Filter",
				key: "end",
				content: [
					new RatingIndicator({
						value: 1
					})
				]
			})
		]
	});

	var itb1a = new IconTabBar("itb1a", {
		upperCase: true,
		selectedKey: "mid",
		tabsOverflowMode: TabsOverflowMode.StartAndEnd,
		items: [
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "1.Filter - Two click areas",
				key: "first",
				content: [
					new Label({
						text: "info info info"
					})
				],
				items: [
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "1.1.Filter",
						content: [
							new RatingIndicator({
								value: 1
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Critical,
						text: "1.2.Filter",
						content: [
							new RatingIndicator({
								value: 2
							})
						],
						items: [
							new IconTabFilter({
								iconColor: IconColor.Default,
								text: "1.2.1.Filter",
								content: [
									new RatingIndicator({
										value: 3
									})
								],
								items: [
									new IconTabFilter({
										iconColor: IconColor.Positive,
										text: "1.2.1.1.Filter",
										content: [
											new RatingIndicator({
												value: 4
											})
										]
									}),
									new IconTabFilter({
										iconColor: IconColor.Negative,
										text: "1.2.1.2.Filter",
										content: [
											new RatingIndicator({
												value: 5
											})
										]
									})
								]
							}),
							new IconTabFilter({
								iconColor: IconColor.Default,
								text: "1.2.2.Filter",
								content: [
									new RatingIndicator({
										value: 0
									})
								]
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "1.3.Filter",
						content: [
							new RatingIndicator({
								value: 5
							})
						]
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "2.Filter",
				content: [
					new Input({
						placeholder: "input placeholder"
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "3.Filter",
				enabled: false,
				content: [
					new RatingIndicator({
						value: 0
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "4.Filter",
				content: [
					new RatingIndicator({
						value: 3
					})
				],
				items: [
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "4.1.Filter",
						content: [
							new RatingIndicator({
								value: 1
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "4.2.Filter",
						content: [
							new RatingIndicator({
								value: 2
							})
						]
					}),
					new IconTabSeparator({ icon: "sap-icon://process" }),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "4.3.Filter",
						content: [
							new RatingIndicator({
								value: 3
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "4.4.Filter",
						content: [
							new RatingIndicator({
								value: 4
							})
						]
					}),
					new IconTabSeparator({}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "4.5.Filter",
						content: [
							new RatingIndicator({
								value: 1
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "4.6.Filter",
						content: [
							new RatingIndicator({
								value: 2
							})
						]
					}),
					new IconTabSeparator({ icon: "sap-icon://vertical-grip" }),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "4.7.Filter",
						content: [
							new RatingIndicator({
								value: 3
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "4.8.Filter",
						content: [
							new RatingIndicator({
								value: 4
							})
						]
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Positive,
				text: "5.Filter",
				content: [
					new RatingIndicator({
						value: 2
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Negative,
				text: "6.Filter",
				content: [
					new RatingIndicator({
						value: 4
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Critical,
				text: "7.Filter",
				key: "withNestedSeparators",
				content: [
					new RatingIndicator({
						value: 0
					})
				],
				items: [
				new IconTabSeparator({}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "7.1.Filter",
						content: [
							new RatingIndicator({
								value: 0
							})
						],
						items: [
							new IconTabFilter({
								iconColor: IconColor.Default,
								text: "7.1.1.Filter",
								content: [
									new RatingIndicator({
										value: 1
									})
								],
								items: [
									new IconTabFilter({
										iconColor: IconColor.Default,
										text: "7.1.1.1.Filter",
										content: [
											new RatingIndicator({
												value: 4
											})
										]
									}),
									new IconTabSeparator({}),
									new IconTabFilter({
										iconColor: IconColor.Default,
										text: "7.1.1.2.Filter",
										content: [
											new RatingIndicator({
												value: 2
											})
										]
									}),
									new IconTabFilter({
										iconColor: IconColor.Default,
										text: "7.1.1.3.Filter",
										content: [
											new RatingIndicator({
												value: 3
											})
										]
									}),
									new IconTabSeparator({}),
									new IconTabFilter({
										iconColor: IconColor.Default,
										text: "7.1.1.4.Filter",
										content: [
											new RatingIndicator({
												value: 4
											})
										]
									})
								]
							})
						]
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "8.Filter",
				content: [
					new RatingIndicator({
						value: 1
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "9.Filter",
				content: [
					new RatingIndicator({
						value: 5
					})
				]
			}),
			new IconTabFilter("itf10a", {
				iconColor: IconColor.Default,
				text: "10.Filter",
				content: [
					new RatingIndicator({
						value: 4
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "11.Filter",
				content: [
					new RatingIndicator({
						value: 3
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "12.Filter",
				content: [
					new RatingIndicator({
						value: 2
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "13.Filter",
				content: [
					new RatingIndicator({
						value: 1
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "14.Filter",
				content: [
					new RatingIndicator({
						value: 0
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "15.Filter",
				content: [
					new RatingIndicator({
						value: 5
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "16.The Long Text Filter",
				key: "mid",
				content: [
					new RatingIndicator({
						value: 3
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "17.Filter",
				content: [
					new RatingIndicator({
						value: 4
					})
				],
				items: [
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "17.1.Filter",
						content: [
							new RatingIndicator({
								value: 1
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "17.2.Filter",
						content: [
							new RatingIndicator({
								value: 2
							})
						],
						items: [
							new IconTabFilter({
								iconColor: IconColor.Default,
								text: "17.2.1.Filter",
								content: [
									new RatingIndicator({
										value: 3
									})
								],
								items: [
									new IconTabFilter({
										iconColor: IconColor.Default,
										text: "17.2.1.1.Filter",
										content: [
											new RatingIndicator({
												value: 4
											})
										]
									}),
									new IconTabFilter({
										iconColor: IconColor.Critical,
										text: "17.2.1.2.Filter",
										content: [
											new RatingIndicator({
												value: 5
											})
										]
									})
								]
							}),
							new IconTabFilter({
								iconColor: IconColor.Default,
								text: "17.2.2.Filter",
								content: [
									new RatingIndicator({
										value: 0
									})
								]
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "17.3.Filter",
						content: [
							new RatingIndicator({
								value: 5
							})
						]
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "18.Filter",
				content: [
					new RatingIndicator({
						value: 1
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "19.Filter",
				content: [
					new RatingIndicator({
						value: 2
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "20.Filter",
				content: [
					new RatingIndicator({
						value: 0
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "21.Filter",
				content: [
					new RatingIndicator({
						value: 1
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "22.Filter",
				content: [
					new RatingIndicator({
						value: 3
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "23.Filter",
				content: [
					new RatingIndicator({
						value: 2
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "24.Filter",
				content: [
					new RatingIndicator({
						value: 5
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "25.Filter",
				key: "end",
				content: [
					new RatingIndicator({
						value: 1
					})
				]
			})
		]
	});

	var itb1b = new IconTabBar("itb1b", {
		upperCase: true,
		selectedKey: "mid",
		items: [
			new IconTabFilter("itf1b", {
				iconColor: IconColor.Default,
				text: "1.Filter",
				key: "first",
				items: [
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "1.1.Filter",
						content: [
							new RatingIndicator({
								value: 1
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Critical,
						text: "1.2.Filter",
						content: [
							new RatingIndicator({
								value: 2
							})
						],
						items: [
							new IconTabFilter({
								iconColor: IconColor.Default,
								text: "1.2.1.Filter",
								content: [
									new RatingIndicator({
										value: 3
									})
								],
								items: [
									new IconTabFilter({
										iconColor: IconColor.Positive,
										text: "1.2.1.1.Filter",
										content: [
											new RatingIndicator({
												value: 4
											})
										]
									}),
									new IconTabFilter({
										iconColor: IconColor.Negative,
										text: "1.2.1.2.Filter",
										content: [
											new RatingIndicator({
												value: 5
											})
										]
									})
								]
							}),
							new IconTabFilter({
								iconColor: IconColor.Default,
								text: "1.2.2.Filter",
								content: [
									new RatingIndicator({
										value: 0
									})
								]
							})
						]
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "2.Filter",
				items: [
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "4.1.Filter",
						content: [
							new RatingIndicator({
								value: 1
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "4.2.Filter",
						content: [
							new RatingIndicator({
								value: 2
							})
						]
					})
				]
			})
		]
	});

	var itb1b2 = new IconTabBar("itb1b2", {
		upperCase: true,
		selectedKey: "mid",
		items: [
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "No own content",
				key: "first",
				items: [
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "1.1.Filter",
						content: [
							new RatingIndicator({
								value: 1
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "1.2.Filter",
						content: [
							new RatingIndicator({
								value: 2
							})
						]
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "No own content, but property set to 'Select'",
				key: "first",
				interactionMode: "Select",
				items: [
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "1.1.Filter",
						content: [
							new RatingIndicator({
								value: 1
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "1.2.Filter",
						content: [
							new RatingIndicator({
								value: 2
							})
						]
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "Has own content",
				content: [
					new RatingIndicator({
						value: 2
					})
				],
				items: [
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "4.1.Filter",
						content: [
							new RatingIndicator({
								value: 1
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "4.2.Filter",
						content: [
							new RatingIndicator({
								value: 2
							})
						]
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "Has own content, but property set to 'SelectLeavesOnly'",
				interactionMode: "SelectLeavesOnly",
				content: [
					new RatingIndicator({
						value: 2
					})
				],
				items: [
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "4.1.Filter",
						content: [
							new RatingIndicator({
								value: 1
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "4.2.Filter",
						content: [
							new RatingIndicator({
								value: 2
							})
						]
					})
				]
			})
		]
	});

	var itb1c = new IconTabBar("itb1c", {
		upperCase: true,
		headerMode: "Inline",
		selectedKey: "mid",
		items: [
			new IconTabFilter("itf1c", {
				iconColor: IconColor.Default,
				text: "1.Filter - Two click areas",
				icon: "sap-icon://shipping-status",
				key: "first",
				content: [
					new Label({
						text: "info info info"
					})
				],
				items: [
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "1.1.Filter",
						content: [
							new RatingIndicator({
								value: 1
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Critical,
						text: "1.2.Filter",
						icon: "sap-icon://shipping-status",
						content: [
							new RatingIndicator({
								value: 2
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "1.3.Filter",
						content: [
							new RatingIndicator({
								value: 5
							})
						]
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				icon: "sap-icon://shipping-status",
				text: "2.Filter",
				content: [
					new Input({
						placeholder: "input placeholder"
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "3.Filter",
				icon: "sap-icon://shipping-status",
				enabled: false,
				content: [
					new RatingIndicator({
						value: 0
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Positive,
				text: "5.Filter",
				icon: "sap-icon://shipping-status",
				content: [
					new RatingIndicator({
						value: 2
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Negative,
				text: "6.Filter",
				icon: "sap-icon://shipping-status",
				content: [
					new RatingIndicator({
						value: 4
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Critical,
				text: "7.Filter",
				icon: "sap-icon://shipping-status",
				key: "withNestedSeparators",
				content: [
					new RatingIndicator({
						value: 0
					})
				],
				items: [
				new IconTabSeparator({}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						icon: "sap-icon://shipping-status",
						text: "7.1.Filter",
						content: [
							new RatingIndicator({
								value: 0
							})
						],
						items: [
							new IconTabFilter({
								iconColor: IconColor.Default,
								text: "7.1.1.Filter",
								content: [
									new RatingIndicator({
										value: 1
									})
								],
								items: [
									new IconTabFilter({
										iconColor: IconColor.Default,
										text: "7.1.1.1.Filter",
										content: [
											new RatingIndicator({
												value: 4
											})
										]
									}),
									new IconTabSeparator({}),
									new IconTabFilter({
										iconColor: IconColor.Default,
										text: "7.1.1.2.Filter",
										content: [
											new RatingIndicator({
												value: 2
											})
										]
									}),
									new IconTabFilter({
										iconColor: IconColor.Default,
										text: "7.1.1.3.Filter",
										content: [
											new RatingIndicator({
												value: 3
											})
										]
									}),
									new IconTabSeparator({}),
									new IconTabFilter({
										iconColor: IconColor.Default,
										text: "7.1.1.4.Filter",
										icon: "sap-icon://shipping-status",
										content: [
											new RatingIndicator({
												value: 4
											})
										]
									})
								]
							})
						]
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "8.Filter",
				icon: "sap-icon://shipping-status",
				content: [
					new RatingIndicator({
						value: 1
					})
				]
			})
		]
	});

	var lotsOfTabs = [];
	for (var i = 1; i <= 60; i++) {
		lotsOfTabs.push(new IconTabFilter({
			key: i,
			text: 'Tab ' + i,
			content: new Text({ text: 'Content ' + i })
		}));
	}

	lotsOfTabs.splice(4, 1, new IconTabFilter({
		key: "5",
		text: "Tab 5. Invisible.",
		content: new Text({ text: 'Invisible tab content' }),
		visible: false
	}));

	lotsOfTabs.splice(14, 1, new IconTabFilter({
		key: "long",
		text: "Tab 15. With The Longest Label",
		content: new Text({ text: 'Content 15' })
	}));

	var itb2a = new IconTabBar("itb2a", {
		enableTabReordering: true,
		items: lotsOfTabs
	});

	var lotsOfTabs2 = [];
	for (i = 1; i <= 60; i++) {
		lotsOfTabs2.push(new IconTabFilter({
			key: i,
			text: "Tab " + i,
			content: new Text({ text: "Content" + i })
		}));
	}

	var itb2b = new IconTabBar("itb2b", {
		enableTabReordering: true,
		maxNestingLevel: 5,
		items: lotsOfTabs2
	});

	var itb3 = new IconTabBar("itb3", {
		selectedKey: "nested",
		items: [
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "0.Filter",
				content: [
					new RatingIndicator({
						value: 1
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "1.Filter",
				key: "first",
				content: [
					new Label({
						text: "info info info"
					})
				],
				items: [
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "1.1.Filter",
						content: [
							new RatingIndicator({
								value: 1
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Critical,
						text: "1.2.Filter",
						content: [
							new RatingIndicator({
								value: 2
							})
						],
						items: [
							new IconTabFilter({
								key: "nested",
								iconColor: IconColor.Default,
								text: "1.2.1.Filter",
								content: [
									new Text({ text: "Nested item content" })
								]
							})
						]
					})
				]
			})
		]
	});

	var itb4 = new IconTabBar("itb4", {
			upperCase: true,
			applyContentPadding: false,
			items: [
				new IconTabFilter("itf4", {
					iconColor: IconColor.Default,
					text: "Lorem",
					count: "3",
					content: [
						new Label({
							text: "info info info"
						})
					],
					items: [
						new IconTabFilter({
						iconColor: IconColor.Default,
						text: "Ipsum",
						count: "3",
						content: [
							new Input({
								placeholder: "input placeholder"
							})
						]
						}),
						new IconTabFilter({
							iconColor: IconColor.Default,
							text: "Lorem Ipsum",
							count: "233",
							content: [
								new RatingIndicator({
									value: 3
								})
							]
						})
					]
				}),
				new IconTabFilter({
					iconColor: IconColor.Default,
					text: "Ipsum",
					count: "3",
					content: [
						new Label({
							text: "info"
						})
					],
					items: [
						new IconTabFilter({
						iconColor: IconColor.Default,
						text: "Ipsum",
						count: "3",
						content: [
							new Input({
								placeholder: "input placeholder"
							})
						]
						}),
						new IconTabFilter({
							iconColor: IconColor.Default,
							text: "Lorem Ipsum",
							count: "233",
							content: [
								new RatingIndicator({
									value: 3
								})
							]
						})
					]
				})
			]
		});

	var itb4a = new IconTabBar("itb4a", {
		upperCase: true,
		applyContentPadding: false,
		items: [
			new IconTabFilter("itf4a", {
				iconColor: IconColor.Default,
				text: "Lorem",
				count: "3",
				items: [
					new IconTabFilter({
					iconColor: IconColor.Default,
					text: "Ipsum",
					count: "3",
					content: [
						new Input({
							placeholder: "input placeholder"
						})
					]
					}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "Lorem Ipsum",
						count: "233",
						content: [
							new RatingIndicator({
								value: 3
							})
						]
					})
				]
			}),
			new IconTabFilter({
				iconColor: IconColor.Default,
				text: "Ipsum",
				count: "3",
				items: [
					new IconTabFilter({
					iconColor: IconColor.Default,
					text: "Ipsum",
					count: "3",
					content: [
						new Input({
							placeholder: "input placeholder"
						})
					]
					}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "Lorem Ipsum",
						count: "233",
						content: [
							new RatingIndicator({
								value: 3
							})
						]
					})
				]
			})
		]
	});

	var itb4b = new IconTabBar("itb4b", {
		items: [
			new IconTabFilter({
				text: "\u0936\u0940\u0930\u094D\u0937\u0932\u0947\u0916"
			}),
			new IconTabFilter({
				text: "\u0936\u0940\u0930\u094D\u0937\u0932\u0947\u0916 1"
			})
		]
	});

	var itb5 = new IconTabBar("itb5", {
		expandable: false,
		items: [
			new IconTabFilter({
				icon: "sap-icon://task",
				iconColor: IconColor.Critical,
				count: "3",
				text: "Open",
				key: "Open",
				content: [
					new RatingIndicator({
						value: 3
					})
				],
				items: [
					new IconTabFilter({
						icon: "sap-icon://instance",
						iconColor: IconColor.Negative,
						count: "2",
						text: "In Process",
						key: "In Process",
						content: [
							new RatingIndicator({
								value: 2
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://shipping-status",
						iconColor: IconColor.Positive,
						count: "3",
						text: "Shipped",
						key: "Shipped",
						content: [
							new RatingIndicator({
								value: 1
							})
						]
					})
				]
			}),
			new IconTabFilter({
				icon: "sap-icon://instance",
				iconColor: IconColor.Negative,
				count: "2",
				text: "In Process",
				key: "In Process",
				content: [
					new RatingIndicator({
						value: 2
					})
				],
				items: [
					new IconTabFilter({
						icon: "sap-icon://instance",
						iconColor: IconColor.Negative,
						count: "2",
						text: "In Process",
						key: "In Process",
						content: [
							new RatingIndicator({
								value: 2
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://shipping-status",
						iconColor: IconColor.Positive,
						count: "3",
						text: "Shipped",
						key: "Shipped",
						content: [
							new RatingIndicator({
								value: 1
							})
						]
					})
				]
			})
		]
	});

	var itb5a = new IconTabBar("itb5a", {
		expandable: false,
		items: [
			new IconTabFilter({
				icon: "sap-icon://task",
				iconColor: IconColor.Critical,
				count: "3",
				text: "Open",
				key: "Open",
				items: [
					new IconTabFilter({
						icon: "sap-icon://instance",
						iconColor: IconColor.Negative,
						count: "2",
						text: "In Process",
						key: "In Process",
						content: [
							new RatingIndicator({
								value: 2
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://shipping-status",
						iconColor: IconColor.Positive,
						count: "3",
						text: "Shipped",
						key: "Shipped",
						content: [
							new RatingIndicator({
								value: 1
							})
						]
					})
				]
			}),
			new IconTabFilter({
				icon: "sap-icon://instance",
				iconColor: IconColor.Negative,
				count: "2",
				text: "In Process",
				key: "In Process",
				items: [
					new IconTabFilter({
						icon: "sap-icon://instance",
						iconColor: IconColor.Negative,
						count: "2",
						text: "In Process",
						key: "In Process",
						content: [
							new RatingIndicator({
								value: 2
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://shipping-status",
						iconColor: IconColor.Positive,
						count: "3",
						text: "Shipped",
						key: "Shipped",
						content: [
							new RatingIndicator({
								value: 1
							})
						]
					})
				]
			})
		]
	});

	var itb6 = new IconTabBar("itb6", {
		expandable: false,
		items: [
			new IconTabFilter({
				design: "Horizontal",
				icon: "sap-icon://task",
				iconColor: IconColor.Critical,
				count: "3",
				text: "Open",
				key: "Open",
				content: [
					new RatingIndicator({
						value: 3
					})
				],
				items: [
					new IconTabFilter({
						design: "Horizontal",
						icon: "sap-icon://instance",
						iconColor: IconColor.Negative,
						count: "2",
						text: "In Process",
						key: "In Process",
						content: [
							new RatingIndicator({
								value: 2
							})
						]
					}),
					new IconTabFilter({
						design: "Horizontal",
						icon: "sap-icon://shipping-status",
						iconColor: IconColor.Positive,
						count: "3",
						text: "Shipped",
						key: "Shipped",
						content: [
							new RatingIndicator({
								value: 1
							})
						]
					})
				]
			}),
			new IconTabFilter({
				design: "Horizontal",
				icon: "sap-icon://instance",
				iconColor: IconColor.Negative,
				count: "2",
				text: "In Process",
				key: "In Process",
				content: [
					new RatingIndicator({
						value: 2
					})
				],
				items: [
					new IconTabFilter({
						design: "Horizontal",
						icon: "sap-icon://instance",
						iconColor: IconColor.Negative,
						count: "2",
						text: "In Process",
						key: "In Process",
						content: [
							new RatingIndicator({
								value: 2
							})
						]
					}),
					new IconTabFilter({
						design: "Horizontal",
						icon: "sap-icon://shipping-status",
						iconColor: IconColor.Positive,
						count: "3",
						text: "Shipped",
						key: "Shipped",
						content: [
							new RatingIndicator({
								value: 1
							})
						]
					})
				]
			})
		]
	});

	var itb6a = new IconTabBar("itb6a", {
		expandable: false,
		items: [
			new IconTabFilter({
				design: "Horizontal",
				icon: "sap-icon://task",
				iconColor: IconColor.Critical,
				count: "3",
				text: "Open",
				key: "Open",
				items: [
					new IconTabFilter({
						design: "Horizontal",
						icon: "sap-icon://instance",
						iconColor: IconColor.Negative,
						count: "2",
						text: "In Process",
						key: "In Process",
						content: [
							new RatingIndicator({
								value: 2
							})
						]
					}),
					new IconTabFilter({
						design: "Horizontal",
						icon: "sap-icon://shipping-status",
						iconColor: IconColor.Positive,
						count: "3",
						text: "Shipped",
						key: "Shipped",
						content: [
							new RatingIndicator({
								value: 1
							})
						]
					})
				]
			}),
			new IconTabFilter({
				design: "Horizontal",
				icon: "sap-icon://instance",
				iconColor: IconColor.Negative,
				count: "2",
				text: "In Process",
				key: "In Process",
				items: [
					new IconTabFilter({
						design: "Horizontal",
						icon: "sap-icon://instance",
						iconColor: IconColor.Negative,
						count: "2",
						text: "In Process",
						key: "In Process",
						content: [
							new RatingIndicator({
								value: 2
							})
						]
					}),
					new IconTabFilter({
						design: "Horizontal",
						icon: "sap-icon://shipping-status",
						iconColor: IconColor.Positive,
						count: "3",
						text: "Shipped",
						key: "Shipped",
						content: [
							new RatingIndicator({
								value: 1
							})
						]
					})
				]
			})
		]
	});

	var itb7 = new IconTabBar("itb7", {
		items: [
			new IconTabFilter({
				icon: "sap-icon://task",
				iconColor: IconColor.Critical,
				count: "3",
				key: "Open",
				content: [
					new RatingIndicator({
						value: 3
					})
				],
				items: [
					new IconTabFilter({
						icon: "sap-icon://instance",
						iconColor: IconColor.Negative,
						count: "2",
						key: "In Process",
						content: [
							new RatingIndicator({
								value: 2
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://shipping-status",
						iconColor: IconColor.Positive,
						count: "3",
						key: "Shipped",
						content: [
							new RatingIndicator({
								value: 1
							})
						]
					})
				]
			}),
			new IconTabFilter({
				icon: "sap-icon://instance",
				iconColor: IconColor.Negative,
				count: "2",
				key: "In Process",
				content: [
					new RatingIndicator({
						value: 2
					})
				],
				items: [
					new IconTabFilter({
						icon: "sap-icon://instance",
						iconColor: IconColor.Negative,
						count: "2",
						key: "In Process",
						content: [
							new RatingIndicator({
								value: 2
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://shipping-status",
						iconColor: IconColor.Positive,
						count: "3",
						key: "Shipped",
						content: [
							new RatingIndicator({
								value: 1
							})
						]
					})
				]
			})
		]
	});

	var itb7a = new IconTabBar("itb7a", {
		items: [
			new IconTabFilter({
				icon: "sap-icon://task",
				iconColor: IconColor.Critical,
				count: "3",
				key: "Open",
				items: [
					new IconTabFilter({
						icon: "sap-icon://instance",
						iconColor: IconColor.Negative,
						count: "2",
						key: "In Process",
						content: [
							new RatingIndicator({
								value: 2
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://shipping-status",
						iconColor: IconColor.Positive,
						count: "3",
						key: "Shipped",
						content: [
							new RatingIndicator({
								value: 1
							})
						]
					})
				]
			}),
			new IconTabFilter({
				icon: "sap-icon://instance",
				iconColor: IconColor.Negative,
				count: "2",
				key: "In Process",
				items: [
					new IconTabFilter({
						icon: "sap-icon://instance",
						iconColor: IconColor.Negative,
						count: "2",
						key: "In Process",
						content: [
							new RatingIndicator({
								value: 2
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://shipping-status",
						iconColor: IconColor.Positive,
						count: "3",
						key: "Shipped",
						content: [
							new RatingIndicator({
								value: 1
							})
						]
					})
				]
			})
		]
	});

	// Checkbox for Compact Content Density for the page
	var cbCompactContentDensity  = new CheckBox("densityModeBox", {
		selected: false,
		select: function (oEvent) {
			var bSelectedValue = oEvent.getSource().getSelected();
			document.body.classList.toggle("sapUiSizeCompact", bSelectedValue);
			Theming.notifyContentDensityChanged();
		}
	});

	var oLabelCompactContentDensity  = new Label({
		text: "Compact Content Density for the page:",
		labelFor: cbCompactContentDensity
	});

	var page = new Page("page1", {
		headerContent: [
			oLabelCompactContentDensity,
			cbCompactContentDensity
		],
		content: [
			label1,
			itb1,
			label1a,
			itb1a,
			label1b,
			itb1b,
			label1b2,
			itb1b2,
			label1c,
			itb1c,
			label2a,
			itb2a,
			label2b,
			itb2b,
			label3,
			itb3,
			label4,
			itb4,
			label4a,
			itb4a,
			label4b,
			itb4b,
			label5,
			itb5,
			label5a,
			itb5a,
			label6,
			itb6,
			label6a,
			itb6a,
			label7,
			itb7,
			label7a,
			itb7a
		]
	});

	app.addPage(page);
	app.placeAt("body");
});
