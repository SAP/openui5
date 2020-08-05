/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/DragDrop",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/OverlayUtil",
	"sap/ui/dt/Util",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/dt/plugin/ElementMover",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/comp/smartform/SmartForm",
	"sap/ui/comp/smartform/Group",
	"sap/ui/comp/smartform/GroupElement",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Button",
	"sap/m/Bar",
	"sap/ui/core/ComponentContainer",
	"sap/ui/thirdparty/sinon-4"
], function(
	CommandFactory,
	DragDropPlugin,
	OverlayRegistry,
	OverlayUtil,
	DtUtil,
	DesignTime,
	ElementDesignTimeMetadata,
	DtElementMover,
	ChangeRegistry,
	SmartForm,
	Group,
	GroupElement,
	VerticalLayout,
	Button,
	Bar,
	ComponentContainer,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

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

	// test app only used in the first module
	QUnit.module("Given a complex test view rendered and data ready", {
		// One model with EntityType01, EntityType02 (default) and EntityTypeNav + one i18n model ("i18n")
		before: function() {
			QUnit.config.fixture = null;
			var oComp = sap.ui.getCore().createComponent({
				name : "sap.ui.rta.test.additionalElements",
				id : "Comp1",
				settings : {
					componentData : {
						showAdaptButton : true,
						useSessionStorage: true
					}
				}
			});

			this.oCompCont = new ComponentContainer({
				component: oComp
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oView = sap.ui.getCore().byId("Comp1---idMain1");
			return this.oView.loaded().then(function() {
				return this.oView.getController().isDataReady();
			}.bind(this));
		},
		beforeEach : function (assert) {
			var done = assert.async();
			this.oDragDropPlugin = new DragDropPlugin({
				commandFactory : new CommandFactory()
			});

			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oView
				],
				plugins: [this.oDragDropPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				sap.ui.getCore().applyChanges();
				var oNavGroup = this.oView.byId("ObjectPageSubSectionForNavigation").getBlocks()[0].getGroups()[0];
				var oOtherGroup = this.oView.byId("ObjectPageSubSectionForNavigation").getBlocks()[0].getGroups()[1];
				var oBoundGroupElement = this.oView.byId("ObjectPageSubSectionForNavigation").getBlocks()[0].getGroups()[1].getGroupElements()[0];
				var oGroupEntityType01 = this.oView.byId("GroupEntityType01");
				var oGroupEntityType02 = this.oView.byId("GroupEntityType02");
				var oForm = this.oView.byId("MainForm");

				this.oOtherGroupButton = this.oView.byId("ObjectPageSubSectionForNavigation").getBlocks()[0].getGroups()[1].getGroupElements()[1];
				this.oNavGroupAggrOverlay = OverlayRegistry.getOverlay(oNavGroup).getAggregationOverlay("formElements");
				this.oOtherGroupAggrOverlay = OverlayRegistry.getOverlay(oOtherGroup).getAggregationOverlay("formElements");
				this.oBoundGroupElementOverlay = OverlayRegistry.getOverlay(oBoundGroupElement);
				this.oFormAggrOverlay = OverlayRegistry.getOverlay(oForm).getAggregationOverlay("groups");
				this.oGroupEntityType01Overlay = OverlayRegistry.getOverlay(oGroupEntityType01);
				this.oGroupEntityType02Overlay = OverlayRegistry.getOverlay(oGroupEntityType02);
				this.oElementMover = this.oDragDropPlugin.getElementMover();

				done();
			}, this);
		},
		after: function() {
			this.oCompCont.destroy();
			QUnit.config.fixture = '';
		},
		afterEach : function () {
			sandbox.restore();
			this.oDesignTime.destroy();
			this.oDragDropPlugin.destroy();
			this.oElementMover.destroy();
		}
	}, function () {
		QUnit.test("when moving the group element bound to EntityType01 inside the group bound to EntityTypeNav...", function(assert) {
			this.oElementMover.setMovedOverlay(this.oBoundGroupElementOverlay);
			return this.oElementMover.checkTargetZone(this.oNavGroupAggrOverlay)
				.then(function(bCheckTargetZone) {
					assert.notOk(bCheckTargetZone, "then the group bound to the navigation is not a possible target zone");
					return this.oElementMover.checkTargetZone(this.oOtherGroupAggrOverlay);
				}.bind(this))
				.then(function(bCheckTargetZone) {
					assert.ok(bCheckTargetZone, "then the group with the element is a possible target zone");
					this.oOtherGroupButton.setVisible(false);
					return DtUtil.waitForSynced(this.oDesignTime)();
				}.bind(this))
				.then(this.oElementMover.checkMovable.bind(this.oElementMover, this.oBoundGroupElementOverlay))
				.then(function(bMovable) {
					assert.notOk(bMovable, "then the field is no longer movable if there are no more target zones");
				});
		});

		QUnit.test("when DT is loaded and moving the group bound to EntityType02 inside the form bound to EntityType02...", function(assert) {
			this.oElementMover.setMovedOverlay(this.oGroupEntityType02Overlay);
			return this.oElementMover.checkTargetZone(this.oFormAggrOverlay)
				.then(function(bCheckTargetZone) {
					assert.ok(bCheckTargetZone, "then the form is a possible target zone");
				});
		});

		QUnit.test("when moving the group bound to EntityType01 inside the form bound to EntityType02...", function(assert) {
			this.oElementMover.setMovedOverlay(this.oGroupEntityType01Overlay);
			return this.oElementMover.checkTargetZone(this.oFormAggrOverlay)
				.then(function(bCheckTargetZone) {
					assert.ok(bCheckTargetZone, "then the form is a possible target zone");
				});
		});

		QUnit.test("when the element is not available", function(assert) {
			sandbox.stub(DtElementMover.prototype, "checkTargetZone").resolves(true);
			sandbox.stub(this.oGroupEntityType01Overlay, "getElement");

			return this.oElementMover.checkTargetZone(this.oFormAggrOverlay, this.oGroupEntityType01Overlay)
			.then(function(bTargetZone) {
				assert.ok(true, "the function resolves");
				assert.equal(bTargetZone, false, "the form is not a target zone");
			});
		});

		QUnit.test("when the parent is not available", function(assert) {
			sandbox.stub(DtElementMover.prototype, "checkTargetZone").resolves(true);
			sandbox.stub(this.oFormAggrOverlay, "getParent");

			return this.oElementMover.checkTargetZone(this.oFormAggrOverlay, this.oGroupEntityType01Overlay)
			.then(function(bTargetZone) {
				assert.ok(true, "the function resolves");
				assert.equal(bTargetZone, false, "the form is not a target zone");
			});
		});
	});

	QUnit.module("Given a group element, overlays, RTAElementMover", {
		beforeEach : function(assert) {
			this.oSmartGroupElement = new GroupElement("stableField", {
				elements: [new Button("button1", {text: "mybutton"})]
			});

			this.oSmartForm1 = new SmartForm("form1", {
				groups : [
					new Group("group1", {
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
					new Group("group2", {
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

			this.oLayout.placeAt("qunit-fixture");
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
		afterEach: function () {
			this.oDesignTime.destroy();
			this.oLayout.destroy();
		}
	}, function () {
		QUnit.test("and a group with stable id, when checking the target zone,", function(assert) {
			return this.oElementMover.checkTargetZone(this.oGroup1AggrOverlay)
				.then(function(bCheckTargetZone) {
					assert.ok(bCheckTargetZone, "then the group is a possible target zone");
					return this.oElementMover.checkMovable(this.oSmartGroupElementOverlay);
				}.bind(this))
				.then(function(bMovable) {
					assert.notOk(bMovable, "but the element is not movable as there are no more elements in this group");
				});
		});

		QUnit.test("and a group with stable id, when checking the target zone, during navigation mode", function(assert) {
			// switch the navigation mode on
			this.oDesignTime.setEnabled(false);
			return DtUtil.waitForSynced(this.oDesignTime)()
				.then(this.oElementMover.checkTargetZone.bind(this.oElementMover, this.oGroup1AggrOverlay, this.oSmartGroupElementOverlay, false))
				.then(function(bCheckTargetZone) {
					assert.ok(bCheckTargetZone, "then the group is a possible target zone");
					return this.oElementMover.checkMovable(this.oSmartGroupElementOverlay);
				}.bind(this));
		});

		QUnit.test("and a group from another smart form, when checking the target zone,", function(assert) {
			return this.oElementMover.checkTargetZone(this.oGroup2AggrOverlay)
				.then(function(bCheckTargetZone) {
					assert.notOk(bCheckTargetZone, "then the group is no target zone");
				});
		});

		QUnit.test("and a group without stable id, when checking the target zone,", function(assert) {
			return this.oElementMover.checkTargetZone(this.oGroup3AggrOverlay)
				.then(function(bCheckTargetZone) {
					assert.notOk(bCheckTargetZone, "then the group is not a possible target zone as the id is not stable");
				});
		});
	});

	QUnit.module("Given verticalLayout with Buttons (first scenario) without relevantContainer propagation", {
		beforeEach : function(assert) {
			// first scenario
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

			this.oLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			// create designtime
			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oLayout
				],
				plugins: [this.oDragDropPlugin],
				designTimeMetadata : {
					"sap.m.Button" : {},
					"sap.ui.layout.VerticalLayout" : {
						content: {
							actions: {
								move: "moveControls"
							}
						}
					}
				}
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
		afterEach : function () {
			this.oMovedButton1Overlay.destroy();
			this.oLayoutAggregationOverlay.destroy();
			this.oDesignTime.destroy();
			this.oLayout.destroy();
			this.oButton2.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when DT is loaded and moving the movedButton inside the layout...", function(assert) {
			this.oElementMover.setMovedOverlay(this.oMovedButton1Overlay);
			return this.oElementMover.checkTargetZone(this.oLayoutAggregationOverlay)
				.then(function(bCheckTargetZone) {
					assert.ok(bCheckTargetZone, "then the layout is a possible target zone");
				});
		});

		QUnit.test("when DT is loaded and moving the movedButton inside the layout but without changeHandler...", function(assert) {
			var oChangeRegistry = ChangeRegistry.getInstance();
			sandbox.stub(oChangeRegistry, "getChangeHandler").rejects(undefined);
			this.oElementMover.setMovedOverlay(this.oMovedButton1Overlay);
			return this.oElementMover.checkTargetZone(this.oLayoutAggregationOverlay)
				.then(function(bCheckTargetZone) {
					assert.notOk(bCheckTargetZone, "then the layout is not a possible target zone");
				});
		});

		QUnit.test("when Button2 is removed, leaving movedButton as the only element left in the Layout...", function(assert) {
			this.oLayout.removeContent(this.oButton2);
			return this.oElementMover.checkMovable(this.oMovedButton1Overlay)
				.then(function(bMovable) {
					assert.notOk(bMovable, "then the movedButton is no longer movable");
				});
		});

		QUnit.test("when Button2 is destroyed, leaving movedButton as the only element left in the Layout...", function(assert) {
			this.oButton2.destroy();
			return this.oElementMover.checkMovable(this.oMovedButton1Overlay)
				.then(function(bMoveable) {
					assert.notOk(bMoveable, "then the movedButton is no longer movable");
				});
		});

		QUnit.test("when the button has 'not-adaptable' as actions in DT", function(assert) {
			sandbox.stub(this.oMovedButton1Overlay.getDesignTimeMetadata(), "markedAsNotAdaptable").returns(true);
			return this.oElementMover.checkMovable(this.oMovedButton1Overlay).then(function(bMoveable) {
				assert.notOk(bMoveable, "then the movedButton is not movable");
			});
		});
	});

	QUnit.module("Given verticalLayout with Button and another verticalLayout inside (second scenario) without relevantContainer propagation", {
		beforeEach : function(assert) {
			// second scenario
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

			this.oOuterLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			// create designtime
			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oOuterLayout
				],
				plugins: [this.oDragDropPlugin],
				designTimeMetadata : {
					"sap.m.Button" : {},
					"sap.ui.layout.VerticalLayout" : {
						content: {
							domRef: ":sap-domref",
							actions: {
								move: "moveControls"
							}
						}
					}
				}
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
		afterEach : function () {
			this.oMovedButton1Overlay.destroy();
			this.oInnerLayoutAggregationOverlay.destroy();
			this.oDesignTime.destroy();
			this.oOuterLayout.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when DT is loaded and moving the movedButton to the innerLayout...", function(assert) {
			this.oElementMover.setMovedOverlay(this.oMovedButton1Overlay);
			return this.oElementMover.checkTargetZone(this.oInnerLayoutAggregationOverlay)
				.then(function(bCheckTargetZone) {
					assert.notOk(bCheckTargetZone, "then the innerLayout is not a possible target zone");
				});
		});
	});

	QUnit.module("Given smartForm, Groups and GroupElements (third scenario) with relevantContainer propagation", {
		beforeEach : function(assert) {
			// third scenario
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
				groups : [this.oGroup1, this.oGroup2]
			});

			var oCommandFactory = new CommandFactory();
			this.oDragDropPlugin = new DragDropPlugin({
				commandFactory : oCommandFactory
			});

			this.oSmartForm1.placeAt("qunit-fixture");
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

			// create designtime
			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oSmartForm1
				],
				plugins: [this.oDragDropPlugin],
				designTimeMetadata : {
					"sap.m.Button" : {},
					"sap.ui.comp.smartform.SmartForm" : oSmartFormMetadata.data,
					"sap.ui.comp.smartform.Group" : oGroupMetadata.data,
					"sap.ui.comp.smartform.GroupElement" : {}
				}
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
		afterEach : function () {
			this.oMovedGroupElement1Overlay.destroy();
			this.oGroupAggregationOverlay.destroy();
			this.oDesignTime.destroy();
			this.oSmartForm1.destroy();
			this.oGroup2.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when DT is loaded and movedGroupElement1 is moved to the Group2...", function(assert) {
			this.oElementMover.setMovedOverlay(this.oMovedGroupElement1Overlay);
			var oSourceInformation = OverlayUtil.getParentInformation(this.oMovedGroupElement1Overlay);
			var oTargetInformation = {
				parent: OverlayRegistry.getOverlay(this.oGroup2),
				aggregation: "group",
				index: this.oGroup2.getGroupElements().length
			};
			var fnGetCommandForStub;
			return this.oElementMover.checkTargetZone(this.oGroupAggregationOverlay)
				.then(function(bCheckTargetZone) {
					assert.ok(bCheckTargetZone, "then the group2 is a possible target zone");
					// mock variant management
					sandbox.stub(this.oElementMover.oBasePlugin, "getVariantManagementReference").returns("mockVariantReference");
					// simulate move
					sandbox.stub(this.oMovedGroupElement1Overlay, "getParent").returns(this.oGroupAggregationOverlay);
					fnGetCommandForStub = sandbox.stub(this.oElementMover.getCommandFactory(), "getCommandFor").returns(Promise.resolve());
					sandbox.stub(OverlayUtil, "getParentInformation")
						.callThrough()
						.withArgs(this.oMovedGroupElement1Overlay)
						.returns(oTargetInformation);

					return this.oElementMover.buildMoveCommand();
				}.bind(this))

				.then(function() {
					assert.strictEqual(arguments[0], undefined, "then a promise is received resolving to undefined");
					assert.ok(
						fnGetCommandForStub.calledWith(this.oMovedGroupElement1Overlay.getRelevantContainer(), "Move", {
							movedElements: [{
								element: this.oMovedGroupElement1,
								sourceIndex: oSourceInformation.index,
								targetIndex: this.oGroup2.getGroupElements().length
							}],
							source: delete oSourceInformation.index && oSourceInformation,
							target: delete oTargetInformation.index && oTargetInformation
						}, this.oGroupAggregationOverlay.getDesignTimeMetadata(), "mockVariantReference"),
						"then CommandFactory.getCommandFor() called with the right parameters"
					);
				}.bind(this));
		});

		QUnit.test("when Group 2 is removed and movedGroupElement1 does not have any valid target zones anymore...", function(assert) {
			this.oSmartForm1.removeGroup(this.oGroup2);
			return this.oElementMover.checkMovable(this.oMovedGroupElement1Overlay)
				.then(function(bMoveable) {
					assert.notOk(bMoveable, "then the movedGroupElement1 is no longer movable");
				});
		});

		QUnit.test("when DT is loaded and moving a group element to the same Group, to where it originally belonged", function(assert) {
			this.oElementMover.setMovedOverlay(this.oMovedGroupElement1Overlay);
			return this.oElementMover.buildMoveCommand()
				.then(function() {
					assert.strictEqual(arguments[0], undefined, "then a promise is received resolving to undefined");
				});
		});
	});

	QUnit.module("Given Bar with Buttons (fourth scenario) without relevantContainer propagation", {
		beforeEach : function(assert) {
			// fourth scenario
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

			this.oBar.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			// stub designtime metadata
			var oBarMetadata = new ElementDesignTimeMetadata({
				data: {
					aggregations: {
						contentLeft: {
							actions: {
								move: "moveControls"
							}
						},
						contentMiddle: {
						},
						contentRight: {
							actions: {
								move: "moveControls"
							}
						}
					}
				}
			});

			// create designtime
			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oBar
				],
				plugins: [this.oDragDropPlugin],
				designTimeMetadata : {
					"sap.m.Bar" : oBarMetadata,
					"sap.m.Button" : {}
				}
			});

			var done = assert.async();
			this.oDesignTime.attachEventOnce("synced", function() {
				this.oMovedButton1Overlay = OverlayRegistry.getOverlay(this.oMovedButton1);
				this.oBarOverlay = OverlayRegistry.getOverlay(this.oBar);
				this.oBarRightAggregationOverlay = OverlayRegistry.getOverlay(this.oBar).getAggregationOverlay("contentRight");
				this.oBarMiddleAggregationOverlay = OverlayRegistry.getOverlay(this.oBar).getAggregationOverlay("contentMiddle");
				this.oElementMover = this.oDragDropPlugin.getElementMover();
				this.oElementMover.setMovedOverlay(this.oMovedButton1Overlay);

				done();
			}.bind(this));
		},
		afterEach : function () {
			this.oMovedButton1Overlay.destroy();
			this.oBarRightAggregationOverlay.destroy();
			this.oBarMiddleAggregationOverlay.destroy();
			this.oBarOverlay.destroy();
			this.oDesignTime.destroy();
			this.oBar.destroy();
		}
	}, function () {
		QUnit.test("when DT is loaded and moving the movedButton to the right bar aggregation...", function(assert) {
			this.oElementMover.setMovedOverlay(this.oMovedButton1Overlay);
			return this.oElementMover.checkTargetZone(this.oBarRightAggregationOverlay)
				.then(function(bCheckTargetZone) {
					assert.ok(bCheckTargetZone, "then the right bar aggregation is a possible target zone");
				});
		});

		QUnit.test("when DT is loaded and moving the movedButton to the middle bar aggregation without move action...", function(assert) {
			this.oElementMover.setMovedOverlay(this.oMovedButton1Overlay);
			return this.oElementMover.checkTargetZone(this.oBarMiddleAggregationOverlay)
				.then(function(bCheckTargetZone) {
					assert.notOk(bCheckTargetZone, "then the middle bar aggregation is not a possible target zone");
				});
		});

		QUnit.test("when the bar has no stable id...", function(assert) {
			sandbox.stub(this.oElementMover.oBasePlugin, "hasStableId").callsFake(function(oOverlay) {
				if (oOverlay === this.oBarOverlay) {
					return false;
				}
				return true;
			}.bind(this));

			return this.oElementMover.isMoveAvailableOnRelevantContainer(this.oMovedButton1Overlay)
				.then(function(bMoveAvailableOnRelevantContainer) {
					assert.equal(bMoveAvailableOnRelevantContainer, false, "then the move is not available");
				});
		});
	});

	QUnit.module("Given a Bar with Buttons scenario", {
		beforeEach : function(assert) {
			var done = assert.async();

			// another scenario
			// Bar
			//    Aggregation1 (contentLeft)
			//        MovedButton1
			//        Button2

			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2");
			this.oBar = new Bar("bar1", {
				contentRight: [
					this.oButton1,
					this.oButton2
				]
			});

			var oCommandFactory = new CommandFactory();
			this.oDragDropPlugin = new DragDropPlugin({
				commandFactory : oCommandFactory
			});

			this.oBar.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			// stub designtime metadata
			var oBarMetadata = new ElementDesignTimeMetadata({
				data: {
					aggregations: {
						contentLeft: {
							actions: {
								move: "moveControls"
							}
						},
						contentMiddle: {
						},
						contentRight: {
							actions: {
								move: "moveControls"
							}
						}
					}
				}
			});

			// create designtime
			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oBar
				],
				plugins: [this.oDragDropPlugin],
				designTimeMetadata : {
					"sap.m.Bar" : oBarMetadata,
					"sap.m.Button" : {}
				}
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oBarOverlay = OverlayRegistry.getOverlay(this.oBar);
				this.oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
				this.oElementMover = this.oDragDropPlugin.getElementMover();
				done();
			}.bind(this));
		},
		afterEach : function() {
			sandbox.restore();
			this.oButton1Overlay.destroy();
			this.oBarOverlay.destroy();
			this.oDesignTime.destroy();
			this.oBar.destroy();
		}
	}, function() {
		QUnit.test("when isMoveAvailableForChildren is called with bar", function(assert) {
			// should also work when AggregationOverlays are not defined
			sandbox.stub(this.oBarOverlay, "getAggregationOverlay")
				.callThrough()
				.withArgs("contentLeft").returns(undefined);
			return this.oElementMover.isMoveAvailableForChildren(this.oBarOverlay)
				.then(function(bMoveAvailableForChildren) {
					assert.ok(bMoveAvailableForChildren, "then the result is 'true'");
				});
		});

		QUnit.test("when isMoveAvailableForChildren is called with button", function(assert) {
			return this.oElementMover.isMoveAvailableForChildren(this.oButton1Overlay)
				.then(function(bMoveAvailableForChildren) {
					assert.notOk(bMoveAvailableForChildren, "then the result is 'false'");
				});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
