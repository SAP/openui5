sap.ui.require([
	"sap/m/App",
	"sap/m/Bar",
	"sap/m/Button",
	"sap/m/Carousel",
	"sap/m/Dialog",
	"sap/m/FlexItemData",
	"sap/m/IconTabBar",
	"sap/m/IconTabFilter",
	"sap/m/Image",
	"sap/m/Input",
	"sap/m/ObjectAttribute",
	"sap/m/ObjectHeader",
	"sap/m/ObjectStatus",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/m/RatingIndicator",
	"sap/m/Text",
	"sap/ui/core/library",
	"sap/ui/layout/FixFlex",
	"sap/ui/table/AnalyticalTable",
	"sap/ui/table/rowmodes/Auto"
], function(App, Bar, Button, Carousel, Dialog, FlexItemData, IconTabBar, IconTabFilter, Image, Input,  ObjectAttribute, ObjectHeader, ObjectStatus, Page, Panel, RatingIndicator,  Text, coreLibrary, FixFlex, AnalyticalTable, AutoRowMode) {
	"use strict";

	var IconColor = coreLibrary.IconColor;
	var ValueState = coreLibrary.ValueState;

	var app = new App('myApp', {
		initialPage: 'page1'
	});

	/* =============================================
	 * Page 1!
	 * ============================================ */

	var oFixFlexColumn = new FixFlex({
		minFlexSize: 450,

		fixContent: [new Panel({
			expandable: true,
			expanded: false,
			headerText: "Panel with a header text",
			content: new Button({
				text: 'Dummy Button'
			})
		})],

		flexContent: new Carousel({
			height:'80%',

			pages: [new Image({
				src: "../../../../test-resources/sap/ui/documentation/sdk/images/HT-6100-large.jpg",
				alt: "item HT-6100",
				decorative: false,
				tooltip: "HT-6100"
			}), new Image({
				src: "../../../../test-resources/sap/ui/documentation/sdk/images/HT-1112.jpg",
				alt: "item HT-1112",
				decorative: false,
				tooltip: "HT-1112"
			})]
		})

	});

	var page1 = new Page('page1', {
		title: 'FixFlex vertical layout',
		enableScrolling: true,
		content: [oFixFlexColumn],
		footer: fnCreateNavigation()
	});

	/* =============================================
	 * Page 2!
	 * ============================================ */

	var oFixFlexHorizontal = new FixFlex({
		fixFirst: false,
		vertical: false,
		minFlexSize: 455,


		fixContent: [
			// Dummy button
			new Button({
				text: 'Dummy Button'
			}),
			// Dummy button
			new Button({
				text: 'Dummy Button'
			})],

		flexContent: new Carousel({
			width: '50%',

			pages: [new Image({
				src: "../../../../test-resources/sap/ui/documentation/sdk/images/HT-6100-large.jpg",
				alt: "item HT-6100",
				decorative: false,
				tooltip: "HT-6100"
			}), new Image({
				src: "../../../../test-resources/sap/ui/documentation/sdk/images/HT-1112.jpg",
				alt: "item HT-1112",
				decorative: false,
				tooltip: "HT-1112"
			})]
		})
	});

	var page2 = new Page('page2', {
		title: 'FixFlex horizontal layout',
		enableScrolling: false,
		content: [oFixFlexHorizontal],
		footer: fnCreateNavigation()
	});

	/* =============================================
	 * Page 3!
	 * ============================================ */

	var oFixFlex3 = new FixFlex({
		fixContent: [new ObjectHeader("oh1Small", {
			responsive: true,
			backgroundDesign: "Translucent",
			intro: "Type XS",
			title: "Example 2 Small container",
			number: "624,00",
			numberUnit: "Euro",
			fullScreenOptimized: false,
			showMarkers: false,
			markFlagged: true,
			markFavorite: true,
			numberState: ValueState.Success,
			attributes: [
				new ObjectAttribute({
					title: "Manufacturer",
					text: "ACME Corp",
					active: true
				})
			],
			statuses: [
				new ObjectStatus({
					title: "Approval",
					text: "Pending",
					state: ValueState.Warning

				})
			]
		})],

		flexContent: new IconTabBar({
			upperCase: true,
			stretchContentHeight: true,
			backgroundDesign: "Transparent",
			applyContentPadding: false,
			layoutData: new FlexItemData({
				growFactor: 1
			}),

			items: [new IconTabFilter({
				iconColor: IconColor.Default,
				text: 'Lorem',
				count: '3',
				key: 'k1',
				content: [new AnalyticalTable({
					rowMode: new AutoRowMode({
						rowContentHeight: 32
					}),
					selectionMode: 'MultiToggle'
				})]
			}), new IconTabFilter({
				iconColor: IconColor.Default,
				text: 'Ipsum',
				count: '3',
				key: 'key2',
				content: [new Input({
					placeholder: 'input placeholder'
				})]
			}), new IconTabFilter({
				iconColor: IconColor.Default,
				text: 'Lorem Ipsum',
				key: 'key3',
				count: '233',
				content: [new RatingIndicator({
					value: 3
				})]
			})]

		})
	});

	var page3 = new Page('page3', {
		title: 'Table with ObjectHeader',
		enableScrolling: false,
		content: [oFixFlex3],
		footer: fnCreateNavigation()
	});

	/* =============================================
	 * Page 4!
	 * ============================================ */

	var oFixFlexNoFix = new FixFlex({
		fixContent: [],

		flexContent: new IconTabBar({
			upperCase: true,
			stretchContentHeight: true,
			backgroundDesign: "Transparent",
			applyContentPadding: false,
			layoutData: new FlexItemData({
				growFactor: 1
			}),

			items: [new IconTabFilter({
				iconColor: IconColor.Default,
				text: 'Lorem',
				count: '3',
				key: 'k1',
				content: [new AnalyticalTable({
					rowMode: new AutoRowMode({
						rowContentHeight: 32
					}),
					selectionMode: 'MultiToggle'
				})]
			}), new IconTabFilter({
				iconColor: IconColor.Default,
				text: 'Ipsum',
				count: '3',
				key: 'key2',
				content: [new Input({
					placeholder: 'input placeholder'
				})]
			}), new IconTabFilter({
				iconColor: IconColor.Default,
				text: 'Lorem Ipsum',
				key: 'key3',
				count: '233',
				content: [new RatingIndicator({
					value: 3
				})]
			})]

		})
	});

	var page4 = new Page('page4', {
		title: 'FixFlex with no Fix content',
		enableScrolling: false,
		content: [oFixFlexNoFix],
		footer: fnCreateNavigation()
	});

	/* =============================================
	 * Page 6!
	 * ============================================ */

	var oFixFlex6 = new FixFlex({
		vertical: false,

		fixContent: [
			// Dummy button
			new Button({
				text: 'Dummy Button'
			}),
			// Dummy button
			new Button({
				text: 'Dummy Button'
			})],

		flexContent: new IconTabBar({
			upperCase: true,
			layoutData: new FlexItemData({
				growFactor: 1
			}),

			items: [new IconTabFilter({
				iconColor: IconColor.Default,
				text: 'Lorem',
				count: '3',
				key: 'k1',
				content: [new AnalyticalTable({
					rowMode: new AutoRowMode({
						rowContentHeight: 32
					}),
					selectionMode: 'MultiToggle'
				})]
			}), new IconTabFilter({
				iconColor: IconColor.Default,
				text: 'Ipsum',
				count: '3',
				key: 'key2',
				content: [new Input({
					placeholder: 'input placeholder'
				})]
			}), new IconTabFilter({
				iconColor: IconColor.Default,
				text: 'Lorem Ipsum',
				key: 'key3',
				count: '233',
				content: [new RatingIndicator({
					value: 3
				})]
			})]

		})
	});

	var page6 = new Page('page6', {
		title: 'FixFlex horizontal with ITB',
		enableScrolling: false,
		content: [oFixFlex6],
		footer: fnCreateNavigation()
	});

	/* =============================================
	 * Page 7!
	 * ============================================ */

	var oFixFlex7 = new FixFlex({

		fixContent: [
			// Dummy button
			new Button({
				text: 'Dummy Button'
			}),
			// Dummy button
			new Button({
				text: 'Dummy Button'
			})],

		flexContent: new IconTabBar({
			upperCase: true,
			layoutData: new FlexItemData({
				growFactor: 1
			}),

			items: [new IconTabFilter({
				iconColor: IconColor.Default,
				text: 'Lorem',
				count: '3',
				key: 'k1',
				content: [new Text({
					text: 'Lorem Ipsum'
				})]
			}), new IconTabFilter({
				iconColor: IconColor.Default,
				text: 'Ipsum',
				count: '3',
				key: 'key2',
				content: [new Input({
					placeholder: 'input placeholder'
				})]
			}), new IconTabFilter({
				iconColor: IconColor.Default,
				text: 'Lorem Ipsum',
				key: 'key3',
				count: '233',
				content: [new RatingIndicator({
					value: 3
				})]
			})]

		})
	});

	var oDialog = new Dialog({
		title: "Some Title",
		contentWidth: "90%",
		contentHeight: "500px",
		content: [
			new Page({
				title: 'Test Page',
				enableScrolling: false,
				content: oFixFlex7
			})
		],
		buttons: [
			new Button({
				text: "Close",
				press: function (oEvent) {
					oDialog.close();
				}
			})
		]
	}).setVerticalScrolling(true).setHorizontalScrolling(true);

	var page7 = new Page('page7', {
		title: 'FixFlex in a Dialog',
		enableScrolling: false,
		content: new Button({
			text: "Open Dialog",
			press: function (oEvent) {
				oDialog.open();
			}
		}),
		footer: fnCreateNavigation()
	});

	/* =============================================
	 * Navigation
	 * ============================================ */
	function fnCreateNavigation() {
		return new Bar({
			contentMiddle: [new Button({
				text: 'FixFlex Vertical',
				press: function () {
					app.to('page1');
				}
			}), new Button({
				text: 'FixFlex Horizontal',
				press: function () {
					app.to('page2');
				}
			}), new Button({
				text: 'FixFlex with ObjectHeader',
				press: function () {
					app.to('page3');
				}
			}), new Button({
				text: 'FixFlex with no Fix content',
				press: function () {
					app.to('page4');
				}
			}), new Button({
				text: 'FixFlex Horizontal ITB',
				press: function () {
					app.to('page6');
				}
			}), new Button({
				text: 'FixFlex in a Dialog',
				press: function () {
					app.to('page7');
				}
			})]
		});
	}

	app.addPage(page1).addPage(page2).addPage(page3).addPage(page4).addPage(page6).addPage(page7).placeAt('body');
});
