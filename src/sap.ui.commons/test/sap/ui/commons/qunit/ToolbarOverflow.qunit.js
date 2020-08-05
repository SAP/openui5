/*global QUnit, sinon */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/Button",
	"sap/ui/commons/ToolbarSeparator",
	"sap/ui/commons/TextField",
	"sap/ui/commons/ComboBox",
	"sap/ui/core/ListItem",
	"sap/ui/commons/Toolbar",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/RenderManager",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/commons/library",
	"sap/ui/layout/SplitterLayoutData",
	"sap/ui/layout/Splitter",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jqueryui/jquery-ui-position" // jQuery.fn.position
], function(
	Log,
	qutils,
	createAndAppendDiv,
	Button,
	ToolbarSeparator,
	TextField,
	ComboBox,
	ListItem,
	Toolbar,
	jQuery,
	RenderManager,
	HorizontalLayout,
	commonsLibrary,
	SplitterLayoutData,
	Splitter,
	KeyCodes
) {
	"use strict";

	// shortcut for sap.ui.commons.ToolbarSeparatorDesign
	var ToolbarSeparatorDesign = commonsLibrary.ToolbarSeparatorDesign;

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2"]);



	var aItemsOnTheSecondRow = [];

	function addManyItems(oToolbar) {
		var id = oToolbar.getId();

		// 10 buttons
		var aIcons =
				[
					"test-resources/sap/ui/commons/images/new.png",
					"test-resources/sap/ui/commons/images/open.png",
					"test-resources/sap/ui/commons/images/save.png",
					"test-resources/sap/ui/commons/images/cut.png",
					"test-resources/sap/ui/commons/images/copy.png",
					"test-resources/sap/ui/commons/images/paste2.png",
					null,
					null,
					null,
					null
				];
		var aLabels =
				[
					"",
					"",
					"",
					"",
					"",
					"",
					"Forward",
					"Process",
					"View All",
					"Approve"
				];


		// create ten buttons
		var sSeparatorId = "";
		for (var i = 0; i < 10; ++i) {
			var oButton = new Button(id + "_b_" + i, {text: aLabels[i]});
			if (aIcons[i]) {
				oButton.setIcon(aIcons[i]);
			}

			// add separators at various positions
			sSeparatorId = id + "_sep_" + i;
			if (i == 2) {
				oToolbar.addItem(new ToolbarSeparator(sSeparatorId));
			} else if (i == 5) {
				oToolbar.addItem(new ToolbarSeparator(sSeparatorId));
			} else if (i == 8) {
				oToolbar.addItem(new ToolbarSeparator(sSeparatorId, {"displayVisualSeparator": false}));
			}

			oToolbar.addItem(oButton);
		}

		// input field
		var oTextField = new TextField(id + "_tf",
				{
					value: "#0"
				});
		oToolbar.addItem(oTextField);

		// combo box for 2nd button's text
		var oComboBox = new ComboBox(id + "_cmb",
				{
					items: [
						new ListItem({text: "#1"}),
						new ListItem({text: "Do it"}),
						new ListItem({text: "Hello world"}),
						new ListItem({text: "Yet another stupid button text"})
					]
				});
		oToolbar.addItem(oComboBox);
		return oToolbar;
	}


	var oCtrl = null;
	QUnit.module("Testing Overflow", {
		beforeEach: function () {
			oCtrl = new Toolbar("Toolbar", {width: "300px"}).placeAt("uiArea1");
			addManyItems(oCtrl);
			oCtrl.placeAt("uiArea1");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			if (oCtrl) {
				oCtrl.destroy();
			}
		}
	});

	//when toolbar width is set to 300px, the first "invisible" (on the second row) item is Toolbar_b_6
	aItemsOnTheSecondRow = ["Toolbar_b_6", "Toolbar_b_7", "Toolbar_sep_8", "Toolbar_b_8", "Toolbar_b_9", "Toolbar_tf", "Toolbar_cmb"];


	QUnit.test("VisibleItems calculation with images involved", function (assert) {
		var done = assert.async();
		assert.expect(2);

		setTimeout(function () { // give the Toolbar some time to recognize the change
			assert.equal(oCtrl.getVisibleItemInfo().count, 8, "8 items should be considered visible (6 Buttons + 2 Separators)");
			assert.equal(oCtrl.iItemDomRefCount, 7, "There should be 8 items considered navigable by the ItemNavigation (6 Buttons + 1 overflow button)");
			done();
		}, 1000);
	});

	QUnit.test("Items on the second row preserves their order after close of overflow pop-up when there is at least one item with visibility=false", function (assert) {
		var done = assert.async();
		var sOverflowButtonId = oCtrl.getId() + "-mn";
		var oButton = sap.ui.getCore().byId(aItemsOnTheSecondRow[1]);
		oButton.setVisible(false);
		function clickOverflowButton() {
			var oOverflowBtnElement = oCtrl.$("mn");
			qutils.triggerKeydown(oOverflowBtnElement, KeyCodes.ARROW_DOWN, false, false, false);
		}

		setTimeout(function () { // give the Toolbar some time to recognize the change
			clickOverflowButton(); //should open
			setTimeout(function () {
				oButton.setVisible(true);
				oCtrl.popup.close(0);
				setTimeout(function () {
					var aRealSecondRowItems = [],
							aLastItemInFirstRow = document.getElementById("Toolbar_b_5"),
							nextSibling = aLastItemInFirstRow.nextSibling;
					while (nextSibling && nextSibling.id !== sOverflowButtonId) {
						aRealSecondRowItems.push(nextSibling.id);
						nextSibling = nextSibling.nextSibling;
					}
					assert.deepEqual(aRealSecondRowItems, aItemsOnTheSecondRow, "The order of the second row items must be the same after popup open->close");
					done();
				}, 1000);
			}, 1000);
		}, 1000);
	});


	QUnit.test("VisibleItems calculation with item size change", function (assert) {
		var done = assert.async();
		assert.expect(2);
		sap.ui.getCore().byId("Toolbar_b_0").setWidth("400px");

		setTimeout(function () { // give the Toolbar some time to recognize the change
			assert.equal(oCtrl.getVisibleItemInfo().count, 1, "1 item should be considered visible (1 huge Button)");
			assert.equal(oCtrl.iItemDomRefCount, 2, "There should be 2 items considered navigable by the ItemNavigation (1 huge Button + 1 overflow button)");
			done();
		}, 500);
	});


	QUnit.test("Test if emptyPopupOverflow method removes popup content from the DOM if called with the right parameter.", function (assert) {
		var done = assert.async();
		var oCtrl = new Toolbar({
			id: "Toolbar1",
			width: "180px",
			items: [
				new Button({text: 'button'}),
				new Button({text: 'button'}),
				new Button({id: 'test', text: 'button'})
			]
		}).placeAt("uiArea1");


		setTimeout(function () {
			oCtrl.handleOverflowButtonTriggered();
			setTimeout(function () {
				RenderManager.getRenderer(oCtrl).emptyOverflowPopup(oCtrl, false);
				assert.equal(jQuery('#test', oCtrl.getDomRef("pu")).length, 0);
				done();
			}, 500);
		}, 500);


	});

	QUnit.test("Test if emptyPopupOverflow method moves popup content to the toolbar when called with the right parameter and the toolbar DOM is existing", function (assert) {
		var done = assert.async();
		var oCtrl = new Toolbar({
			id: "Toolbar2",
			width: "180px",
			items: [
				new Button({text: 'button'}),
				new Button({text: 'button'}),
				new Button({id: 'test_button', text: 'button'})
			]
		}).placeAt("uiArea1");


		setTimeout(function () {
			oCtrl.handleOverflowButtonTriggered();
			setTimeout(function () {
				RenderManager.getRenderer(oCtrl).emptyOverflowPopup(oCtrl, true);
				assert.equal(oCtrl.getDomRef("pu").hasChildNodes(), false);
				assert.equal(jQuery('#test_button', oCtrl.getDomRef()).length, 1);
				done();
			}, 500);
		}, 500);
	});

	QUnit.test("Test if emptyPopupOverflow method throws error if it has to move popup contents to the toolbar when the toolbar DOM is not existing;", function (assert) {
		var done = assert.async();
		var oCtrl = new Toolbar({
			id: "Toolbar3",
			width: "180px",
			items: [
				new Button({text: 'button'}),
				new Button({text: 'button'}),
				new Button({text: 'button'})
			]
		}).placeAt("uiArea1");


		setTimeout(function () {
			oCtrl.handleOverflowButtonTriggered();
			setTimeout(function () {
				var aButtonAttributes = {
					type: 'button',
					id: '__button2',
					'data-sap-ui': '__button2',
					role: 'button',
					'aria-disabled': 'false',
					tabindex: '0',
					'class': 'sapUiBtn sapUiBtnNorm sapUiBtnS sapUiBtnStd'
				};

				var oDiv = document.createElement('div');
				var oButton = document.createElement('button');
				var oButtonText = document.createTextNode("button");
				oButton.appendChild(oButtonText);
				for (var sAttributeName in aButtonAttributes) {
					oButton.setAttribute(sAttributeName, aButtonAttributes[sAttributeName]);
				}
				oDiv.appendChild(oButton);

				oCtrl.getDomRef = sinon.stub(oCtrl, 'getDomRef').returns(null);
				oCtrl.getDomRef.withArgs("pu").returns(oDiv);

				var oErrorSpy = sinon.spy(Log, 'error');
				RenderManager.getRenderer(oCtrl).emptyOverflowPopup(oCtrl);
				oCtrl.getDomRef.restore();

				assert.equal(oErrorSpy.withArgs("The renderer 'sap.ui.commons.ToolbarRenderer' cannot empty the toolbar overflow popup.").calledOnce, true);

				oErrorSpy.restore();

				done();
			}, 500);
		}, 500);
	});

	QUnit.test("Test if when opened the overflow popup is causing a (bug) toolbar resize when the toolbar is nested in horizontal layout.", function(assert) {
		var done = assert.async();
		var oCtrl = new Toolbar({
			id: 'Toolbar4',
			items: [
				new Button({text: 'button'}),
				new Button({text: 'button'}),
				new Button({text: 'button'}),
				new Button({text: 'button'}),
				new Button({text: 'button'}),
				new Button({text: 'button'}),
				new Button({text: 'button'}),
				new Button({text: 'button'}),
				new Button({text: 'button'}),
				new Button({text: 'button'}),
				new Button({text: 'button'}),
				new Button({text: 'button'})
			],
			rightItems: [
				new Button({text: 'Right'})
			]
		});

		var testLayout = new HorizontalLayout({
			content: [
				oCtrl
			],
			allowWrapping: false
		});
		testLayout.placeAt('uiArea2');


		jQuery('#uiArea2').css('width', '400');

		setTimeout(function() {
			var btn = oCtrl.getDomRef('mn');
			btn.click();
			setTimeout(function() {
				btn.click();
				setTimeout(function() {
					btn.click();
					setTimeout(function() {
						var pu = oCtrl.getDomRef('pu');
						// if the popup is still visible, it means resize was not triggered (causing the popup to close)
						assert.equal(jQuery(pu).css('visibility'), 'visible', 'Popup is properly visible');
						assert.equal(jQuery('#Toolbar4-pu button').length, 7, 'There are seven buttons in the popup.');
						btn.click();
						jQuery('#uiArea2').css('width', '600');
						setTimeout(function() {
							btn.click();
							assert.equal(jQuery('#Toolbar4-pu button').length, 3, 'There are three buttons in the popup - toolbar resizing still works after popup opening/closing.');
							btn.click();
							done();
						}, 500);
					}, 500);
				}, 500);
			}, 500);
		}, 500);
	});

	QUnit.test("Test invisible (API property visible=false) items must not break the overflow mechanism", function (assert) {
		/* Toolbar (145px width) with 3 invisible (visible = false) and 3 visible items (all with width 50px).
		 As there is no space for the 3th visible item, it goes into the overflow*/

		var done = assert.async(),
				oButtonA = new Button("idButtonA", {text: "A", width: "50px"}),
				oButtonB = new Button("idButtonB", {text: "B", width: "50px", visible: false}),
				oButtonC = new Button("idButtonC", {text: "C", width: "50px", visible: false}),
				oButtonD = new Button("idButtonE", {text: "D", width: "50px"}),
				oButtonE = new Button("idButtonF", {text: "E", width: "50px", visible: false}),
				oButtonF = new Button("idButtonG", {text: "F", width: "50px"}),
				aItems = [oButtonA, oButtonB, oButtonC, oButtonD, oButtonE, oButtonF],
				aExpectedItemsInTheOverflow = [oButtonF.getId()];

		var oCtrl = new Toolbar({
			items: aItems,
			width: "145px"
		}).placeAt("uiArea1");

		setTimeout(function () {
			clickOverflowButton(oCtrl);
			setTimeout(function () {
				assert.ok(isPopupVisible(oCtrl), "The popup must be visible");
				var aPopupContent = getPopupContentIds(oCtrl);
				assert.deepEqual(aPopupContent, aExpectedItemsInTheOverflow, "There must be just 1 items in the overflow -F");
				done();
			}, 1000);
		}, 500);
	});

	QUnit.test("Check if a very long button is now getting out of the overflow popup (CSS 1570140661).", function(assert) {
		var done = assert.async();
		var oCtrl = new Toolbar({
			id: 'Toolbar5',
			width: '300px',
			items: [
				new Button({text: 'button'}),
				new Button({text: 'button'}),
				new Button({text: 'button'}),
				new Button({id: 'testButton' ,text: 'A long button label is causing the problem, let\'s see'})
			]
		});

		oCtrl.placeAt('uiArea1');


		setTimeout(function () {
			oCtrl.getDomRef('mn').click();
			setTimeout(function () {
				checkTestButtonDoesNotExpandFromOverflowPopup(assert, oCtrl, "testButton");
				done();
			}, 500);
		}, 500);
	});

	QUnit.test("Overflow buttons with width less than popup default does not change popup's width", function(assert) {
		var done = assert.async();
		var oCtrl = new Toolbar({
			id: 'Toolbar6',
			width: '300px',
			items: [
				new Button({text: 'button', width : "130px"}),
				new Button({text: 'button', width : "130px"}),
				new Button("testOverflowButton",{text: 'button', width : "130px"})
			]
		});
		oCtrl.placeAt('uiArea1');
		setTimeout(function () {
			oCtrl.getDomRef('mn').click();
			setTimeout(function () {
				var oPopupParent = jQuery(oCtrl.getDomRef('pu').parentNode);
				checkTestButtonDoesNotExpandFromOverflowPopup(assert, oCtrl, "testOverflowButton");
				assert.equal(oPopupParent.width(), 222 /*Width in class sapUiTbDD */, "The width of the popup should not change.");
				done();
			}, 500);
		}, 500);
	});

	QUnit.test("Overflow button is not visible when the first item is FullHeight Separator and there is an invisible item",
			function(assert) {
		var oCtrl = new Toolbar({
			id: 'Toolbar7',
			width: '300px',
			items: [
				new ToolbarSeparator({design: ToolbarSeparatorDesign.FullHeight}),
				new Button({icon: "sap-icon://competitor"}),
				new Button({icon: "sap-icon://delete", visible: false})
			]
		});
		oCtrl.placeAt('uiArea1');
		assert.equal(isOverflowVisible(oCtrl), false, "Overflow button must not be visible");
	});

	QUnit.test("Overflow menu in popup is deleted upon toolbar destroy", function (assert) {
		oCtrl.handleOverflowButtonTriggered();
		assert.ok(getPopupDomRef(oCtrl), "Overflow menu must be part of the dom");
		oCtrl.destroy();
		assert.ok(!getPopupDomRef(oCtrl), "Once the toolbar is destroyed, the overflow menu must not be part of the dom");
	});

	QUnit.test("Overflow button is visible when toolbar is insdie sap.ui.layout.Splitter and there is not free space", function (assert) {
		var done = assert.async();
		var oToolbar = new Toolbar("tb14", {
			items: [
				new Button({text: 'Area 1.1'}).setWidth("100px"),
				new Button({text: 'Area 1.2'}).setWidth("100px"),
				new Button({text: 'Area 1.3'}).setWidth("100px")
			],
			layoutData: new SplitterLayoutData({size: "50%"})
		});

		var oSplitter = new Splitter({contentAreas: [oToolbar, new Button({text: 'Area 2.1'})]});
		oSplitter.setWidth("500px"); //so the available space for the toolbar is 250px
		oSplitter.placeAt("uiArea1");
		setTimeout(function() {
			assert.ok(isOverflowVisible(oToolbar), "Overflow button must be visible");
			done();
			oSplitter.destroy();
		}, 500);
	});


	// ==================================================
	//          helper functions
	// ==================================================


	/*
	 * Returns the overflow popup DomRef for oCtrl or null if it does not exist
	 */
	function getPopupDomRef(oToolbar) {
		return oToolbar.getDomRef("pu");
	}
	function isPopupVisible(oToolbar) {
		return oToolbar.$("pu").css("display") === "block";
	}
	function isOverflowVisible(oToolbar) {
		return oToolbar.$("mn").css("display") === "block";
	}
	function getPopupContentIds(oToolbar) {
		var oPopup = getPopupDomRef(oToolbar);
		var sIds = [];
		var oCurrent = oPopup.firstChild;
		while (oCurrent) {
			sIds.push(oCurrent.id);
			oCurrent = oCurrent.nextSibling;
		}
		return sIds;
	}

	function clickOverflowButton(oToolbar) {
		var oOverflowBtnElement = oToolbar.$("mn");
		qutils.triggerKeydown(oOverflowBtnElement, KeyCodes.ARROW_DOWN, false, false, false);
	}

	function checkTestButtonDoesNotExpandFromOverflowPopup(assert, oCtrl, buttonId) {
		var oTestButton = jQuery('#' + buttonId);
		var oPopup = oCtrl.$('pu');

		var iButtonRightPosition = oTestButton.position().left + oTestButton.width();
		var iToolbarRightPosition = oPopup.position().left + oPopup.width();
		var bIsExpanding = (iButtonRightPosition) >= (iToolbarRightPosition);

		assert.equal(false, bIsExpanding, 'Button is not expanding from the overflow popup');
	}
});