/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/rta/plugin/Remove",
	"sap/ui/rta/plugin/Combine",
	"sap/ui/rta/plugin/Selection",
	"sap/ui/rta/Utils",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/fl/Utils",
	"sap/m/Button",
	"sap/m/VBox",
	"sap/m/HBox",
	"sap/m/Bar",
	"sap/m/Text",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/registry/SimpleChanges",
	"sap/ui/core/UIComponent",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/sinon-4"
], function (
	jQuery,
	Remove,
	Combine,
	Selection,
	Utils,
	CommandFactory,
	DesignTime,
	OverlayRegistry,
	ElementOverlay,
	FlUtils,
	Button,
	VBox,
	HBox,
	Bar,
	Text,
	ChangeRegistry,
	SimpleChanges,
	UIComponent,
	KeyCodes,
	sinon
) {
	"use strict";

	QUnit.module("Given a Selection plugin and designtime in MultiSelection mode and controls with custom dt metadata to simulate different cases...", {
		beforeEach : function(assert) {
			this.sandbox = sinon.sandbox.create();

			this.oComponent = new UIComponent();
			this.sandbox.stub(FlUtils, "getAppComponentForControl").returns(this.oComponent);
			var oChangeRegistry = ChangeRegistry.getInstance();
			oChangeRegistry.registerControlsForChanges({
				"sap.m.VBox": [
					SimpleChanges.hideControl,
					{
						changeType: "combineChange",
						changeHandler : {}
					}
				],
				"sap.m.HBox": [
					SimpleChanges.hideControl,
					{
						changeType: "combineChange",
						changeHandler : {}
					}
				],
				"sap.m.Button": [],
				"sap.m.Text": [
					SimpleChanges.hideControl
				]
			});

			this.oCommandFactory = new CommandFactory(
				{
					flexSettings: {
						layer:"CUSTOMER",
						developerMode: false
					}
				}
			);

			this.oSelectionPlugin = new Selection({
				commandFactory :this.oCommandFactory,
				multiSelectionRequiredPlugins : [
					Combine.getMetadata().getName(),
					Remove.getMetadata().getName()
				]
			});

			this.oVBox = new VBox({
				id : this.oComponent.createId("root"),
				items : [
					new HBox({
						id : this.oComponent.createId("container1"),
						items : [
							new Button(this.oComponent.createId("innerBtn11")),
							new Button(this.oComponent.createId("innerBtn12")),
							new Text(this.oComponent.createId("innerTxt13"))
						]
					}),
					new Button(this.oComponent.createId("btnOutsideContainer")),
					new HBox({
						id : this.oComponent.createId("container2"),
						items : [
							new Button(this.oComponent.createId("innerBtn21"))
						]
					}),
					new Bar(this.oComponent.createId("othercontainer3")),
					new HBox({
						id : this.oComponent.createId("container4"),
						items : [
							new VBox({
								id : this.oComponent.createId("innerVBox1"),
								items : [
									new Text(this.oComponent.createId("innerVBox1Txt"))
								]
							}),
							new VBox({
								id : this.oComponent.createId("innerVBox2"),
								items : [
									new Text(this.oComponent.createId("innerVBox2Txt")),
									new Button(this.oComponent.createId("innerVBox2Btn"))
								]
							})

						]
					})
				]
			});
			this.oVBox.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();


			var done = assert.async();
			this.oDesignTime = new DesignTime({
				plugins : [
					this.oSelectionPlugin,
					new Remove({commandFactory :this.oCommandFactory}),
					new Combine({commandFactory :this.oCommandFactory})
				],
				rootElements : [this.oVBox],
				designTimeMetadata : {
					"sap.m.VBox" : {
						actions : {
							remove : {
								changeType: "hideControl"
							}
						}
					},
					"sap.m.HBox" : {
						aggregations : {
							items : {
								propagateRelevantContainer : true
							}
						},
						actions : {
							remove : {
								changeType: "hideControl"
							}
						}
					},
					"sap.m.Button" : {
						actions : {
							combine : {
								changeType: "combineChange",
								changeOnRelevantContainer : true
							},
							remove: null
						}
					},
					"sap.m.Text" : {
						actions : {
							remove : {
								changeType: "hideControl"
							}
						}
					}
				}
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				done();
			});

			this.oSelectionManager = this.oDesignTime.getSelectionManager();
			this.oEvent = jQuery.Event('keydown');
			this.oEvent.shiftKey = false;
			this.oEvent.altKey = false;

		},
		afterEach : function() {
			this.sandbox.restore();
			this.oComponent.destroy();
			this.oVBox.destroy();
			this.oDesignTime.destroy();
		}
	}, function(){
		QUnit.test("when trying to select the first compatible control (removable/combinable)", function(assert){
			var oOverlay = OverlayRegistry.getOverlay(this.oComponent.createId("innerBtn12"));
			oOverlay.setSelected(true);

			assert.ok(oOverlay.isSelected(), "then single overlay is selected");
		});

		QUnit.test("when trying to select the 2. compatible (removable/combinable) control", function(assert){
			var oOverlay1 = OverlayRegistry.getOverlay(this.oComponent.createId("innerBtn11"));
			var oOverlay2 = OverlayRegistry.getOverlay(this.oComponent.createId("innerBtn12"));

			this.oSelectionManager.set([oOverlay1, oOverlay2]);

			assert.ok(oOverlay1.isSelected(), "then innerBtn11 overlay is selected");
			assert.ok(oOverlay2.isSelected(), "then innerBtn12 overlay is selected");
		});

		QUnit.test("when trying to select the 2. control not multiselection enabled control (removable/combinable)", function(assert){
			var oOverlay1 = OverlayRegistry.getOverlay(this.oComponent.createId("container1"));
			var oOverlay2 = OverlayRegistry.getOverlay(this.oComponent.createId("othercontainer3"));
			oOverlay2.setSelectable(true);

			this.oSelectionManager.add(oOverlay1);
			this.oSelectionManager.add(oOverlay2);

			assert.ok(oOverlay1.isSelected(), "then container1 overlay is selected");
			assert.notOk(oOverlay2.isSelected(), "then othercontainer3 overlay is not selected");
		});

		QUnit.test("when trying to select a single container which doesn't pass validator of Plugin", function(assert){
			var oOverlay = OverlayRegistry.getOverlay(this.oComponent.createId("othercontainer3"));
			oOverlay.setSelectable(true);

			this.oSelectionManager.add(oOverlay);

			assert.ok(oOverlay.isSelected(), "then othercontainer3 overlay is not selected");
		});

		QUnit.test("when trying to select 3 overlays and the 2. control is multiselection enabled for a different action", function(assert){
			var oOverlay1 = OverlayRegistry.getOverlay(this.oComponent.createId("innerBtn12"));
			var oOverlay2 = OverlayRegistry.getOverlay(this.oComponent.createId("innerTxt13"));
			var oOverlay3 = OverlayRegistry.getOverlay(this.oComponent.createId("innerBtn11"));

			this.oSelectionManager.add(oOverlay1);
			this.oSelectionManager.add(oOverlay2);
			this.oSelectionManager.add(oOverlay3);

			assert.ok(oOverlay1.isSelected(), "then innerBtn12 overlay is selected");
			assert.notOk(oOverlay2.isSelected(), "then innerTxt13 overlay for the different action is not selected");
			assert.ok(oOverlay3.isSelected(), "then innerBtn11 overlay is selected");
		});

		QUnit.test("when trying to select the 2. control with different parent", function(assert){
			var oOverlay1 = OverlayRegistry.getOverlay(this.oComponent.createId("innerBtn12"));
			var oOverlay2 = OverlayRegistry.getOverlay(this.oComponent.createId("btnOutsideContainer"));
			oOverlay2.setSelectable(true);

			this.oSelectionManager.add(oOverlay1);
			this.oSelectionManager.add(oOverlay2);

			assert.ok(oOverlay1.isSelected(), "then innerBtn12 overlay is selected");
			assert.notOk(oOverlay2.isSelected(), "then btnOutsideContainer overlay from different parent is not selected");
		});

		QUnit.test("when trying to select innerVBox1Txt inside the innerVBox (both have HBox container4 as their relevant container, but innerVBox is parent of text)", function(assert){
			var oOverlay1 = OverlayRegistry.getOverlay(this.oComponent.createId("innerVBox1Txt"));
			var oOverlay2 = OverlayRegistry.getOverlay(this.oComponent.createId("innerVBox1"));

			this.oSelectionManager.add(oOverlay1);
			this.oSelectionManager.add(oOverlay2);

			assert.ok(oOverlay1.isSelected(), "then innerVBox1Txt overlay is selected");
			assert.notOk(oOverlay2.isSelected(), "then innerVBox1 overlay is not selected");
		});

		QUnit.test("when trying to select the texts inside the innerVBox1 & innerVBox2 (different parents, same control type and same relevant container)", function(assert){
			var oOverlay1 = OverlayRegistry.getOverlay(this.oComponent.createId("innerVBox1Txt"));
			var oOverlay2 = OverlayRegistry.getOverlay(this.oComponent.createId("innerVBox2Txt"));

			this.oSelectionManager.add(oOverlay1);
			this.oSelectionManager.add(oOverlay2);

			assert.ok(oOverlay1.isSelected(), "then innerVBox1Txt overlay is selected");
			assert.ok(oOverlay2.isSelected(), "then innerVBox2Txt overlay is selected");
		});

		QUnit.test("when trying to select innerVBox1Txt in innerVBox1 and the container innerVBox2 (different control types and same relevant container)", function(assert){
			var oOverlay1 = OverlayRegistry.getOverlay(this.oComponent.createId("innerVBox1Txt"));
			var oOverlay2 = OverlayRegistry.getOverlay(this.oComponent.createId("innerVBox2"));

			this.oSelectionManager.add(oOverlay1);
			this.oSelectionManager.add(oOverlay2);

			assert.ok(oOverlay1.isSelected(), "then innerVBox1Txt overlay is selected");
			assert.notOk(oOverlay2.isSelected(), "then innerVBox2 overlay is not selected");
		});

		//Note: we might support this case in the future
		QUnit.test("when trying to select innerVBox1Txt in innerVBox1 and innerVBox2Btn in innerVBox2 (different control types, different parents and same relevant container)", function(assert){
			var oOverlay1 = OverlayRegistry.getOverlay(this.oComponent.createId("innerVBox1Txt"));
			var oOverlay2 = OverlayRegistry.getOverlay(this.oComponent.createId("innerVBox2Btn"));

			this.oSelectionManager.add(oOverlay1);
			this.oSelectionManager.add(oOverlay2);

			assert.ok(oOverlay1.isSelected(), "then innerVBox1Txt overlay is selected");
			assert.notOk(oOverlay2.isSelected(), "then innerVBox2Btn overlay is not selected");
		});

		QUnit.test("When setSelected() is called on an Overlay with Developer Mode = false ", function(assert){
			var oElement = new Button("testbutton");
			var oOverlay = new ElementOverlay({
				element: oElement,
				isRoot: false
			});
			this.oSelectionPlugin.registerElementOverlay(oOverlay);
			this.oSelectionManager.add(oOverlay);
			assert.notOk(oOverlay.isSelected(), "then this overlay is not selected");
			this.oSelectionPlugin.deregisterElementOverlay(oOverlay);
		});

		QUnit.test("Deregistering an Overlay", function (assert) {
			var oOverlay = OverlayRegistry.getOverlay(this.oComponent.createId("innerBtn11"));
			this.oSelectionPlugin.registerElementOverlay(oOverlay);
			this.oSelectionPlugin.deregisterElementOverlay(oOverlay);
			assert.ok(true, "Should throw no error");
		});

		QUnit.test("Pressing a Keyboard-key other than Arrows and Enter (e.g.TAB) on an Overlay", function (assert) {
			var oOverlay = OverlayRegistry.getOverlay(this.oComponent.createId("innerBtn11"));
			oOverlay.focus();
			this.oEvent.keyCode = KeyCodes.TAB;
			oOverlay.$().trigger(this.oEvent);
			assert.notOk(oOverlay.isSelected(), "then this overlay is not selected");
		});

		QUnit.test("Pressing CTRL-ENTER on an Overlay", function (assert) {
			var oOverlay1 = OverlayRegistry.getOverlay(this.oComponent.createId("innerBtn12"));
			this.oSelectionManager.add(oOverlay1);
			var oOverlay2 = OverlayRegistry.getOverlay(this.oComponent.createId("innerBtn11"));
			oOverlay2.focus();
			this.oEvent.keyCode = KeyCodes.ENTER;
			this.oEvent.ctrlKey = true;
			oOverlay2.$().trigger(this.oEvent);
			assert.ok(oOverlay1.isSelected(), "then Overlay1 is selected");
			assert.ok(oOverlay2.isSelected(), "then Overlay2 is selected");
		});

		QUnit.test("Pressing UP-Arrow on an Overlay", function (assert) {
			var oOverlay = OverlayRegistry.getOverlay(this.oComponent.createId("innerVBox2Btn"));
			oOverlay.focus();
			var oParentOverlay = Utils.getFocusableParentOverlay(oOverlay);
			this.oEvent.keyCode = KeyCodes.ARROW_UP;
			oOverlay.$().trigger(this.oEvent);
			assert.ok(Utils.getFocusedOverlay() === oParentOverlay, "Parent Overlay is focused");
		});

		QUnit.test("Pressing DOWN-Arrow on an Overlay", function (assert) {
			var oOverlay = OverlayRegistry.getOverlay(this.oComponent.createId("innerVBox2"));
			oOverlay.focus();
			var oFirstChildOverlay = Utils.getFirstFocusableDescendantOverlay(oOverlay);
			this.oEvent.keyCode = KeyCodes.ARROW_DOWN;
			oOverlay.$().trigger(this.oEvent);
			assert.ok(Utils.getFocusedOverlay() === oFirstChildOverlay, "Child Overlay is focused");
		});

		QUnit.test("Pressing Left-arrow on an Overlay", function (assert) {
			var oOverlay = OverlayRegistry.getOverlay(this.oComponent.createId("innerBtn12"));
			oOverlay.focus();
			var oPrevSiblingOverlay = Utils.getPreviousFocusableSiblingOverlay(oOverlay);
			this.oEvent.keyCode = KeyCodes.ARROW_LEFT;
			oOverlay.$().trigger(this.oEvent);
			assert.ok(Utils.getFocusedOverlay() === oPrevSiblingOverlay, "Previous Sibling Overlay is focused");
		});

		QUnit.test("Pressing Right-arrow on an Overlay", function (assert) {
			var oOverlay = OverlayRegistry.getOverlay(this.oComponent.createId("innerBtn11"));
			oOverlay.focus();
			var oNextSiblingOverlay = Utils.getNextFocusableSiblingOverlay(oOverlay);
			this.oEvent.keyCode = KeyCodes.ARROW_RIGHT;
			oOverlay.$().trigger(this.oEvent);
			assert.ok(Utils.getFocusedOverlay() === oNextSiblingOverlay, "Next Sibling Overlay is focused");
		});

		QUnit.test("Invoking Mouse-Down on an Overlay which is selectable", function (assert) {
			this.sandbox.stub(sap.ui.Device.browser, "name").value("ie");
			var oOverlay = OverlayRegistry.getOverlay(this.oComponent.createId("innerBtn11"));
			assert.notOk(document.activeElement === oOverlay.getDomRef(), "when the Overlay is initially not focused");
			var oMouseEvent = jQuery.Event('mousedown');
			oOverlay.$().trigger(oMouseEvent);
			assert.ok(document.activeElement === oOverlay.getDomRef(), "then the Overlay is focused");
		});

		QUnit.test("Invoking Mouse-Down on an Overlay which is not selectable", function (assert) {
			this.sandbox.stub(sap.ui.Device.browser, "name").value("ie");
			var oOverlay = OverlayRegistry.getOverlay(this.oComponent.createId("innerBtn11"));
			oOverlay.setSelectable(false);
			oOverlay.setFocusable(true);
			oOverlay.focus();
			assert.ok(document.activeElement === oOverlay.getDomRef(), "when the Overlay is initialy focused");
			var oMouseEvent = jQuery.Event('mousedown');
			oOverlay.$().trigger(oMouseEvent);
			assert.notOk(document.activeElement === oOverlay.getDomRef(), "then the Overlay is not focused any more");
		});

		QUnit.test("Invoking Mouse-Over and Mouse-Leave on an Overlay which is selectable", function (assert) {
			var oOverlay = OverlayRegistry.getOverlay(this.oComponent.createId("innerBtn11"));
			assert.ok(!oOverlay.hasStyleClass("sapUiRtaOverlayHover"), "initially the CSS class is not set");
			var oMouseEvent = jQuery.Event('mouseover');
			oOverlay.$().trigger(oMouseEvent);
			assert.ok(oOverlay.hasStyleClass("sapUiRtaOverlayHover"), "then the Overlay has the proper CSS class after mouse-over event");
			oMouseEvent = jQuery.Event('mouseleave');
			oOverlay.$().trigger(oMouseEvent);
			assert.ok(!oOverlay.hasStyleClass("sapUiRtaOverlayHover"), "then the CSS class is removed again after mouse-leave event");
		});

		QUnit.test("Invoking Mouse-Over on an Overlay which is not selectable", function (assert) {
			var oOverlay = OverlayRegistry.getOverlay(this.oComponent.createId("innerBtn11"));
			oOverlay.setSelectable(false);
			assert.ok(!oOverlay.hasStyleClass("sapUiRtaOverlayHover"), "initially the CSS class is not set");
			var oMouseEvent = jQuery.Event('mouseover');
			oOverlay.$().trigger(oMouseEvent);
			assert.ok(!oOverlay.hasStyleClass("sapUiRtaOverlayHover"), "then the CSS class is still not set after Mouse-over event");
		});

		QUnit.test("When 'Editable' changes to false on an hovered Overlay", function (assert) {
			var fnDone = assert.async();
			var oOverlay = OverlayRegistry.getOverlay(this.oComponent.createId("innerBtn12"));
			var oMouseEvent = jQuery.Event('mouseover');
			oOverlay.$().trigger(oMouseEvent);
			assert.ok(oOverlay.hasStyleClass("sapUiRtaOverlayHover"), "then the Overlay has initaly the proper CSS class");
			this.oSelectionPlugin.attachEventOnce("elementEditableChange", function() {
				assert.ok(!oOverlay.hasStyleClass("sapUiRtaOverlayHover"), "then the CSS class is removed again after editable change");
				fnDone();
			});
			oOverlay.setEditable(false);
		});

		QUnit.test("When the method _checkDeveloperMode is called and Developermode is true", function (assert) {
			var fnDone = assert.async();
			var oOverlay = OverlayRegistry.getOverlay(this.oComponent.createId("innerBtn12"));
			oOverlay.setEditable(false);
			oOverlay.setSelectable(false);
			this.oCommandFactory.setProperty("flexSettings", {layer:"CUSTOMER", developerMode: true});
			this.oSelectionPlugin.attachEventOnce("elementEditableChange", function () {
				assert.ok(true, 'elementEditableChange event was called');
				fnDone();
			});
			assert.ok(this.oSelectionPlugin._checkDeveloperMode(oOverlay), "_checkDeveloperMode returns true");
			assert.ok(oOverlay.getEditable() === true, "Overlay is set to 'editable = true'");
			assert.ok(oOverlay.getSelectable() === true, "Overlay is set to 'selectable = true'");
		});

		QUnit.test("When the method _checkDeveloperMode is called and Developermode is false", function (assert) {
			var oOverlay = OverlayRegistry.getOverlay(this.oComponent.createId("innerBtn12"));
			assert.notOk(this.oSelectionPlugin._checkDeveloperMode(oOverlay), "_checkDeveloperMode returns false");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});