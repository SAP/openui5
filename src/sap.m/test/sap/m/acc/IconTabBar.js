sap.ui.define([
	"sap/m/App",
	"sap/m/IconTabBar",
	"sap/m/IconTabFilter",
	"sap/m/IconTabSeparator",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/Page",
	"sap/m/Text",
	"sap/ui/core/library"
], function(App, IconTabBar, IconTabFilter, IconTabSeparator, Input, Label, mobileLibrary, Page, MText, coreLibrary) {
	"use strict";

	// shortcut for sap.m.IconTabFilterDesign
	var IconTabFilterDesign = mobileLibrary.IconTabFilterDesign;

	// shortcut for sap.ui.core.IconColor
	var IconColor = coreLibrary.IconColor;

	// create and add app
	var app = new App("myApp", {initialPage:"tabBarPage"});
	app.placeAt("body");

	var label3 = new Label({
		text: "IconTabBar with tabs which have labels. Tabs are expandable. Semantic colors are used. Some tabs are invisible."
	});
	label3.addStyleClass("label");

	var label4 = new Label({
		text: "IconTabBar with tabs which have no icons, only labels. Tabs are expandable. Only default (brand) color is used."
	});
	label4.addStyleClass("label");

	var label5 = new Label({
		text: "IconTabBar with tabs which have no icons, only labels. Tabs are expandable. Semanctic colors are used."
	});
	label5.addStyleClass("label");

	var label6 = new Label({
		text: "Initially collapsed IconTabBar with no active item."
	});
	label6.addStyleClass("label");

	var label11 = new Label({
		text: "IconTabBar with images as items."
	});
	label11.addStyleClass("label");

	// create and add a page with icon tab bar
	var page = new Page("tabBarPage", {
		title:"IconTabBar",
		content : [
			label3,
			new IconTabBar("itb3", {
				selectedKey: "key3",
				items: [
					new IconTabFilter({
						icon: "sap-icon://hint",
						iconColor: IconColor.Neutral,
						count: "377",
						key: "key1",
						text: "Neutral with long text",
						tooltip: "Neutral with long text",
						content: [
							new Label({
								text: "info info info"
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://activity-items",
						iconColor: IconColor.Critical,
						enabled: false,
						count: "38",
						key: "key2",
						text: "Critical lorem",
						tooltip: "Critical lorem",
						content: [
							new Input({
								placeholder: "input placeholder"
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://attachment",
						iconColor: IconColor.Negative,
						text: "Negative lorem long long",
						tooltip: "Negative lorem long long",
						key: "key3",
						content: [
							new MText({
								text : "Tab Notes\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque risus nulla, interdum eget posuere non, tincidunt eu felis. In hac habitasse platea  dictumst. Quisque ut ipsum est. Duis ipsum orci, interdum eget sollicitudin ac, blandit a ante. Cras congue posuere metus sed tempus. Mauris euismod, dui sit amet molestie volutpat, ipsum est viverra velit, id ultricies ante dolor et ligula. Pellentesque tincidunt fermentum lectus, eu luctus mi ultrices quis. Sed luctus nulla sit amet sapien consequat quis pretium eros tincidunt. Nullam quam erat, ultricies in malesuada non, tincidunt at nibh. Curabitur nec lectus et justo auctor tincidunt. In rhoncus risus vitae turpis suscipit eget porta metus facilisis. Vestibulum bibendum vehicula velit eu porta. Donec tincidunt rutrum lacus at egestas. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Pellentesque eu velit non quam facilisis ullamcorper.\rUt faucibus, dolor eu congue fringilla, libero leo dignissim eros, dignissim porta eros augue id orci. Phasellus in enim sed orci hendrerit accumsan. Vestibulum nibh libero, viverra sit amet pulvinar quis, molestie placerat velit. Suspendisse fringilla venenatis eleifend. Etiam in eros augue. Donec elit leo, aliquet nec vestibulum eu, blandit a lacus. Quisque ullamcorper consectetur lectus, cursus aliquam dolor consequat eu.\rProin orci turpis, rhoncus et egestas vitae, gravida nec diam. Pellentesque ante nisl, interdum id dictum ut, scelerisque at neque. Morbi egestas lobortis vestibulum. Nunc metus purus, facilisis id interdum at, rutrum at ante. Etiam euismod ultrices magna, sit amet hendrerit enim tempor sed. Quisque lacinia tempus risus, in feugiat leo dictum sit amet. Vestibulum non erat massa, ut placerat velit. In quis neque est, sed eleifend orci. Nulla ullamcorper porttitor cursus. Sed a massa tortor. Curabitur auctor, turpis et congue viverra, turpis sem eleifend justo, ut pellentesque nisl orci non leo. Ut vitae nibh eu ligula feugiat mollis vel a erat. Vivamus vel turpis auctor lorem fringilla blandit sit amet sit amet nulla. Fusce tempus lacus sit amet felis auctor fermentum."
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://collaborate",
						iconColor: IconColor.Positive,
						text: "Positive lorem",
						tooltip: "Positive lorem",
						key: "key4",
						count: "57",
						content: [
							new MText({
								text : "Tab Notes\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque risus nulla, interdum eget posuere non, tincidunt eu felis. In hac habitasse platea  dictumst. Quisque ut ipsum est. Duis ipsum orci, interdum eget sollicitudin ac, blandit a ante. Cras congue posuere metus sed tempus. Mauris euismod, dui sit amet molestie volutpat, ipsum est viverra velit, id ultricies ante dolor et ligula. Pellentesque tincidunt fermentum lectus, eu luctus mi ultrices quis. Sed luctus nulla sit amet sapien consequat quis pretium eros tincidunt. Nullam quam erat, ultricies in malesuada non, tincidunt at nibh. Curabitur nec lectus et justo auctor tincidunt. In rhoncus risus vitae turpis suscipit eget porta metus facilisis. Vestibulum bibendum vehicula velit eu porta. Donec tincidunt rutrum lacus at egestas. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Pellentesque eu velit non quam facilisis ullamcorper.\rUt faucibus, dolor eu congue fringilla, libero leo dignissim eros, dignissim porta eros augue id orci. Phasellus in enim sed orci hendrerit accumsan. Vestibulum nibh libero, viverra sit amet pulvinar quis, molestie placerat velit. Suspendisse fringilla venenatis eleifend. Etiam in eros augue. Donec elit leo, aliquet nec vestibulum eu, blandit a lacus. Quisque ullamcorper consectetur lectus, cursus aliquam dolor consequat eu.\rProin orci turpis, rhoncus et egestas vitae, gravida nec diam. Pellentesque ante nisl, interdum id dictum ut, scelerisque at neque. Morbi egestas lobortis vestibulum. Nunc metus purus, facilisis id interdum at, rutrum at ante. Etiam euismod ultrices magna, sit amet hendrerit enim tempor sed. Quisque lacinia tempus risus, in feugiat leo dictum sit amet. Vestibulum non erat massa, ut placerat velit. In quis neque est, sed eleifend orci. Nulla ullamcorper porttitor cursus. Sed a massa tortor. Curabitur auctor, turpis et congue viverra, turpis sem eleifend justo, ut pellentesque nisl orci non leo. Ut vitae nibh eu ligula feugiat mollis vel a erat. Vivamus vel turpis auctor lorem fringilla blandit sit amet sit amet nulla. Fusce tempus lacus sit amet felis auctor fermentum."
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://alert",
						iconColor: IconColor.Negative,
						text: "Negative lorem",
						tooltip: "Negative lorem",
						key: "key5",
						count: "1988",
						content: [
							new Label({
								text: "alert alert alert"
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://hint",
						iconColor: IconColor.Neutral,
						count: "39",
						key: "key6",
						text: "Neutral with long text",
						tooltip: "Neutral with long text",
						content: [
							new Label({
								text: "info info info"
							})
						]
					}),
					new IconTabFilter({
						visible: false,
						icon: "sap-icon://activity-items",
						iconColor: IconColor.Critical,
						count: "300",
						key: "key7",
						text: "Invisible Critical lorem",
						tooltip: "Invisible Critical lorem",
						content: [
							new Input({
								placeholder: "input placeholder"
							})
						]
					}),
					new IconTabFilter({
						visible: false,
						icon: "sap-icon://attachment",
						iconColor: IconColor.Negative,
						text: "Invisible Negative lorem",
						tooltip: "Invisible Negative lorem",
						key: "key8",
						content: [
							new MText({
								text : "Tab Notes\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque risus nulla, interdum eget posuere non, tincidunt eu felis. In hac habitasse platea  dictumst. Quisque ut ipsum est. Duis ipsum orci, interdum eget sollicitudin ac, blandit a ante. Cras congue posuere metus sed tempus. Mauris euismod, dui sit amet molestie volutpat, ipsum est viverra velit, id ultricies ante dolor et ligula. Pellentesque tincidunt fermentum lectus, eu luctus mi ultrices quis. Sed luctus nulla sit amet sapien consequat quis pretium eros tincidunt. Nullam quam erat, ultricies in malesuada non, tincidunt at nibh. Curabitur nec lectus et justo auctor tincidunt. In rhoncus risus vitae turpis suscipit eget porta metus facilisis. Vestibulum bibendum vehicula velit eu porta. Donec tincidunt rutrum lacus at egestas. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Pellentesque eu velit non quam facilisis ullamcorper.\rUt faucibus, dolor eu congue fringilla, libero leo dignissim eros, dignissim porta eros augue id orci. Phasellus in enim sed orci hendrerit accumsan. Vestibulum nibh libero, viverra sit amet pulvinar quis, molestie placerat velit. Suspendisse fringilla venenatis eleifend. Etiam in eros augue. Donec elit leo, aliquet nec vestibulum eu, blandit a lacus. Quisque ullamcorper consectetur lectus, cursus aliquam dolor consequat eu.\rProin orci turpis, rhoncus et egestas vitae, gravida nec diam. Pellentesque ante nisl, interdum id dictum ut, scelerisque at neque. Morbi egestas lobortis vestibulum. Nunc metus purus, facilisis id interdum at, rutrum at ante. Etiam euismod ultrices magna, sit amet hendrerit enim tempor sed. Quisque lacinia tempus risus, in feugiat leo dictum sit amet. Vestibulum non erat massa, ut placerat velit. In quis neque est, sed eleifend orci. Nulla ullamcorper porttitor cursus. Sed a massa tortor. Curabitur auctor, turpis et congue viverra, turpis sem eleifend justo, ut pellentesque nisl orci non leo. Ut vitae nibh eu ligula feugiat mollis vel a erat. Vivamus vel turpis auctor lorem fringilla blandit sit amet sit amet nulla. Fusce tempus lacus sit amet felis auctor fermentum."
							})
						]
					}),
					new IconTabFilter({
						visible: false,
						icon: "sap-icon://collaborate",
						iconColor: IconColor.Positive,
						text: "Invisible Positive lorem",
						tooltip: "Invisible Positive lorem",
						key: "key9",
						count: "599",
						content: [
							new MText({
								text : "Tab Notes\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque risus nulla, interdum eget posuere non, tincidunt eu felis. In hac habitasse platea  dictumst. Quisque ut ipsum est. Duis ipsum orci, interdum eget sollicitudin ac, blandit a ante. Cras congue posuere metus sed tempus. Mauris euismod, dui sit amet molestie volutpat, ipsum est viverra velit, id ultricies ante dolor et ligula. Pellentesque tincidunt fermentum lectus, eu luctus mi ultrices quis. Sed luctus nulla sit amet sapien consequat quis pretium eros tincidunt. Nullam quam erat, ultricies in malesuada non, tincidunt at nibh. Curabitur nec lectus et justo auctor tincidunt. In rhoncus risus vitae turpis suscipit eget porta metus facilisis. Vestibulum bibendum vehicula velit eu porta. Donec tincidunt rutrum lacus at egestas. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Pellentesque eu velit non quam facilisis ullamcorper.\rUt faucibus, dolor eu congue fringilla, libero leo dignissim eros, dignissim porta eros augue id orci. Phasellus in enim sed orci hendrerit accumsan. Vestibulum nibh libero, viverra sit amet pulvinar quis, molestie placerat velit. Suspendisse fringilla venenatis eleifend. Etiam in eros augue. Donec elit leo, aliquet nec vestibulum eu, blandit a lacus. Quisque ullamcorper consectetur lectus, cursus aliquam dolor consequat eu.\rProin orci turpis, rhoncus et egestas vitae, gravida nec diam. Pellentesque ante nisl, interdum id dictum ut, scelerisque at neque. Morbi egestas lobortis vestibulum. Nunc metus purus, facilisis id interdum at, rutrum at ante. Etiam euismod ultrices magna, sit amet hendrerit enim tempor sed. Quisque lacinia tempus risus, in feugiat leo dictum sit amet. Vestibulum non erat massa, ut placerat velit. In quis neque est, sed eleifend orci. Nulla ullamcorper porttitor cursus. Sed a massa tortor. Curabitur auctor, turpis et congue viverra, turpis sem eleifend justo, ut pellentesque nisl orci non leo. Ut vitae nibh eu ligula feugiat mollis vel a erat. Vivamus vel turpis auctor lorem fringilla blandit sit amet sit amet nulla. Fusce tempus lacus sit amet felis auctor fermentum."
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://alert",
						iconColor: IconColor.Negative,
						text: "Negative lorem",
						tooltip: "Negative lorem",
						key: "key10",
						count: "1900",
						content: [
							new Label({
								text: "alert alert alert"
							})
						]
					})
				]
			}),
			label4,
			new IconTabBar("itb4", {
				upperCase: true,
				items: [
					new IconTabFilter("itf3", {
						iconColor: IconColor.Default,
						text: "Lorem",
						count: "3",
						key: "k1",
						content: [
							new Label({
								text: "info info info"
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "Ipsum",
						count: "3",
						key: "key2",
						content: [
							new Input({
								placeholder: "input placeholder"
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Default,
						text: "Lorem Ipsum",
						key: "key3",
						count: "233",
						content: [
							new MText({
								text : "Tab Notes\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque risus nulla, interdum eget posuere non, tincidunt eu felis. In hac habitasse platea  dictumst. Quisque ut ipsum est. Duis ipsum orci, interdum eget sollicitudin ac, blandit a ante. Cras congue posuere metus sed tempus. Mauris euismod, dui sit amet molestie volutpat, ipsum est viverra velit, id ultricies ante dolor et ligula. Pellentesque tincidunt fermentum lectus, eu luctus mi ultrices quis. Sed luctus nulla sit amet sapien consequat quis pretium eros tincidunt. Nullam quam erat, ultricies in malesuada non, tincidunt at nibh. Curabitur nec lectus et justo auctor tincidunt. In rhoncus risus vitae turpis suscipit eget porta metus facilisis. Vestibulum bibendum vehicula velit eu porta. Donec tincidunt rutrum lacus at egestas. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Pellentesque eu velit non quam facilisis ullamcorper.\rUt faucibus, dolor eu congue fringilla, libero leo dignissim eros, dignissim porta eros augue id orci. Phasellus in enim sed orci hendrerit accumsan. Vestibulum nibh libero, viverra sit amet pulvinar quis, molestie placerat velit. Suspendisse fringilla venenatis eleifend. Etiam in eros augue. Donec elit leo, aliquet nec vestibulum eu, blandit a lacus. Quisque ullamcorper consectetur lectus, cursus aliquam dolor consequat eu.\rProin orci turpis, rhoncus et egestas vitae, gravida nec diam. Pellentesque ante nisl, interdum id dictum ut, scelerisque at neque. Morbi egestas lobortis vestibulum. Nunc metus purus, facilisis id interdum at, rutrum at ante. Etiam euismod ultrices magna, sit amet hendrerit enim tempor sed. Quisque lacinia tempus risus, in feugiat leo dictum sit amet. Vestibulum non erat massa, ut placerat velit. In quis neque est, sed eleifend orci. Nulla ullamcorper porttitor cursus. Sed a massa tortor. Curabitur auctor, turpis et congue viverra, turpis sem eleifend justo, ut pellentesque nisl orci non leo. Ut vitae nibh eu ligula feugiat mollis vel a erat. Vivamus vel turpis auctor lorem fringilla blandit sit amet sit amet nulla. Fusce tempus lacus sit amet felis auctor fermentum."
							})
						]
					})
				]
			}),
			label5,
			new IconTabBar("itb5", {
				upperCase: true,
				backgroundDesign: 'Transparent',
				items: [
					new IconTabFilter("itf5", {
						iconColor: IconColor.Negative,
						text: "Lorem",
						count: "3",
						key: "k1",
						content: [
							new Label({
								text: "info info info"
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Critical,
						enabled: false,
						text: "Ipsum",
						count: "3",
						key: "key2",
						content: [
							new Input({
								placeholder: "input placeholder"
							})
						]
					}),
					new IconTabFilter({
						iconColor: IconColor.Positive,
						text: "Lorem Ipsum",
						key: "key3",
						count: "233",
						content: [
							new MText({
								text : "Tab Notes\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque risus nulla, interdum eget posuere non, tincidunt eu felis. In hac habitasse platea  dictumst. Quisque ut ipsum est. Duis ipsum orci, interdum eget sollicitudin ac, blandit a ante. Cras congue posuere metus sed tempus. Mauris euismod, dui sit amet molestie volutpat, ipsum est viverra velit, id ultricies ante dolor et ligula. Pellentesque tincidunt fermentum lectus, eu luctus mi ultrices quis. Sed luctus nulla sit amet sapien consequat quis pretium eros tincidunt. Nullam quam erat, ultricies in malesuada non, tincidunt at nibh. Curabitur nec lectus et justo auctor tincidunt. In rhoncus risus vitae turpis suscipit eget porta metus facilisis. Vestibulum bibendum vehicula velit eu porta. Donec tincidunt rutrum lacus at egestas. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Pellentesque eu velit non quam facilisis ullamcorper.\rUt faucibus, dolor eu congue fringilla, libero leo dignissim eros, dignissim porta eros augue id orci. Phasellus in enim sed orci hendrerit accumsan. Vestibulum nibh libero, viverra sit amet pulvinar quis, molestie placerat velit. Suspendisse fringilla venenatis eleifend. Etiam in eros augue. Donec elit leo, aliquet nec vestibulum eu, blandit a lacus. Quisque ullamcorper consectetur lectus, cursus aliquam dolor consequat eu.\rProin orci turpis, rhoncus et egestas vitae, gravida nec diam. Pellentesque ante nisl, interdum id dictum ut, scelerisque at neque. Morbi egestas lobortis vestibulum. Nunc metus purus, facilisis id interdum at, rutrum at ante. Etiam euismod ultrices magna, sit amet hendrerit enim tempor sed. Quisque lacinia tempus risus, in feugiat leo dictum sit amet. Vestibulum non erat massa, ut placerat velit. In quis neque est, sed eleifend orci. Nulla ullamcorper porttitor cursus. Sed a massa tortor. Curabitur auctor, turpis et congue viverra, turpis sem eleifend justo, ut pellentesque nisl orci non leo. Ut vitae nibh eu ligula feugiat mollis vel a erat. Vivamus vel turpis auctor lorem fringilla blandit sit amet sit amet nulla. Fusce tempus lacus sit amet felis auctor fermentum."
							})
						]
					})
				]
			}),
			label6,
			new IconTabBar("itb6", {
				expanded: false,
				items: [
					new IconTabFilter("itf6", {
						icon: "sap-icon://hint",
						iconColor: IconColor.Neutral,
						count: "377",
						key: "key1",
						tooltip: "Neutral with long text",
						content: [
							new Label({
								text: "info info info"
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://activity-items",
						iconColor: IconColor.Critical,
						count: "388",
						key: "key2",
						tooltip: "Critical lorem",
						content: [
							new Input({
								placeholder: "input placeholder"
							})
						]
					}),
					new IconTabFilter({
						icon: "sap-icon://attachment",
						iconColor: IconColor.Negative,
						tooltip: "Negative lorem",
						key: "key3",
						content: [
							new MText({
								text : "Tab Notes\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque risus nulla, interdum eget posuere non, tincidunt eu felis. In hac habitasse platea  dictumst. Quisque ut ipsum est. Duis ipsum orci, interdum eget sollicitudin ac, blandit a ante. Cras congue posuere metus sed tempus. Mauris euismod, dui sit amet molestie volutpat, ipsum est viverra velit, id ultricies ante dolor et ligula. Pellentesque tincidunt fermentum lectus, eu luctus mi ultrices quis. Sed luctus nulla sit amet sapien consequat quis pretium eros tincidunt. Nullam quam erat, ultricies in malesuada non, tincidunt at nibh. Curabitur nec lectus et justo auctor tincidunt. In rhoncus risus vitae turpis suscipit eget porta metus facilisis. Vestibulum bibendum vehicula velit eu porta. Donec tincidunt rutrum lacus at egestas. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Pellentesque eu velit non quam facilisis ullamcorper.\rUt faucibus, dolor eu congue fringilla, libero leo dignissim eros, dignissim porta eros augue id orci. Phasellus in enim sed orci hendrerit accumsan. Vestibulum nibh libero, viverra sit amet pulvinar quis, molestie placerat velit. Suspendisse fringilla venenatis eleifend. Etiam in eros augue. Donec elit leo, aliquet nec vestibulum eu, blandit a lacus. Quisque ullamcorper consectetur lectus, cursus aliquam dolor consequat eu.\rProin orci turpis, rhoncus et egestas vitae, gravida nec diam. Pellentesque ante nisl, interdum id dictum ut, scelerisque at neque. Morbi egestas lobortis vestibulum. Nunc metus purus, facilisis id interdum at, rutrum at ante. Etiam euismod ultrices magna, sit amet hendrerit enim tempor sed. Quisque lacinia tempus risus, in feugiat leo dictum sit amet. Vestibulum non erat massa, ut placerat velit. In quis neque est, sed eleifend orci. Nulla ullamcorper porttitor cursus. Sed a massa tortor. Curabitur auctor, turpis et congue viverra, turpis sem eleifend justo, ut pellentesque nisl orci non leo. Ut vitae nibh eu ligula feugiat mollis vel a erat. Vivamus vel turpis auctor lorem fringilla blandit sit amet sit amet nulla. Fusce tempus lacus sit amet felis auctor fermentum."
							})
						]
					})
				]
			}),
			label11,
			new IconTabBar("itb11", {
				expanded: true,
				expandable: true,
				selectedKey: "key3",
				items: [
					new IconTabFilter("itf8", {
						icon: "sap-icon://hint",
						iconColor: IconColor.Neutral,
						count: "2 out of 10",
						design: IconTabFilterDesign.Horizontal,
						key: "key1",
						text: "Neutral with long long long text",
						tooltip: "Neutral with long long long text"

					}),
					new IconTabSeparator({icon: "sap-icon://process"}),
					new IconTabFilter({
						icon: "sap-icon://hint",
						iconColor: IconColor.Critical,
						design: IconTabFilterDesign.Horizontal,
						key: "key2",
						text: "Critical lorem long text",
						tooltip: "Critical lorem long text"
					}),
					new IconTabSeparator({icon: "sap-icon://process"}),
					new IconTabFilter({
						icon: "sap-icon://hint",
						count: "50 / 934 long counter",
						design: IconTabFilterDesign.Horizontal,
						iconColor: IconColor.Negative,
						text: "Short text",
						tooltip: "Short text",
						key: "key3"
					}),
					new IconTabSeparator({icon: "sap-icon://process"}),
					new IconTabFilter({
						icon: "sap-icon://hint",
						count: "42",
						design: IconTabFilterDesign.Horizontal,
						iconColor: IconColor.Negative,
						text: "Negative lorem",
						tooltip: "Negative lorem",
						key: "key3"
					})
				],
				content: [
					new Label({
						text: "info info info"
					})
				]
			}),
			new Label({text: " "}) // placeholder to see content below
		]
	});
	app.addPage(page);
});
