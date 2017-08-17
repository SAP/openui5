/*global QUnit sinon*/

jQuery.sap.require("sap.ui.qunit.qunit-coverage");

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/rta/plugin/Remove",
	"sap/ui/rta/plugin/Combine",
	"sap/ui/rta/plugin/Selection",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/Utils",
	"sap/m/Button",
	"sap/m/VBox",
	"sap/m/HBox",
	"sap/m/Bar",
	"sap/m/Text",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/registry/SimpleChanges",
	"sap/ui/thirdparty/sinon"
], function(
	Remove,
	Combine,
	Selection,
	CommandFactory,
	DesignTime,
	OverlayRegistry,
	FlUtils,
	Button,
	VBox,
	HBox,
	Bar,
	Text,
	ChangeRegistry,
	SimpleChanges
){
	"use strict";
	QUnit.start();

	QUnit.module("Given a Selection plugin and designtime in MultiSelection mode and controls with custom dt metadata to simulate different cases...", {
		beforeEach : function(assert) {
			this.sandbox = sinon.sandbox.create();

			this.oComponent = new sap.ui.core.UIComponent();
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
				"sap.m.Button": [
				],
				"sap.m.Text": [
					SimpleChanges.hideControl
				]
			});

			this.oCommandFactory = new CommandFactory({layer:"CUSTOMER", developerMode: false});

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
			this.oDesignTime = new sap.ui.dt.DesignTime({
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
							}
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

			this.oDesignTime.setSelectionMode(sap.ui.dt.SelectionMode.Multi);

		},
		afterEach : function(assert) {
			this.sandbox.restore();
			this.oComponent.destroy();
			this.oVBox.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("when trying to select the first compatible control (removable/combinable)", function(assert){
		var oOverlay = OverlayRegistry.getOverlay(this.oComponent.createId("innerBtn12"));
		oOverlay.setSelected(true);

		assert.ok(oOverlay.isSelected(), "then single overlay is selected");
	});


	QUnit.test("when trying to select the 2. compatible (removable/combinable) control", function(assert){
		var oOverlay1 = OverlayRegistry.getOverlay(this.oComponent.createId("innerBtn11"));
		var oOverlay2 = OverlayRegistry.getOverlay(this.oComponent.createId("innerBtn12"));
		oOverlay1.setSelected(true);
		oOverlay2.setSelected(true);

		assert.ok(oOverlay1.isSelected(), "then innerBtn11 overlay is selected");
		assert.ok(oOverlay2.isSelected(), "then innerBtn12 overlay is selected");
	});


	QUnit.test("when trying to select the 2. control not multiselection enabled control (removable/combinable)", function(assert){
		var oOverlay1 = OverlayRegistry.getOverlay(this.oComponent.createId("container1"));
		var oOverlay2 = OverlayRegistry.getOverlay(this.oComponent.createId("othercontainer3"));
		oOverlay2.setSelectable(true);

		oOverlay1.setSelected(true);
		oOverlay2.setSelected(true);

		assert.ok(oOverlay1.isSelected(), "then container1 overlay is selected");
		assert.notOk(oOverlay2.isSelected(), "then othercontainer3 overlay is not selected");
	});

	QUnit.test("when trying to select 3 overlays and the 2. control is multiselection enabled for a different action", function(assert){
		var oOverlay1 = OverlayRegistry.getOverlay(this.oComponent.createId("innerBtn12"));
		var oOverlay2 = OverlayRegistry.getOverlay(this.oComponent.createId("innerTxt13"));
		var oOverlay3 = OverlayRegistry.getOverlay(this.oComponent.createId("innerBtn11"));

		oOverlay1.setSelected(true);
		oOverlay2.setSelected(true);
		oOverlay3.setSelected(true);

		assert.ok(oOverlay1.isSelected(), "then innerBtn12 overlay is selected");
		assert.notOk(oOverlay2.isSelected(), "then innerTxt13 overlay for the different action is not selected");
		assert.ok(oOverlay3.isSelected(), "then innerBtn11 overlay is selected");
	});

	QUnit.test("when trying to select the 2. control with different parent", function(assert){
		var oOverlay1 = OverlayRegistry.getOverlay(this.oComponent.createId("innerBtn12"));
		var oOverlay2 = OverlayRegistry.getOverlay(this.oComponent.createId("btnOutsideContainer"));
		oOverlay2.setSelectable(true);

		oOverlay1.setSelected(true);
		oOverlay2.setSelected(true);

		assert.ok(oOverlay1.isSelected(), "then innerBtn12 overlay is selected");
		assert.notOk(oOverlay2.isSelected(), "then btnOutsideContainer overlay from different parent is not selected");
	});

	QUnit.test("when trying to select innerVBox1Txt inside the innerVBox (both have HBox container4 as their relevant container, but innerVBox is parent of text)", function(assert){
		var oOverlay1 = OverlayRegistry.getOverlay(this.oComponent.createId("innerVBox1Txt"));
		var oOverlay2 = OverlayRegistry.getOverlay(this.oComponent.createId("innerVBox1"));

		oOverlay1.setSelected(true);
		oOverlay2.setSelected(true);

		assert.ok(oOverlay1.isSelected(), "then innerVBox1Txt overlay is selected");
		assert.notOk(oOverlay2.isSelected(), "then innerVBox1 overlay is not selected");
	});

	QUnit.test("when trying to select the texts inside the innerVBox1 & innerVBox2 (different parents, same control type and same relevant container)", function(assert){
		var oOverlay1 = OverlayRegistry.getOverlay(this.oComponent.createId("innerVBox1Txt"));
		var oOverlay2 = OverlayRegistry.getOverlay(this.oComponent.createId("innerVBox2Txt"));

		oOverlay1.setSelected(true);
		oOverlay2.setSelected(true);

		assert.ok(oOverlay1.isSelected(), "then innerVBox1Txt overlay is selected");
		assert.ok(oOverlay2.isSelected(), "then innerVBox2Txt overlay is selected");
	});

	QUnit.test("when trying to select innerVBox1Txt in innerVBox1 and the container innerVBox2 (different control types and same relevant container)", function(assert){
		var oOverlay1 = OverlayRegistry.getOverlay(this.oComponent.createId("innerVBox1Txt"));
		var oOverlay2 = OverlayRegistry.getOverlay(this.oComponent.createId("innerVBox2"));

		oOverlay1.setSelected(true);
		oOverlay2.setSelected(true);

		assert.ok(oOverlay1.isSelected(), "then innerVBox1Txt overlay is selected");
		assert.notOk(oOverlay2.isSelected(), "then innerVBox2 overlay is not selected");
	});

	//Note: we might support this case in the future
	QUnit.test("when trying to select innerVBox1Txt in innerVBox1 and innerVBox2Btn in innerVBox2 (different control types, different parents and same relevant container)", function(assert){
		var oOverlay1 = OverlayRegistry.getOverlay(this.oComponent.createId("innerVBox1Txt"));
		var oOverlay2 = OverlayRegistry.getOverlay(this.oComponent.createId("innerVBox2Btn"));

		oOverlay1.setSelected(true);
		oOverlay2.setSelected(true);

		assert.ok(oOverlay1.isSelected(), "then innerVBox1Txt overlay is selected");
		assert.notOk(oOverlay2.isSelected(), "then innerVBox2Btn overlay is not selected");
	});

});