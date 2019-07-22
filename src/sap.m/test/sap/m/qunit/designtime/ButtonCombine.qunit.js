/*global QUnit */
sap.ui.define([
	"sap/ui/core/Title",
	"sap/ui/core/mvc/View",
	"sap/m/changeHandler/CombineButtons",
	"sap/m/Bar",
	"sap/m/Button",
	"sap/ui/fl/Change",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/events/jquery/EventExtension",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/CustomData"
],
	function(
		Title,
		View,
		CombineButtons,
		Bar,
		Button,
		Change,
		JsControlTreeModifier,
		XmlTreeModifier,
		EventExtension,
		JSONModel,
		CustomData
	) {
		'use strict';



		QUnit.module("Checking the combine action: ", {
			beforeEach: function () {
				this.oMockedAppComponent = {
					getLocalId: function () {
						return undefined;
					},
					createId: function (id) {
						return id;
					}
				};
			},
			afterEach: function () {
				if (this.oBar) {
					this.oBar.destroy();
				}
			}
		});

		QUnit.test('Press event fired correctly after combine', function (assert) {
			var oBtn1 = new Button({
					id: "btn1",
					text: "button",
					press: function () {
					}
				}),
				oBtn2 = new Button({id: "btn2"});
			this.oBar = new Bar({
				id: "idBar",
				contentRight: [ oBtn1, oBtn2 ]
			});
			var oView = new View({content : [
				this.oBar
			]});

			var mSpecificChangeInfo = {
				"parentId": "idFormContainer",
				"combineFieldIds" : ["btn1", "btn2"]
			};

			var oChange = new Change({"changeType" : "combineButtons", "content" : {}});

			CombineButtons.completeChangeContent(oChange, mSpecificChangeInfo,{modifier: JsControlTreeModifier, view : oView, appComponent: this.oMockedAppComponent});
			CombineButtons.applyChange(oChange, this.oBar, {modifier: JsControlTreeModifier, view : oView, appComponent : this.oMockedAppComponent});

			var oCreatedMenuButton = sap.ui.getCore().byId("idBar").getContentRight()[0],
				oFirstMenuItem = oCreatedMenuButton.getMenu().getItems()[0],
				MenuItemTextId = "#" + oFirstMenuItem.getId() + "-unifiedmenu-txt",
				oButtonPressSpy = this.spy(sap.ui.getCore().byId("btn1"), "firePress"),
				oFakeEvent = jQuery.Event('click');

			oCreatedMenuButton.placeAt("content");

			sap.ui.getCore().applyChanges();

			oCreatedMenuButton.getAggregation("_button").firePress();
			oFakeEvent.target = jQuery(MenuItemTextId)[0];

			oCreatedMenuButton.getMenu()._getMenu().onclick(oFakeEvent);

			assert.strictEqual(oButtonPressSpy.callCount, 1, "The press event was fired once");

			// clean up
			oBtn1.destroy();
			oBtn2.destroy();
		});

		QUnit.test('Enable / Disable Button is in sync with MenuItem', function (assert) {
			var oBtn1 = new Button({
				id: "btn1",
				text: "button",
				enabled: false
			}),
			oBtn2 = new Button({id: "btn2"});
			this.oBar = new Bar({
				id: "idBar",
				contentRight: [ oBtn1, oBtn2 ]
			});
			var oView = new View({content : [
				this.oBar
			]});

			var mSpecificChangeInfo = {
				"parentId": "idFormContainer",
				"combineFieldIds" : ["btn1", "btn2"]
			};

			var oChange = new Change({"changeType" : "combineButtons", "content" : {}});

			CombineButtons.completeChangeContent(oChange, mSpecificChangeInfo,{modifier: JsControlTreeModifier, view : oView, appComponent: this.oMockedAppComponent});
			CombineButtons.applyChange(oChange, this.oBar, {modifier: JsControlTreeModifier, view : oView, appComponent : this.oMockedAppComponent});

			var oCreatedMenuButton = sap.ui.getCore().byId("idBar").getContentRight()[0],
				oFirstMenuItem = oCreatedMenuButton.getMenu().getItems()[0];

			oCreatedMenuButton.placeAt("content");
			sap.ui.getCore().applyChanges();

			assert.strictEqual(oFirstMenuItem.getEnabled(), false, "First menuItem is disabled like the button from which was created");

			// Act
			sap.ui.getCore().byId("btn1").setEnabled(true);

			assert.strictEqual(oFirstMenuItem.getEnabled(), true, "First menuItem is enabled like the button from which was created");

			// clean up
			oBtn1.destroy();
			oBtn2.destroy();

		});

		QUnit.test("Enable / Disable Button when the property is binded", function(assert) {
			// Arrange
			var oModel = new JSONModel();
			oModel.setData({ mData: { enabled: false }});

			var oBtn1 = new Button({
				id: "btn1",
				text: "btn1",
				enabled: true
			}),
			oBtn2 = new Button({
				id: "btn2",
				text: "btn2"
			});

			oBtn1.setModel(oModel);
			oBtn1.bindProperty("enabled", "/mData/enabled");

			this.oBar = new Bar({
				id: "idBar",
				contentRight: [ oBtn1, oBtn2 ]
			});
			var oView = new View({content : [
				this.oBar
			]});

			var mSpecificChangeInfo = {
					"parentId": "idFormContainer",
					"combineFieldIds" : ["btn1", "btn2"]
				};

			var oChange = new Change({"changeType" : "combineButtons", "content" : {}});

			CombineButtons.completeChangeContent(oChange, mSpecificChangeInfo,{modifier: JsControlTreeModifier, view : oView, appComponent: this.oMockedAppComponent});
			CombineButtons.applyChange(oChange, this.oBar, {modifier: JsControlTreeModifier, view : oView, appComponent : this.oMockedAppComponent});

			var oCreatedMenuButton = sap.ui.getCore().byId("idBar").getContentRight()[0],
				oFirstMenuItem = oCreatedMenuButton.getMenu().getItems()[0];

			oCreatedMenuButton.placeAt("content");
			sap.ui.getCore().applyChanges();

			assert.strictEqual(oFirstMenuItem.getEnabled(), false, "First menuItem is disabled like the button from which was created");
			assert.strictEqual(oFirstMenuItem.getBindingInfo("enabled") === oBtn1.getBindingInfo("enabled"), true,
					"First menuItem has the same bindingInfo for the 'enabled' property as the button from which was created");

			oModel.setData({ mData: { enabled: true }});

			assert.strictEqual(oFirstMenuItem.getEnabled(), true, "First menuItem is enabled like the button from which was created");
			assert.strictEqual(oFirstMenuItem.getBindingInfo("enabled") === oBtn1.getBindingInfo("enabled"), true,
			"First menuItem has the same bindingInfo for the 'enabled' property as the button from which was created");

			// clean up
			oBtn1.destroy();
			oBtn2.destroy();
		});


		QUnit.test('CustomData of the Button is copied to MenuItem', function (assert) {
			// Arrange
			var oBtn1 = new Button({
				id: "btn1",
				text: "button",
				enabled: false
			}),
			oBtn2 = new Button({id: "btn2"}),
			oMyCustomData = new CustomData({key : "myCustomData", value : "my custom data value"});

			this.oBar = new Bar({
				id: "idBar",
				contentRight: [ oBtn1, oBtn2 ]
			});
			var oView = new View({content : [
				this.oBar
			]});

			oBtn1.insertAggregation("customData", oMyCustomData);

			var mSpecificChangeInfo = {
				"parentId": "idFormContainer",
				"combineFieldIds" : ["btn1", "btn2"]
			};

			var oChange = new Change({"changeType" : "combineButtons", "content" : {}});

			// Act
			CombineButtons.completeChangeContent(oChange, mSpecificChangeInfo,{modifier: JsControlTreeModifier, view : oView, appComponent: this.oMockedAppComponent});
			CombineButtons.applyChange(oChange, this.oBar, {modifier: JsControlTreeModifier, view : oView, appComponent : this.oMockedAppComponent});

			var oCreatedMenuButton = sap.ui.getCore().byId("idBar").getContentRight()[0],
				oFirstMenuItem = oCreatedMenuButton.getMenu().getItems()[0];

			oCreatedMenuButton.placeAt("content");
			sap.ui.getCore().applyChanges();

			var aCustomData = oFirstMenuItem.getCustomData();

			var bIsFound = aCustomData.some(function (oCustomData) {
				return oCustomData === oMyCustomData;
			});

			// Assert
			assert.ok(bIsFound, "First menuItem has the the customData that was set to the button from which was created");

			// clean up
			oBtn1.destroy();
			oBtn2.destroy();

		});

		QUnit.test('getAggregation for "CustomData" function of the Button is overwritten to return either the customData of the button or the one of the MenuItem', function (assert) {
			// Arrange
			var oBtn1 = new Button({
				id: "btn1",
				text: "button",
				enabled: false
			}),
			oBtn2 = new Button({id: "btn2"}),
			oMyCustomData = new CustomData({key : "myCustomData", value : "my custom data value"});

			this.oBar = new Bar({
				id: "idBar",
				contentRight: [ oBtn1, oBtn2 ]
			});
			var oView = new View({content : [
				this.oBar
			]});

			oBtn1.insertAggregation("customData", oMyCustomData);

			var mSpecificChangeInfo = {
				"parentId": "idFormContainer",
				"combineFieldIds" : ["btn1", "btn2"]
			};

			var oChange = new Change({"changeType" : "combineButtons", "content" : {}});

			// Act
			CombineButtons.completeChangeContent(oChange, mSpecificChangeInfo,{modifier: JsControlTreeModifier, view : oView, appComponent: this.oMockedAppComponent});
			CombineButtons.applyChange(oChange, this.oBar, {modifier: JsControlTreeModifier, view : oView, appComponent : this.oMockedAppComponent});

			var oCreatedMenuButton = sap.ui.getCore().byId("idBar").getContentRight()[0];

			oCreatedMenuButton.placeAt("content");
			sap.ui.getCore().applyChanges();

			var aCustomData = oBtn1.getCustomData();

			var bIsFound = aCustomData.some(function (oCustomData) {
				return oCustomData === oMyCustomData;
			});

			// Assert
			assert.ok(bIsFound, "The getAggregation('customData') function of the Button has returned the customData that was set to the menuItem");

			// clean up
			oBtn1.destroy();
			oBtn2.destroy();

		});
	});