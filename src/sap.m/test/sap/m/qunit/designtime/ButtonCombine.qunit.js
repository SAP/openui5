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
	"sap/ui/events/jquery/EventExtension"
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
		EventExtension
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

		QUnit.test('CustomData of the Button is copied to MenuItem', function (assert) {
			var oBtn1 = new Button({
				id: "btn1",
				text: "button",
				enabled: false
			}),
			oBtn2 = new Button({id: "btn2"}),
			oMyCustomData = new sap.ui.core.CustomData({key : "myCustomData", value : "my custom data value"});

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
			assert.ok(bIsFound, "First menuItem has the the customData that was set to the button from which was created");

			// clean up
			oBtn1.destroy();
			oBtn2.destroy();

		});

	});