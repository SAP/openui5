/*global QUnit*/

QUnit.config.autostart = false;
sap.ui.require([
	"sap/ui/qunit/qunit-coverage"], function(sinon) {

	"use strict";
	QUnit.config.autostart = false;

	sap.ui.define([
		"sap/ui/rta/plugin/RTAElementMover",
		"sap/ui/rta/plugin/DragDrop",
		"sap/ui/dt/OverlayRegistry",
		"sap/ui/dt/DesignTime",
		"sap/ui/dt/ElementUtil",
		"sap/ui/rta/command/CommandFactory",
		"sap/ui/fl/registry/ChangeRegistry",
		// controls
		"sap/ui/comp/smartform/SmartForm",
		"sap/ui/comp/smartform/Group",
		"sap/ui/comp/smartform/GroupElement",
		"sap/ui/layout/VerticalLayout",
		"sap/m/Button",
		"sap/m/Bar",
		"sap/ui/thirdparty/sinon",
		"sap/ui/thirdparty/sinon-ie",
		"sap/ui/thirdparty/sinon-qunit"
	], function(
		RTAElementMover, DragDropPlugin, OverlayRegistry, DesignTime, ElementUtil, CommandFactory, ChangeRegistry,
		SmartForm, Group, GroupElement, VerticalLayout, Button, Bar, sinon) {

		QUnit.start();

		var sandbox = sinon.sandbox.create();

		function fnRenderComplexView(assert) {
			var oView = sap.ui.xmlview("idMain1", "sap.ui.rta.test.additionalElements.ComplexTest");
			oView.placeAt("test-view");
			sap.ui.getCore().applyChanges();
			return oView;
		}

		/**
		 * create valid designtime metadata object
		 * @param {object} mContent 	content to be set into data aggregations content entity
		 * @returns {object}			valid designtime metadata object
		 */
		function fnBuildMetadataObject(mContent) {
			var mData = {
				data: {
					aggregations: mContent
				}
			};
			return mData;
		}

		/**
		 * create designtime object for relevant container propagation either for
		 * all dependant controlls or only for the given control
		 *
		 * @param {*} vInstanceOf 	either boolean for all control-types or string to define
		 * 							a special type of control for relevant container propagation
		 * @returns {object} 		relevant container propagation object
		 */
		function fnCreatePropagateRelevantContainerObj(vInstanceOf) {
			var vRelevantContainerValue;
			if (typeof vInstanceOf === "boolean") {
				vRelevantContainerValue = vInstanceOf;
			} else {
				vRelevantContainerValue = function (oElement) {
					var sType = oElement.getMetadata().getName();
					if (sType === vInstanceOf) {
						return true;
					}
					return false;
				};
			}
			return { propagateRelevantContainer: vRelevantContainerValue };
		}

		QUnit.module("Given a group element, overlays, RTAElementMover", {
			beforeEach : function(assert) {
					this.oSmartGroupElement = new GroupElement("stableField");
				this.oSmartForm1 = new SmartForm("form1", {
					groups : [
						new Group("group1",{
							groupElements : [
								this.oSmartGroupElement
							]
						}),
						new Group({
							groupElements : []
						})
					]
				});
				this.oSmartForm2 = new SmartForm("form2", {
					groups : [
						new Group("group2",{
							groupElements : []
						})
					]
				});

				this.oLayout = new VerticalLayout({
					content: [this.oSmartForm1, this.oSmartForm2]
				});

				var oCommandFactory = new CommandFactory();
				this.oDragDropPlugin = new DragDropPlugin({
					commandFactory : oCommandFactory
				});
				this.oDragDropPlugin.setCommandFactory(oCommandFactory);

				this.oLayout.placeAt("test-view");
				sap.ui.getCore().applyChanges();

				this.oDesignTime = new DesignTime({
					rootElements: [
						this.oLayout
					],
					plugins: [this.oDragDropPlugin]
				});

				var done = assert.async();
				this.oDesignTime.attachEventOnce("synced", function() {
					sap.ui.getCore().applyChanges();

					this.oGroup1 = sap.ui.getCore().byId("group1");
					this.oGroup2 = sap.ui.getCore().byId("group2");
					this.oGroup3 = sap.ui.getCore().byId("form1").getGroups()[1];

					this.oGroup1AggrOverlay = OverlayRegistry.getOverlay(this.oGroup1).getAggregationOverlay("formElements");
					this.oGroup2AggrOverlay = OverlayRegistry.getOverlay(this.oGroup2).getAggregationOverlay("formElements");
					this.oGroup3AggrOverlay = OverlayRegistry.getOverlay(this.oGroup3).getAggregationOverlay("formElements");
					this.oSmartGroupElementOverlay = OverlayRegistry.getOverlay(this.oSmartGroupElement);

					this.oElementMover = this.oDragDropPlugin.getElementMover();
					this.oElementMover.setMovedOverlay(this.oSmartGroupElementOverlay);

					done();
				}.bind(this));

			},
			afterEach : function(assert) {
				this.oDesignTime.destroy();
				this.oLayout.destroy();
			}
		});

		QUnit.test("and a group with stable id, when checking the target zone,", function(assert) {
			assert.ok(this.oElementMover.checkTargetZone(this.oGroup1AggrOverlay), "then the group is a possible target zone");
		});

		QUnit.test("and a group from another smart form, when checking the target zone,", function(assert) {
			assert.notOk(this.oElementMover.checkTargetZone(this.oGroup2AggrOverlay), "then the group is no target zone");
		});

		QUnit.test("and a group without stable id, when checking the target zone,", function(assert) {
			assert.notOk(this.oElementMover.checkTargetZone(this.oGroup3AggrOverlay), "then the group is not a possible target zone as the id is not stable");
		});

		QUnit.module("Given a complex test view with oData Model and a NavForm,", {

			// One model with EntityType01, EntityType02 (default) and EntityTypeNav + one i18n model ("i18n")
			beforeEach : function(assert) {
				this.oView = fnRenderComplexView(assert);
				this.oDragDropPlugin = new DragDropPlugin({
					commandFactory : new CommandFactory()
				});

				this.oDesignTime = new DesignTime({
					rootElements: [
						this.oView
					],
					plugins: [this.oDragDropPlugin]
				});

				var done = assert.async();
				this.oDesignTime.attachEventOnce("synced", function() {
					sap.ui.getCore().applyChanges();

					this.oOtherGroup = this.oView.byId("OtherGroup");
					this.oBoundGroupElement = this.oView.byId("NavForm.EntityType01.Prop1");
					this.oGroupAggrOverlay = OverlayRegistry.getOverlay(this.oOtherGroup).getAggregationOverlay("formElements");
					this.oBoundGroupElementOverlay = OverlayRegistry.getOverlay(this.oBoundGroupElement);

					this.oElementMover = this.oDragDropPlugin.getElementMover();

					done();
				}.bind(this));
			},
			afterEach : function(assert) {
				this.oDesignTime.destroy();
				this.oDragDropPlugin.destroy();
				this.oView.destroy();
			}
		});

		QUnit.test("when moving the group element bound to EntityType01 inside the group bound to EntityTypeNav...", function(assert) {
			this.oElementMover.setMovedOverlay(this.oBoundGroupElementOverlay);
			assert.ok(this.oElementMover.checkTargetZone(this.oGroupAggrOverlay), "then the group is a possible target zone");
		});

		QUnit.module("Given a complex test view with oData Model and a MainForm bound to EntityType2,", {

			// One model with EntityType01, EntityType02 (default) and EntityTypeNav + one i18n model ("i18n")
			beforeEach : function(assert) {
				this.oView = fnRenderComplexView(assert);
				this.oDragDropPlugin = new DragDropPlugin({
					commandFactory : new CommandFactory()
				});

				this.oDesignTime = new DesignTime({
					rootElements: [
						this.oView
					],
					plugins: [this.oDragDropPlugin]
				});

				var done = assert.async();
				this.oDesignTime.attachEventOnce("synced", function() {
					sap.ui.getCore().applyChanges();

					this.oGroupEntityType01 = this.oView.byId("GroupEntityType01");
					this.oGroupEntityType02 = this.oView.byId("GroupEntityType02");
					this.oForm = this.oView.byId("MainForm");

					this.oFormAggrOverlay = OverlayRegistry.getOverlay(this.oForm).getAggregationOverlay("groups");
					this.oGroupEntityType01Overlay = OverlayRegistry.getOverlay(this.oGroupEntityType01);
					this.oGroupEntityType02Overlay = OverlayRegistry.getOverlay(this.oGroupEntityType02);

					this.oElementMover = this.oDragDropPlugin.getElementMover();

					done();
				}.bind(this));
			},
			afterEach : function(assert) {
				this.oDesignTime.destroy();
				this.oDragDropPlugin.destroy();
				this.oView.destroy();
			}
		});

		QUnit.test("when DT is loaded and moving the group bound to EntityType02 inside the form bound to EntityType02...", function(assert) {
			this.oElementMover.setMovedOverlay(this.oGroupEntityType02Overlay);
			assert.ok(this.oElementMover.checkTargetZone(this.oFormAggrOverlay), "then the form is a possible target zone");
		});

		QUnit.test("when moving the group bound to EntityType01 inside the form bound to EntityType02...", function(assert) {
			this.oElementMover.setMovedOverlay(this.oGroupEntityType01Overlay);
			assert.ok(this.oElementMover.checkTargetZone(this.oFormAggrOverlay), "then the form is a possible target zone");
		});

		QUnit.module("Given verticalLayout with Buttons (first szenario) without relevantContainer propagation", {
			beforeEach : function(assert) {

				// first szenario
				// VerticalLayout
				//    MovedButton1
				//    Button2

				this.oMovedButton1 = new Button("button1");
				this.oButton2 = new Button("button2");
				this.oLayout = new VerticalLayout("layout1", {
					content: [this.oMovedButton1, this.oButton2]
				});

				var oCommandFactory = new CommandFactory();
				this.oDragDropPlugin = new DragDropPlugin({
					commandFactory : oCommandFactory
				});

				this.oLayout.placeAt("test-view");
				sap.ui.getCore().applyChanges();

				// stub designtime metadata
				var oLayoutMetadata = fnBuildMetadataObject({
					content: {
						actions: {
							move: "moveControls"
						}
					}
				});
				var oEmptyMetadata = fnBuildMetadataObject({});

				var fnLoadDtMetadataStub = sandbox.stub(ElementUtil, "loadDesignTimeMetadata");
				fnLoadDtMetadataStub.withArgs(this.oLayout).returns(Promise.resolve(oLayoutMetadata.data));
				fnLoadDtMetadataStub.withArgs(this.oMovedButton1).returns(Promise.resolve(oEmptyMetadata.data));
				fnLoadDtMetadataStub.withArgs(this.oButton2).returns(Promise.resolve(oEmptyMetadata.data));

				// create designtime
				this.oDesignTime = new DesignTime({
					rootElements: [
						this.oLayout
					],
					plugins: [this.oDragDropPlugin]
				});

				var done = assert.async();
				this.oDesignTime.attachEventOnce("synced", function() {

					this.oMovedButton1Overlay = OverlayRegistry.getOverlay(this.oMovedButton1);
					this.oLayoutAggregationOverlay = OverlayRegistry.getOverlay(this.oLayout).getAggregationOverlay("content");
					this.oElementMover = this.oDragDropPlugin.getElementMover();
					this.oElementMover.setMovedOverlay(this.oMovedButton1Overlay);

					done();
				}.bind(this));

			},
			afterEach : function(assert) {
				this.oMovedButton1Overlay.destroy();
				this.oLayoutAggregationOverlay.destroy();
				this.oDesignTime.destroy();
				this.oLayout.destroy();
				sandbox.restore();
			}
		});

		QUnit.test("when DT is loaded and moving the movedButton inside the layout...", function(assert) {
			this.oElementMover.setMovedOverlay(this.oMovedButton1Overlay);
			assert.ok(this.oElementMover.checkTargetZone(this.oLayoutAggregationOverlay), "then the layout is a possible target zone");
		});

		QUnit.test("when DT is loaded and moving the movedButton inside the layout but without changeHandler...", function(assert) {
			var oChangeRegistry = ChangeRegistry.getInstance();
			sandbox.stub(oChangeRegistry, "getRegistryItems").returns(undefined);
			this.oElementMover.setMovedOverlay(this.oMovedButton1Overlay);
			assert.notOk(this.oElementMover.checkTargetZone(this.oLayoutAggregationOverlay), "then the layout is not a possible target zone");
		});

		QUnit.module("Given verticalLayout with Button and another verticalLayout inside (second szenario) without relevantContainer propagation", {
			beforeEach : function(assert) {

				// second szenario
				// VerticalLayout (outerLayout)
				//    MovedButton1
				//    VerticalLayout (innerLayout)
				//       Button2

				this.oMovedButton1 = new Button("movedButton1");
				this.oButton2 = new Button("button2");
				this.oInnerLayout = new VerticalLayout("innerlayout", {
					content: [this.oButton2]
				});
				this.oOuterLayout = new VerticalLayout("outerLayout", {
					content: [this.oMovedButton1, this.oInnerLayout]
				});

				var oCommandFactory = new CommandFactory();
				this.oDragDropPlugin = new DragDropPlugin({
					commandFactory : oCommandFactory
				});

				this.oOuterLayout.placeAt("test-view");
				sap.ui.getCore().applyChanges();

				// stub designtime metadata
				var oLayoutMetadata = fnBuildMetadataObject({
					content: {
						domRef: ":sap-domref",
						actions: {
							move: "moveControls"
						}
					}
				});
				var oEmptyMetadata = fnBuildMetadataObject({});

				var fnLoadDtMetadataStub = sandbox.stub(ElementUtil, "loadDesignTimeMetadata");
				fnLoadDtMetadataStub.withArgs(this.oInnerLayout).returns(Promise.resolve(oLayoutMetadata.data));
				fnLoadDtMetadataStub.withArgs(this.oOuterLayout).returns(Promise.resolve(oLayoutMetadata.data));
				fnLoadDtMetadataStub.withArgs(this.oMovedButton1).returns(Promise.resolve(oEmptyMetadata.data));
				fnLoadDtMetadataStub.withArgs(this.oButton2).returns(Promise.resolve(oEmptyMetadata.data));

				// create designtime
				this.oDesignTime = new DesignTime({
					rootElements: [
						this.oOuterLayout
					],
					plugins: [this.oDragDropPlugin]
				});

				var done = assert.async();
				this.oDesignTime.attachEventOnce("synced", function() {

					this.oInnerLayoutAggregationOverlay = OverlayRegistry.getOverlay(this.oInnerLayout).getAggregationOverlay("content");
					this.oMovedButton1Overlay = OverlayRegistry.getOverlay(this.oMovedButton1);
					this.oElementMover = this.oDragDropPlugin.getElementMover();
					this.oElementMover.setMovedOverlay(this.oMovedButton1Overlay);

					done();
				}.bind(this));

			},
			afterEach : function(assert) {
				this.oMovedButton1Overlay.destroy();
				this.oInnerLayoutAggregationOverlay.destroy();
				this.oDesignTime.destroy();
				this.oOuterLayout.destroy();
				sandbox.restore();
			}
		});

		QUnit.test("when DT is loaded and moving the movedButton to the innerLayout...", function(assert) {
			this.oElementMover.setMovedOverlay(this.oMovedButton1Overlay);
			assert.notOk(this.oElementMover.checkTargetZone(this.oInnerLayoutAggregationOverlay), "then the innerLayout is not a possible target zone");
		});

		QUnit.module("Given smartForm, Groups and GroupElements (third szenario) with relevantContainer propagation", {
			beforeEach : function(assert) {

				// third szenario
				// SmartForm
				//    Group1
				//       MovedGroupElement1
				//          Button1
				//    Group2
				//       GroupElement2
				//          Button2
				this.oButton1 = new Button("button1");
				this.oButton2 = new Button("button2");
				this.oMovedGroupElement1 = new GroupElement("movedGroupElement1", {
					elements: [this.oButton1]
				});
				this.oGroupElement2 = new GroupElement("groupElement2", {
					elements: [this.oButton2]
				});
				this.oGroup1 = new Group("group1", {
					groupElements : [this.oMovedGroupElement1]
				});
				this.oGroup2 = new Group("group2", {
					groupElements : [this.oGroupElement2]
				});
				this.oSmartForm1 = new SmartForm("smartForm1", {
					groups : [ this.oGroup1, this.oGroup2]
				});

				var oCommandFactory = new CommandFactory();
				this.oDragDropPlugin = new DragDropPlugin({
					commandFactory : oCommandFactory
				});

				this.oSmartForm1.placeAt("test-view");
				sap.ui.getCore().applyChanges();

				// stub designtime metadata
				var oSmartFormPropagation = fnCreatePropagateRelevantContainerObj(true);
				var oSmartFormMetadata = fnBuildMetadataObject({ groups: oSmartFormPropagation });
				var oGroupMetadata = fnBuildMetadataObject({
					groupElements: {
						ignore: true
					},
					formElements: {
						actions: {
							move: {
								changeType : "moveControls"
							}
						}
					}
				});
				var oEmptyMetadata = fnBuildMetadataObject({});

				var fnLoadDtMetadataStub = sandbox.stub(ElementUtil, "loadDesignTimeMetadata");
				fnLoadDtMetadataStub.withArgs(this.oSmartForm1).returns(Promise.resolve(oSmartFormMetadata.data));
				fnLoadDtMetadataStub.withArgs(this.oGroup1).returns(Promise.resolve(oGroupMetadata.data));
				fnLoadDtMetadataStub.withArgs(this.oGroup2).returns(Promise.resolve(oGroupMetadata.data));
				fnLoadDtMetadataStub.withArgs(this.oMovedGroupElement1).returns(Promise.resolve(oEmptyMetadata.data));
				fnLoadDtMetadataStub.withArgs(this.oGroupElement2).returns(Promise.resolve(oEmptyMetadata.data));
				fnLoadDtMetadataStub.withArgs(this.oMovedGroupElement1.getLabelControl()).returns(Promise.resolve(oEmptyMetadata.data));
				fnLoadDtMetadataStub.withArgs(this.oGroupElement2.getLabelControl()).returns(Promise.resolve(oEmptyMetadata.data));
				fnLoadDtMetadataStub.withArgs(this.oButton1).returns(Promise.resolve(oEmptyMetadata.data));
				fnLoadDtMetadataStub.withArgs(this.oButton2).returns(Promise.resolve(oEmptyMetadata.data));

				// create designtime
				this.oDesignTime = new DesignTime({
					rootElements: [
						this.oSmartForm1
					],
					plugins: [this.oDragDropPlugin]
				});

				var done = assert.async();
				this.oDesignTime.attachEventOnce("synced", function() {

					this.oMovedGroupElement1Overlay = OverlayRegistry.getOverlay(this.oMovedGroupElement1);
					this.oGroupAggregationOverlay = OverlayRegistry.getOverlay(this.oGroup2).getAggregationOverlay("formElements");
					this.oElementMover = this.oDragDropPlugin.getElementMover();
					this.oElementMover.setMovedOverlay(this.oButton1Overlay);

					done();
				}.bind(this));

			},
			afterEach : function(assert) {
				this.oMovedGroupElement1Overlay.destroy();
				this.oGroupAggregationOverlay.destroy();
				this.oDesignTime.destroy();
				this.oSmartForm1.destroy();
				sandbox.restore();
			}
		});

		QUnit.test("when DT is loaded and moving the movedGroupElement1 to the Group2...", function(assert) {
			this.oElementMover.setMovedOverlay(this.oMovedGroupElement1Overlay);
			assert.ok(this.oElementMover.checkTargetZone(this.oGroupAggregationOverlay), "then the group2 is a possible target zone");
		});

		QUnit.module("Given Bar with Buttons (fourth szenario) without relevantContainer propagation", {
			beforeEach : function(assert) {

				// fourth szenario
				// Bar
				//    Aggregation1 (contentLeft)
				//        MovedButton1
				//    Aggregation2 (contentRight)
				//        Button2

				this.oMovedButton1 = new Button("movedButton1");
				this.oButton2 = new Button("button2");
				this.oBar = new Bar("bar1", {
					contentLeft: [this.oMovedButton1],
					contentRight: [this.oButton2]
				});

				var oCommandFactory = new CommandFactory();
				this.oDragDropPlugin = new DragDropPlugin({
					commandFactory : oCommandFactory
				});

				this.oBar.placeAt("test-view");
				sap.ui.getCore().applyChanges();

				// stub designtime metadata
				var oEmptyMetadata = fnBuildMetadataObject({});
				var oBarMetadata = fnBuildMetadataObject({
					contentLeft: {
						actions: {
							move: "moveControls"
						}
					},
					contentMiddle: {},
					contentRight: {
						actions: {
							move: "moveControls"
						}
					}
				});

				var fnLoadDtMetadataStub = sandbox.stub(ElementUtil, "loadDesignTimeMetadata");
				fnLoadDtMetadataStub.withArgs(this.oBar).returns(Promise.resolve(oBarMetadata.data));
				fnLoadDtMetadataStub.withArgs(this.oMovedButton1).returns(Promise.resolve(oEmptyMetadata.data));
				fnLoadDtMetadataStub.withArgs(this.oButton2).returns(Promise.resolve(oEmptyMetadata.data));

				// create designtime
				this.oDesignTime = new DesignTime({
					rootElements: [
						this.oBar
					],
					plugins: [this.oDragDropPlugin]
				});

				var done = assert.async();
				this.oDesignTime.attachEventOnce("synced", function() {

					this.oMovedButton1Overlay = OverlayRegistry.getOverlay(this.oMovedButton1);
					this.oBarRightAggregationOverlay = OverlayRegistry.getOverlay(this.oBar).getAggregationOverlay("contentRight");
					this.oBarMiddleAggregationOverlay = OverlayRegistry.getOverlay(this.oBar).getAggregationOverlay("contentMiddle");
					this.oElementMover = this.oDragDropPlugin.getElementMover();
					this.oElementMover.setMovedOverlay(this.oMovedButton1Overlay);

					done();
				}.bind(this));

			},
			afterEach : function(assert) {
				this.oMovedButton1Overlay.destroy();
				this.oBarRightAggregationOverlay.destroy();
				this.oBarMiddleAggregationOverlay.destroy();
				this.oDesignTime.destroy();
				this.oBar.destroy();
				sandbox.restore();
			}
		});

		QUnit.test("when DT is loaded and moving the movedButton to the right bar aggregation...", function(assert) {
			this.oElementMover.setMovedOverlay(this.oMovedButton1Overlay);
			assert.ok(this.oElementMover.checkTargetZone(this.oBarRightAggregationOverlay), "then the right bar aggregation is a possible target zone");
		});

		QUnit.test("when DT is loaded and moving the movedButton to the middle bar aggregation without move action...", function(assert) {
			this.oElementMover.setMovedOverlay(this.oMovedButton1Overlay);
			assert.notOk(this.oElementMover.checkTargetZone(this.oBarMiddleAggregationOverlay), "then the right bar aggregation is not a possible target zone");
		});
	});

});
