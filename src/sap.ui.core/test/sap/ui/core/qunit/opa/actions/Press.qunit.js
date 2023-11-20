/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/test/actions/Press",
	"sap/m/Button",
	"sap/m/Link",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/IconTabBar",
	"sap/m/IconTabFilter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/core/util/MockServer",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/core/Item",
	"sap/m/Label",
	"sap/m/Input",
	"sap/f/GridContainer",
	"sap/m/GenericTile",
	"sap/m/SearchField",
	"sap/m/Page",
	"sap/m/App",
	"sap/m/semantic/FullscreenPage",
	"sap/m/semantic/DetailPage",
	"sap/m/CheckBox",
	"sap/m/ComboBox",
	"sap/m/OverflowToolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/library",
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery",
	"sap/m/ObjectIdentifier",
	"sap/m/ObjectStatus",
	"sap/m/inputUtils/ListHelpers",
	"sap/m/Slider",
	"sap/m/RatingIndicator",
	"sap/ui/core/UIArea",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/m/OverflowToolbarLayoutData"
],
function(Press,
		 Button,
		 Link,
		 List,
		 StandardListItem,
		 IconTabBar,
		 IconTabFilter,
		 JSONModel,
		 ODataModel,
		 MockServer,
		 Table,
		 Column,
		 Item,
		 Label,
		 Input,
		 GridContainer,
		 GenericTile,
		 SearchField,
		 Page,
		 App,
		 FullscreenPage,
		 DetailPage,
		 CheckBox,
		 ComboBox,
		 OverflowToolbar,
		 ToolbarSpacer,
		 mobileLibrary,
		 Opa5,
		 opaTest,
		 AggregationLengthEquals,
		 PropertyStrictEquals,
		 Log,
		 $,
		 ObjectIdentifier,
		 ObjectStatus,
		 ListHelpers,
		 Slider,
		 RatingIndicator,
		 UIArea,
		 nextUIUpdate,
		 OverflowToolbarLayoutData
){
	"use strict";

	// shortcuts for types from sap.m.library
	var ButtonType = mobileLibrary.ButtonType;
	var ListMode = mobileLibrary.ListMode;
	var OverflowToolbarPriority = mobileLibrary.OverflowToolbarPriority;

	// stack contains controls to be destroyed
	// and emptied after each test
	var aControlsToClean = [];

	$("#qunit-fixture").css("position", "static");

	QUnit.module("positive tests",{
		beforeEach: function() {
			this.oSpy = sinon.spy(Log, "debug");
		},
		afterEach: function() {
			while (aControlsToClean.length) {
				//Clean up controls after each test
				aControlsToClean.pop().destroy();
			}
			this.oSpy.restore();
		}
	});


	[{
		control: new Page({
			showNavButton: true
		}),
		event: "NavButtonPress"
	},{
		control: new FullscreenPage({
			showNavButton: true
		}),
		event: "NavButtonPress"
	},{
		control: new DetailPage({
			showNavButton: true
		}),
		event: "NavButtonPress"
	},{
		control: new Button(),
		event: "Press"
	},{
		control: new Link(),
		event: "Press"
	},{
		control: new CheckBox(),
		event: "Select"
	}, {
		control: new Input({
			showValueHelp: true
		}),
		event: "ValueHelpRequest"
	}].forEach(function (oTestCase) {
		QUnit.test("Should press a " + oTestCase.control.getMetadata().getName(), async function (assert) {
			var fnDone = assert.async();

			// Arrange
			var oControl = oTestCase.control;
			aControlsToClean.push(oControl);
			oControl.placeAt("qunit-fixture");
			//Make sure that the control is rendered
			await nextUIUpdate();

			// System under Test
			var oPressAction = new Press();

			oControl["attach" + oTestCase.event]( function () {
				setTimeout(function () {
					sinon.assert.calledWith(this.oSpy, sinon.match(/Pressed the control/), oPressAction._sLogPrefix);
					sinon.assert.called(fnOnSapFocusInSpy);
					//Focusleave check has been removed due to fixed Press action behavior
					//since in real scenario manual press action does not fire focusout event
					fnDone();
				}.bind(this), 20);
			}, this);

			// if no focus functions are defined - define them to spy on them
			if (!oControl.onfocusin) {
				oControl.onfocusin = $.noop;
			}
			if (!oControl.onsapfocusleave) {
				oControl.onsapfocusleave = $.noop;
			}

			var fnOnSapFocusInSpy = sinon.spy(oControl, "onfocusin");
			// var fnOnSapFocusLeaveSpy = sinon.spy(oControl, "onsapfocusleave");

			// Act
			oPressAction.executeOn(oControl);
		});
	});

	QUnit.test("Should request focus and trigger a 'press' event on an StandardListItem of type 'active'", async function(assert) {
		var done = assert.async();

		// Arrange
		var oFirstListItem = new StandardListItem({
				title: "List Item Press",
				type: "Active"
			}),
			oList = new List({
				headerText: "Press Test",
				items: [oFirstListItem]
			});
		oList.placeAt("qunit-fixture");
		//No need to add oFirstListItem as it will be
		//cleaned up by its list
		aControlsToClean.push(oList);

		//Make sure that button is rendered
		await nextUIUpdate();

		// System under Test
		var oPressAction = new Press();

		oFirstListItem.attachPress(function () {
			assert.ok(true, "Press Event has been triggered");
			assert.ok($(document.activeElement).is(oFirstListItem.$()), "List Item has focus");
			//Call 'done' to resume qunit processing
			done();
		}, this);

		// Act
		oPressAction.executeOn(oFirstListItem);
	});

	QUnit.test("Should press a button using key modifiers", async function(assert) {
		var done = assert.async();

		// Arrange
		var oButton = new Button({id: "_button1"});
		oButton.placeAt("qunit-fixture");

		aControlsToClean.push(oButton);

		//Make sure that button is rendered
		await nextUIUpdate();

		// System under Test
		var oPressAction = new Press({altKey: true, ctrlKey: true, shiftKey: true});

		// create onclick listener
		$("#_button1").on("click", function(oEvent) {

			assert.ok(true, "Press Event has been triggered");
			assert.ok(oEvent.altKey, "Alt key modifier is pressed");
			assert.ok(oEvent.ctrlKey, "Ctrl key modifier is pressed");
			assert.ok(oEvent.shiftKey, "Shift key modifier is pressed");

			//Call 'done' to resume qunit processing
			done();
		});

		// Act
		oPressAction.executeOn(oButton);
	});

	QUnit.test("Should use X percent for selecting slider value", async function(assert) {
		var done = assert.async();

		// Arrange
		var oSlider = new Slider();
		oSlider.placeAt("qunit-fixture");

		aControlsToClean.push(oSlider);

		//Make sure that button is rendered
		await nextUIUpdate();

		// System under Test
		var oPressAction = new Press({idSuffix: "inner", xPercentage: 80});

		oSlider.attachEvent("liveChange", function(oControl){
			assert.ok(true, "Press Event has been triggered");
			assert.ok(oControl.mParameters.value === 80, "Slider has value of 80");

			done();
		});

		// Act
		oPressAction.executeOn(oSlider);
	});

	QUnit.test("Should use X perecent value for RatingIndicator", async function(assert) {
		var done = assert.async();

		// Arrange
		var oRatingIndicator = new RatingIndicator();
		oRatingIndicator.placeAt("qunit-fixture");

		aControlsToClean.push(oRatingIndicator);

		//Make sure that button is rendered
		await nextUIUpdate();

		// System under Test
		var oPressAction = new Press({xPercentage: 15});

		oRatingIndicator.attachEvent("change", function(oControl){
			assert.ok(true, "Press Event has been triggered");
			assert.ok(oControl.mParameters.value === 1, "RatingIndicator has value of 1 star");

			done();
		});

		// Act
		oPressAction.executeOn(oRatingIndicator);
	});

	QUnit.test("List should fire selection change event", async function(assert) {
		var done = assert.async();

		// Arrange
		var oFirstListItem = new StandardListItem({
					title: "Initially selected item",
					type: "Active"
				}),
				oSecondListItem = new StandardListItem({
					title: "Pressed upon during test",
					type: "Active"
				}),
				oList = new  List({
					headerText: "Selection Change Test",
					mode: ListMode.SingleSelectMaster,
					items : [oFirstListItem, oSecondListItem]
				});
		oList.setSelectedItem(oFirstListItem);
		oList.placeAt("qunit-fixture");

		//No need to add the list items as they will be
		//cleaned up by its list
		aControlsToClean.push(oList);

		//Make sure that button is rendered
		await nextUIUpdate();

		// System under Test
		var oPressAction = new Press();

		oList.attachSelectionChange(function () {
			assert.ok(true, "Selection change has been triggered");
			assert.ok($(document.activeElement).is(oSecondListItem.$()), "Pressed List Item has focus");
			assert.ok(oSecondListItem.getSelected(), "Pressed List Item is selected");
			//Call 'done' to resume qunit processing
			done();
		}, this);

		// Act
		oPressAction.executeOn(oSecondListItem);
	});

	QUnit.test("IconTabBar should fire selection change event", async function(assert) {
		var done = assert.async();

		// Arrange
		var oFirstTab = new IconTabFilter({
					key: "foo"
				}),
			oSecondTab = new IconTabFilter({
				key: "bar"
			}),
			oTabBar = new  IconTabBar({
				items : [oFirstTab, oSecondTab]
			});
		oTabBar.setSelectedItem(oFirstTab);
		oTabBar.placeAt("qunit-fixture");

		//No need to add the list items as they will be
		//cleaned up by its tabbar
		aControlsToClean.push(oTabBar);

		//Make sure that button is rendered
		await nextUIUpdate();

		// System under Test
		var oPressAction = new Press();

		oTabBar.attachSelect(function () {
			assert.ok(true, "Select has been triggered");
			assert.ok($(document.activeElement).is(oSecondTab.$()), "Pressed Tab has focus");
			assert.strictEqual(oTabBar.getSelectedKey(), "bar", "Pressed Tab is selected");
			//Call 'done' to resume QUnit processing
			done();
		}, this);

		// Act
		oPressAction.executeOn(oSecondTab);
	});

	QUnit.test("Should be able to press a row in the sap.ui.table.Table", async function(assert) {
		// Arrange
		var oTable = new Table({
				selectionBehavior: "Row"
			}),
			done = assert.async(),
			aData = [
				{lastName: "Dente"},
				{lastName: "Friese"},
				{lastName: "Mann"}
			],
			oModel = new JSONModel();
		oModel.setData({ modelData: aData });

		oTable.addColumn(new Column({
			template: new Label({ text: "{lastName}"})
		}));
		oTable.setModel(oModel);
		oTable.bindRows("/modelData");
		oTable.placeAt("qunit-fixture");


		aControlsToClean.push(oTable);

		await nextUIUpdate();

		// System under Test
		var oPressAction = new Press();

		oTable.attachRowSelectionChange(function () {
			// Assert
			assert.ok(true, "Fired the event");
			done();
		});

		// Act
		oPressAction.executeOn(oTable.getRows()[1].getCells()[0]);
	});

	QUnit.test("Should press a Tile in a Tile container", async function (assert) {
		var done = assert.async(),
				oTile = new GenericTile(),
				oGridContainer = new GridContainer({
					items: oTile
				});

		oGridContainer.placeAt("qunit-fixture");

		aControlsToClean.push(oGridContainer);

		await nextUIUpdate();

		// System under Test
		var oPressAction = new Press();

		oTile.attachPress(function () {
			// Assert
			assert.ok(true, "Fired the event");
			done();
		});

		// Act
		oPressAction.executeOn(oTile);
	});

	(function () {
		var oModel;
		var oMockServer;
		var oList;

		QUnit.module("Growing list with press", {
			beforeEach: function () {
				oList = new List({
					growing : true,
					growingThreshold: 1,
					items : {
						path : "/Products",
						template : new StandardListItem()
					}
				});
				oList.placeAt("qunit-fixture");
				return nextUIUpdate();

			},
			afterEach: function () {
				if (oMockServer) {
					oMockServer.stop();
					oMockServer.destroy();
				}
				oModel.destroy();
				oList.destroy();
			}
		});


		[
			{
				createModel: function () {
					oModel = new JSONModel();
					oModel.setData({ Products: [{}, {}]});
				},
				name: "List should load more items with JSON"
			},
			{
				createModel: function () {
					var sServerUrl = "/myODataService/";
					oMockServer = new MockServer({ rootUri : sServerUrl});

					MockServer.config({
						autoRespond : true,
						autoRespondAfter : 0
					});

					oMockServer.simulate(sap.ui.require.toUrl("test-resources/sap/ui/core/testdata/annotations/metadata.xml"), {
						bGenerateMissingMockData : true
					});

					oMockServer.start();

					oModel = new ODataModel(sServerUrl);
				},
				name: "List should load more items with ODATA"
			}
		].forEach(function (oTest) {
			Opa5.extendConfig({autoWait: true});

			opaTest(oTest.name, function(oOpa) {

				oTest.createModel();
				oList.setModel(oModel);

				oOpa.waitFor({
					id: oList.getId(),
					matchers: new AggregationLengthEquals({name: "items", length: 1}),
					success: function () {
						Opa5.assert.ok(true, "Table items loaded");
					},
					errorMessage: "Table items not loaded"
				});

				oOpa.waitFor({
					id: oList.getId(),
					actions: new Press(),
					errorMessage: "Can't find More button"
				});

				oOpa.waitFor({
					id: oList.getId(),
					matchers: new AggregationLengthEquals({name: "items", length: 2}),
					success: function () {
						Opa5.assert.ok(true, "Table growth triggered");
					},
					errorMessage: "Table growth not triggered"
				});
			});
		});
	})();

	QUnit.module("Press - interact with ObjectIdentifier", {
		beforeEach: function() {
			this.oObjectIdentifier = new ObjectIdentifier();
			this.oObjectIdentifier.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach: function() {
			this.oObjectIdentifier.destroy();
		}
	});

	QUnit.test("Should press active ObjectIdentifier - press adapter", async function (assert) {
		var done = assert.async();
		this.oObjectIdentifier.setTitle("sampleTitle");
		this.oObjectIdentifier.setTitleActive(true);
		await nextUIUpdate();

		var oPressAction = new Press();

		$("a").on("click", function () {
			assert.ok(true, "Executed press action on link");
			done();
		});

		oPressAction.executeOn(this.oObjectIdentifier);
	});

	QUnit.test("Should press inactive ObjectIdentifier - press adapter", async function (assert) {
		var done = assert.async();
		this.oObjectIdentifier.setTitle("sampleTitle");
		this.oObjectIdentifier.setTitleActive(false);
		this.oObjectIdentifier.setText("sampleText");
		await nextUIUpdate();

		var oPressAction = new Press();
		var that = this;

		$(".sapMObjectIdentifierTitle").on("click", async function () {
			assert.ok(true, "Executed press action on title");

			that.oObjectIdentifier.setTitle(null);
			await nextUIUpdate();

			$(".sapMObjectIdentifierText").on("click", function () {
				assert.ok(true, "Executed press action on text");
				done();
			});

			oPressAction.executeOn(that.oObjectIdentifier);
		});

		oPressAction.executeOn(this.oObjectIdentifier);
	});

	QUnit.test("Should press ObjectIdentifier - missing press adapter", function (assert) {
		var done = assert.async();
		var oPressAction = new Press();

		$(".sapMObjectIdentifier").on("click", function () {
			assert.ok(true, "Executed press action on link");
			done();
		});

		oPressAction.executeOn(this.oObjectIdentifier);
	});

	QUnit.module("Press - interact with ObjectStatus", {
		beforeEach: function() {
			this.oObjectStatus = new ObjectStatus();
			this.oObjectStatus.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach: function() {
			this.oObjectStatus.destroy();
		}
	});

	QUnit.test("Should press active ObjectStatus - press adapter", async function (assert) {
		var done = assert.async();
		this.oObjectStatus.setActive(true);
		this.oObjectStatus.setText("foo");
		await nextUIUpdate();

		var oPressAction = new Press();

		$(".sapMObjStatusLink").on("click", function () {
			assert.ok(true, "Executed press action on link");
			done();
		});

		oPressAction.executeOn(this.oObjectStatus);
	});

	QUnit.test("Should press ObjectStatus - missing press adapter", async function (assert) {
		var done = assert.async();
		this.oObjectStatus.setText("foo");
		await nextUIUpdate();

		var oPressAction = new Press();

		$(".sapMObjStatus").on("click", function () {
			assert.ok(true, "Executed press action on ObjectStatus");
			done();
		});

		oPressAction.executeOn(this.oObjectStatus);
	});

	QUnit.module("Press - interact with SearchField", {
		beforeEach: function() {
			this.oSearchField = new SearchField();
			this.oSearchField.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach: function() {
			this.oSearchField.destroy();
		}
	});


	QUnit.test("Should press SearchField search icon - press adapter", function (assert) {
		var done = assert.async();
		var oPressAction = new Press();

		$(".sapMSFS").on("click", function () {
			assert.ok(true, "Executed press action on search icon");
			done();
		});

		oPressAction.executeOn(this.oSearchField);
	});

	QUnit.test("Should press SearchField - missing press adapter", async function (assert) {
		var done = assert.async();
		var oPressAction = new Press();

		this.oSearchField.setShowSearchButton(false);
		await nextUIUpdate();

		$("input[type='search']").on("mousedown", function () {
			assert.ok(true, "Executed press action on search input field (focus DOM ref)");
			done();
		});

		oPressAction.executeOn(this.oSearchField);
	});

	QUnit.test("Should press SearchField - user provided ID suffix", async function (assert) {
		var done = assert.async();

		this.oSearchField.setShowRefreshButton(true);
		await nextUIUpdate();

		var oPressAction = new Press({idSuffix: "reset"});

		$(".sapMSFR").on("click", function () {
			assert.ok(true, "Executed press action on search button");
			done();
		});

		oPressAction.executeOn(this.oSearchField);
	});

	QUnit.module("ComboBox",{
		beforeEach: function() {
			// system under test
			this.clock = sinon.useFakeTimers();
			this.oComboBox =  new ComboBox({
				items: [
					new Item({
						key: "0",
						text: "item 0"
					}),
					new Item({
						key: "1",
						text: "item 1"
					}),
					new Item({
						key: "2",
						text: "item 2"
					})
				]
			});
			// arrange
			this.oComboBox.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		// cleanup
		afterEach: function() {
			this.clock.restore();
			this.oComboBox.destroy();
		}
	});


	QUnit.test("Should select an item", function (assert) {
		var oPicker = this.oComboBox.getPicker();
		assert.strictEqual(this.oComboBox.getSelectedItem(), null, "By default the selected item of the ComboBox control is null");
		assert.strictEqual(this.oComboBox.getValue(), "", "ComboBox's value is empty");
		assert.strictEqual(oPicker, null, "ComboBox's Popover does not exists");

		var oPressArrow = new Press();
		oPressArrow.executeOn(this.oComboBox);

		this.clock.tick(1000);

		oPicker = this.oComboBox.getPicker();
		var oOpenPickerDomRef = $(oPicker.getDomRef());
		assert.ok(oPicker.isOpen(), "ComboBox's Popover is open");
		assert.equal(oOpenPickerDomRef.css("visibility"), "visible", "Checking Popover's visibility css property");
		assert.equal(oOpenPickerDomRef.css("display"), "block", "Checking Popover's display css property");

		var oPressItem = new Press();
		oPressItem.executeOn(ListHelpers.getListItem(this.oComboBox.getItems()[1]));

		this.clock.tick(500);

		// on mobile devices the popover is removed from the DOM
		if (oPicker.getDomRef()) {
			var oClosedPickerDomRef = $(oPicker.getDomRef());
			assert.ok(!oPicker.isOpen(), "ComboBox's Popover is closed");
			assert.equal(oClosedPickerDomRef.css("visibility"), "hidden", "Checking Popover's visibility css property");
			assert.equal(oClosedPickerDomRef.css("display"), "none", "Checking Popover's display css property");
			assert.strictEqual(this.oComboBox.getValue(), "item 1", "Check selected item");
		} else {
			assert.ok(true, "The Popover is removed from the DOM");
		}
	});

	(function () {
		function createButton(sText, fnPressCallback) {
			return new Button({
				text: sText,
				width: "150px",
				press: function () {
					Opa5.assert.ok(true, "Fired the press event on button with text " + sText);
					if (fnPressCallback) {
						fnPressCallback();
					}
				}
			});
		}

		QUnit.module("OverflowToolbar");

		opaTest("Should synchronize with overflow popup", function (oOpa) {
			var done = Opa5.assert.async();
			var oOverflowToolbar = new OverflowToolbar({
				width: "140px"
			});

			oOverflowToolbar.placeAt("qunit-fixture");

			setTimeout(function () {
				oOverflowToolbar.addContent(createButton("Button1"));
				oOverflowToolbar.addContent(createButton("Button2"));
			},600);

			oOpa.extendConfig({autoWait: true});

			oOpa.waitFor({
				controlType: "sap.m.ToggleButton",
				errorMessage: "Did not find the popover area toggle button",
				actions: new Press()
			});

			oOpa.waitFor({
				controlType: "sap.m.Button",
				matchers: new PropertyStrictEquals({name: "text", value: "Button2"}),
				errorMessage: "Did not find the overflowing button with text Button2",
				actions: new Press()
			});

			// should destroy the toolbar only after everything is settled
			oOpa.waitFor({
				success: function() {
					oOverflowToolbar.destroy();
					done();
				}
			});
		});

		opaTest("Should synchronize with resizing overflow toolbar", function (oOpa) {
			var done = Opa5.assert.async();
			var oOverflowToolbar = new OverflowToolbar({
				width: "400px"
			});
			oOverflowToolbar.addContent(createButton("Button1"));
			oOverflowToolbar.addContent(createButton("Button2"));
			oOverflowToolbar.placeAt("qunit-fixture");

			oOpa.extendConfig({autoWait: true});

			// cause overflow re-rendering
			oOpa.waitFor({
				success: function() {
					oOverflowToolbar.setWidth("140px");
					console.debug("Set smaller width to cause overflow"); // eslint-disable-line no-console
				}
			});

			// should be clicking the toggle button only after overflow re-rendering is complete
			oOpa.waitFor({
				controlType: "sap.m.ToggleButton",
				errorMessage: "Did not find the popover area toggle button",
				actions: new Press()
			});

			// this click will close the popover by default
			oOpa.waitFor({
				controlType: "sap.m.Button",
				matchers: new PropertyStrictEquals({name: "text", value: "Button2"}),
				errorMessage: "Did not find the overflowing button with text Button2",
				actions: new Press()
			});

			// should destroy the toolbar only after everything is settled
			oOpa.waitFor({
				success: function() {
					oOverflowToolbar.destroy();
					done();
				}
			});
		});

		opaTest("Should synchronize with resizing overflow toolbar when resizing the app", function (oOpa) {
			var done = Opa5.assert.async();
			var toolbarContent1 = [
				new Label({
					text : "Priority Toolbar"
				}),
				new ToolbarSpacer(),
				new Button({
					text : "Always 1",
					layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.AlwaysOverflow}),
					width: "125px"
				}),
				new Button({
					text : "Always 2",
					layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.AlwaysOverflow}),
					width: "125px"
				}),
				new Button({
					text : "High 1",
					type : ButtonType.Accept,
					layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.High}),
					width: "125px"
				}),
				new Button({
					text : "Low 1",
					type : ButtonType.Emphasized,
					layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.Low}),
					width: "125px"
				}),
				new Button({
					text : "Never 1",
					type : ButtonType.Reject,
					layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.NeverOverflow}),
					width: "125px"
				}),
				new Button({
					text : "Never 2",
					type : ButtonType.Reject,
					layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.NeverOverflow}),
					width: "125px"
				}),
				new Button({
					text : "Low 2",
					type : ButtonType.Emphasized,
					layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.Low}),
					width: "125px"
				}),
				new Button({
					text : "Disappear",
					layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.Disappear}),
					width: "125px"
				}),
				new Button({
					text : "High 2",
					type : ButtonType.Accept,
					layoutData: new OverflowToolbarLayoutData({priority: OverflowToolbarPriority.High}),
					width: "125px",
					press: function () {
						Opa5.assert.ok(true, "Fired the press event on button with text High 2");
					}
				})
			];

			var oOverflowToolbar1 = new OverflowToolbar("otb1", {
				width: 'auto',
				content : toolbarContent1
			});

			var oPage = new Page("toolbar-page", {
				title : "Overflow Toolbar - the buttons that do not fit go to an action sheet",
				enableScrolling : true,
				content: [
					oOverflowToolbar1
				]
			});

			var oApp = new App();
			oApp.addPage(oPage).placeAt("qunit-fixture");

			oOpa.extendConfig({
				autoWait: true,
				asyncPolling: true
			});

			// cause overflow re-rendering
			oOpa.waitFor({
				success: function() {
					$("#toolbar-page").width("480px");
					console.debug("Set smaller width to cause overflow"); // eslint-disable-line no-console
				}
			});

			// should be clicking the toggle button only after overflow re-rendering is complete
			oOpa.waitFor({
				controlType: "sap.m.ToggleButton",
				errorMessage: "Did not find the popover area toggle button",
				actions: new Press(),
				success: function() {
					console.debug("Clicked the overflow button"); // eslint-disable-line no-console
				}
			});

			// should be clicking the toggle button only after overflow re-rendering is complete
			oOpa.waitFor({
				controlType: "sap.m.Button",
				matchers: new PropertyStrictEquals({name: "text", value: "High 2"}),
				errorMessage: "Did not find the High 2 button",
				actions: new Press(),
				success: function() {
					console.debug("Closed the overflow popup"); // eslint-disable-line no-console
				}
			});

			// should destry the toolbar only after everything is settled
			oOpa.waitFor({
				success: function() {
					console.debug("Destroy the app"); // eslint-disable-line no-console
					oApp.destroy();
					done();
				}
			});
		});

	})();

});
