/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/base/Log",
	"sap/m/Button",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/layout/HorizontalLayout",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/ui/base/ManagedObjectMetadata",
	"sap/ui/dt/Overlay",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/AggregationOverlay",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/plugin/TabHandling",
	"sap/ui/dt/plugin/ContextMenu",
	"sap/ui/dt/plugin/DragDrop",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/dt/Util",
	"qunit/MetadataTestUtil",
	"sap/base/util/includes",
	"sap/ui/dt/DOMUtil",
	"sap/ui/thirdparty/sinon-4"
],
function(
	jQuery,
	Log,
	Button,
	VerticalLayout,
	HorizontalLayout,
	Page,
	Panel,
	ManagedObjectMetadata,
	Overlay,
	ElementOverlay,
	AggregationOverlay,
	OverlayRegistry,
	DesignTime,
	ElementUtil,
	TabHandling,
	ContextMenuPlugin,
	DragDrop,
	ElementDesignTimeMetadata,
	Util,
	MetadataTestUtil,
	includes,
	DOMUtil,
	sinon
) {
	"use strict";

	DOMUtil.insertStyles('\
		.hidden {\
			display: none !important;\
		}\
	', document.head);

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given that the DesignTime is created", {
		beforeEach : function () {
			this.oDesignTime = new DesignTime();
		},
		afterEach : function () {
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("when the DesignTime is created for a root control ", function (assert) {
			var fnDone = assert.async();

			this.oButton = new Button();

			var bSyncingCalled = false;
			this.oDesignTime.attachEventOnce("syncing", function() {
				bSyncingCalled = true;
			});

			this.oDesignTime.addRootElement(this.oButton);

			this.oDesignTime.attachEventOnce("synced", function() {
				assert.ok(bSyncingCalled, "then syncing event was called initially");
				assert.ok("and synced event was called");

				assert.ok(OverlayRegistry.getOverlay(this.oButton), "overlay for button exists");
				var oButtonDTMetadata = OverlayRegistry.getOverlay(this.oButton).getDesignTimeMetadata();
				assert.ok(oButtonDTMetadata, "the DesignTimeMetadata is available");

				fnDone();
			}.bind(this));
		});

		QUnit.test("when empty composite control is added to root followed by a button which is added to the composite control", function(assert) {
			var fnDone = assert.async(),
				oOuterLayout, oInnerLayout, oButton;

			oOuterLayout = new VerticalLayout("outer-layout");
			oOuterLayout.placeAt("qunit-fixture");
			this.oDesignTime.addRootElement(oOuterLayout);

			this.oDesignTime.attachEventOnce("synced", function() {
				oInnerLayout = new VerticalLayout("inner-layout");
				oButton = new Button("button1");
				oInnerLayout.addContent(oButton);

				this.oDesignTime.attachEventOnce("synced", function() {
					OverlayRegistry.getOverlay(oOuterLayout).applyStyles();

					var oButtonOverlay = OverlayRegistry.getOverlay(oButton);
					var oInnerOverlay = oButtonOverlay.getParentElementOverlay();
					assert.equal(oInnerOverlay.getElement().getId(), "inner-layout", "then the button overlay is inside in inner-layout overlay");
					var oOuterOverlay = oInnerOverlay.getParentElementOverlay();
					assert.equal(oOuterOverlay.getElement().getId(), "outer-layout", "then the inner-layout overlay is chained at outer-layout overlay");
					assert.ok(oOuterOverlay.$().is(":visible"), "then the outer-layout overlay is visible");
					assert.ok(oInnerOverlay.$().is(":visible"), "then the inner-layout overlay is visible");
					assert.ok(oButtonOverlay.$().is(":visible"), "then the button-layout overlay is visible");

					oOuterLayout.destroy();
					fnDone();
				});

				oOuterLayout.addContent(oInnerLayout);
				sap.ui.getCore().applyChanges();
			}.bind(this));
		});
	});

	QUnit.module("Given that the DesignTime is created for a root control", {
		beforeEach : function(assert) {
			var fnDone = assert.async();

			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2");
			this.oInnerLayout = new VerticalLayout({
				content : [
					this.oButton1,
					this.oButton2
				]
			});
			this.oOuterLayout = new VerticalLayout({
				content : [this.oInnerLayout]
			});

			this.oOuterLayout.placeAt("qunit-fixture");

			this.oDesignTime = new DesignTime({
				rootElements : [this.oOuterLayout]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				sap.ui.getCore().applyChanges();
				fnDone();
			});
		},
		afterEach : function () {
			this.oOuterLayout.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function(){
		QUnit.test("when the DesignTime is initialized ", function (assert) {
			var aOverlays = OverlayRegistry.getOverlays();

			assert.strictEqual(aOverlays.length, 6, "6 Overlays are created: 4 elements + 2 aggregations");

			assert.ok(OverlayRegistry.getOverlay(this.oOuterLayout), "overlay for outer layout exists");
			assert.ok(OverlayRegistry.getOverlay(this.oInnerLayout), "overlay for inner layout exists");
			assert.ok(OverlayRegistry.getOverlay(this.oButton1), "overlay for button1 exists");
			assert.ok(OverlayRegistry.getOverlay(this.oButton2), "overlay for button2 exists");

			assert.strictEqual(this.oDesignTime.getSelection().length, 0, "and a new selection is created and initially empty");
		});

		QUnit.test("when an Overlay is selected via overlay API and SelectionManager declines this selection", function (assert) {
			assert.strictEqual(this.oDesignTime.getSelection().length, 0, "and a new selection is created and initially empty");
			var oElementOverlay = OverlayRegistry.getOverlay(this.oButton1);
			oElementOverlay.setSelectable(true);
			this.oDesignTime.getSelectionManager().addValidator(function (aElementOverlays) {
				return !includes(aElementOverlays.map(function (oElementOverlay) {
					return oElementOverlay.getId();
				}), oElementOverlay.getId());
			});
			oElementOverlay.setSelected(true);
			assert.notOk(oElementOverlay.isSelected());
			assert.strictEqual(this.oDesignTime.getSelectionManager().get().length, 0);
		});

		QUnit.test("when '_onAddAggregation' is called and a foreign error occurs during overlay creation", function (assert) {
			var fnDone = assert.async();

			sandbox.stub(this.oDesignTime, "createOverlay").rejects("custom error message");

			var oNewButton = new Button();

			var stubLog = sandbox.stub(Log, "error").callsFake(function () {
				assert.equal(stubLog.callCount, 1, "then an error is raised");
				assert.ok(stubLog.args[0][0].indexOf("Error in sap.ui.dt.DesignTime#_onAddAggregation") > -1, "the error has the correct text");
				assert.ok(stubLog.args[0][0].indexOf("custom error message") > -1, "the error contains information about custom error");
				fnDone();
			});

			this.oDesignTime._onAddAggregation(oNewButton, this.oInnerLayout, "content");
		});

		QUnit.test("when a new control is added to an existing control aggregation", function (assert) {
			var fnDone = assert.async();
			var oNewButton = new Button("newButton");
			var oExpectedResponse;

			this.oDesignTime.attachEventOnce("elementOverlayAdded", function(oEvent) {
				oExpectedResponse = {
					id: OverlayRegistry.getOverlay(oNewButton).getId(),
					targetAggregation: "content",
					targetId: OverlayRegistry.getOverlay(oNewButton).getParentAggregationOverlay().getId(),
					targetIndex: 1
				};
				assert.deepEqual(oEvent.getParameters(), oExpectedResponse, "then event 'elementOverlayAdded' was fired with the required parameters");
				fnDone();
			});

			this.oOuterLayout.addContent(oNewButton);
		});

		QUnit.test("when an existing control is moved from one control's aggregation to another control's aggregation", function (assert) {
			var fnDone = assert.async();

			this.oDesignTime.attachEventOnce("elementOverlayMoved", function(oEvent) {
				var oExpectedResponse = {
					id: OverlayRegistry.getOverlay(this.oButton1).getId(),
					targetAggregation: "content",
					targetId: OverlayRegistry.getOverlay(this.oButton1).getParentAggregationOverlay().getId(),
					targetIndex: 1
				};
				assert.deepEqual(oEvent.getParameters(), oExpectedResponse, "then event 'elementOverlayMoved' was fired with the required parameters");
				fnDone();
			}.bind(this));

			this.oInnerLayout.removeContent(this.oButton1);
			this.oOuterLayout.addContent(this.oButton1);
		});

		QUnit.test("when an existing element overlay's editable property is changed", function (assert) {
			var fnDone = assert.async();
			var oElementOverlay = OverlayRegistry.getOverlay(this.oOuterLayout);

			var oExpectedResponse = {
				editable: true,
				id: oElementOverlay.getId()
			};

			this.oDesignTime.attachEventOnce("elementOverlayEditableChanged", function(oEvent) {
				assert.deepEqual(oEvent.getParameters(), oExpectedResponse, "then event 'elementOverlayEditableChanged' was fired with the required parameters");
				fnDone();
			});

			oElementOverlay.setEditable(!oElementOverlay.getEditable());
		});

		QUnit.test("when a property on an element with an overlay is changed", function (assert) {
			var fnDone = assert.async();
			var oElementOverlay = OverlayRegistry.getOverlay(this.oOuterLayout);

			var oExpectedResponse = {
				id: oElementOverlay.getId(),
				name: "visible",
				oldValue: true,
				value: false
			};

			this.oDesignTime.attachEventOnce("elementPropertyChanged", function(oEvent) {
				assert.deepEqual(oEvent.getParameters(), oExpectedResponse, "then event 'elementPropertyChanged' was fired with the required parameters");
				fnDone();
			});

			this.oOuterLayout.setVisible(false);
		});

		QUnit.test("when a new control without overlay is added to a root control aggregation", function (assert) {
			var fnDone = assert.async();

			var oButton = new Button();
			var oLayout = new VerticalLayout({content : [oButton]});

			var bSyncingCalled = false;
			this.oDesignTime.attachEventOnce("syncing", function () {
				bSyncingCalled = true;
			});

			var iElementOverlaysCreated = 0;
			this.oDesignTime.attachEvent("elementOverlayCreated", function () {
				iElementOverlaysCreated++;
			});

			this.oDesignTime.attachEventOnce("synced", function () {
				assert.strictEqual(bSyncingCalled, true, "syncing event was called");
				assert.strictEqual(iElementOverlaysCreated, 2, "two element overlays created events were called");

				assert.ok(OverlayRegistry.getOverlay(oButton), "overlay for the button exists");
				assert.ok(OverlayRegistry.getOverlay(oLayout), "overlay for the layout exists");

				fnDone();
			});

			this.oOuterLayout.addContent(oLayout);
			sap.ui.getCore().applyChanges();
		});

		QUnit.test("when a control is destroyed while loading design time metadata while adding it through aggregation", function(assert) {
			var fnDone = assert.async();

			var oButton = new Button();

			// Simulate control is being destroyed
			sandbox.stub(ManagedObjectMetadata.prototype, "loadDesignTime").callsFake(function () {
				oButton.destroy();
				return Promise.resolve({});
			});

			var fnElementOverlayCreatedSpy = sinon.spy();
			var fnElementOverlayDestroyedSpy = sinon.spy();
			this.oDesignTime.attachEventOnce("elementOverlayCreated", fnElementOverlayCreatedSpy);
			this.oDesignTime.attachEventOnce("elementOverlayDestroyed", fnElementOverlayDestroyedSpy);

			this.oDesignTime.attachEventOnce("synced", function() {
				assert.notOk(fnElementOverlayCreatedSpy.called, "then event 'elementOverlayCreated' wasn't called");
				assert.notOk(fnElementOverlayDestroyedSpy.called, "then event 'elementOverlayDestroyed' wasn't called");

				var oButtonOverlay = OverlayRegistry.getOverlay(oButton);
				assert.ok(!oButtonOverlay, "then overlay of destroyed control is also destroyed");

				fnDone();
			});

			this.oOuterLayout.addContent(oButton);
			sap.ui.getCore().applyChanges();
		});

		QUnit.test("when a control is destroyed while loading design time metadata when creating it via createOverlay() API", function(assert) {
			var fnDone = assert.async();

			var oButton = new Button();

			// Simulate control is being destroyed
			sandbox.stub(ManagedObjectMetadata.prototype, "loadDesignTime").callsFake(function () {
				oButton.destroy();
				return Promise.resolve({});
			});

			var fnElementOverlayCreatedSpy = sinon.spy();
			var fnElementOverlayDestroyedSpy = sinon.spy();
			this.oDesignTime.attachEventOnce("elementOverlayCreated", fnElementOverlayCreatedSpy);
			this.oDesignTime.attachEventOnce("elementOverlayDestroyed", fnElementOverlayDestroyedSpy);

			sandbox.stub(Log, "error").callsFake(function() {
				assert.ok(false, 'then the error must not be raised');
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				assert.notOk(fnElementOverlayCreatedSpy.called, "then event 'elementOverlayCreated' wasn't called");
				assert.notOk(fnElementOverlayDestroyedSpy.called, "then event 'elementOverlayDestroyed' wasn't called");
			});

			this.oDesignTime.createOverlay(oButton)
				.then(
					function () {
						assert.ok(false, 'resolve() must not ever happen');
					},
					function () {
						assert.notOk(fnElementOverlayCreatedSpy.called, "then event 'elementOverlayCreated' wasn't called");
						assert.notOk(fnElementOverlayDestroyedSpy.called, "then event 'elementOverlayDestroyed' wasn't called");
						assert.ok(true, 'then Promise is rejected properly');
						assert.ok(!OverlayRegistry.getOverlay(oButton), "then overlay of destroyed control is also destroyed");
						fnDone();
					}
				)
				.catch(function () {
					assert.ok(false, 'catch() must not ever happen');
				});
		});

		QUnit.test("when a control is moved inside of root element", function(assert) {
			var oOuterLayoutOverlay = OverlayRegistry.getOverlay(this.oOuterLayout);

			var oOldButtonOverlay = OverlayRegistry.getOverlay(this.oButton1);
			this.oOuterLayout.addContent(this.oButton1);

			sap.ui.getCore().applyChanges();

			var oNewButtonOverlay = OverlayRegistry.getOverlay(this.oButton1);
			assert.strictEqual(oOldButtonOverlay, oNewButtonOverlay, "overlay for button1 is not changed");

			assert.deepEqual(oNewButtonOverlay.getParentElementOverlay(), oOuterLayoutOverlay, "the control has the correct new parent overlay");
		});

		QUnit.test("when a control is removed from root element", function(assert) {
			var fnDone = assert.async();

			this.oInnerLayout.removeContent(this.oButton1);

			this.oDesignTime.attachEventOnce("elementOverlayDestroyed", function(oEvent) {
				assert.strictEqual(oEvent.getParameter("elementOverlay").getElement(), this.oButton1, "overlay for button is destroyed");
				fnDone();
				this.oButton1.destroy();
			}.bind(this));
		});

		QUnit.test("when a plugin is added, a new Overlay is created and the DesignTime is destroyed", function(assert) {
			var fnDone = assert.async();
			var oTabHandlingPlugin = new TabHandling();
			var oRegisterPluginSpy = sandbox.spy(oTabHandlingPlugin, "registerElementOverlay");
			var oDeregisterPluginSpy = sandbox.spy(oTabHandlingPlugin, "deregisterElementOverlay");

			this.oDesignTime.addPlugin(oTabHandlingPlugin);
			assert.strictEqual(oRegisterPluginSpy.called, true, "then the registerElementOverlay method for the plugin was called");

			var oPluginSpy = sandbox.spy(oTabHandlingPlugin, "callElementOverlayRegistrationMethods");

			var oButton = new Button();
			this.oOuterLayout.addContent(oButton);
			sap.ui.getCore().applyChanges();

			this.oDesignTime.attachEventOnce("synced", function() {
				var oButtonOverlay = OverlayRegistry.getOverlay(oButton);
				assert.deepEqual(oPluginSpy.args[0][0], oButtonOverlay, "then after adding a new overlay the plugin calls its registration method with the overlay");
				this.oDesignTime.destroy();
				assert.notOk(OverlayRegistry.getOverlay(this.oOuterLayout), "and after destroying DesignTime overlay for layout destroyed");
				assert.notOk(OverlayRegistry.getOverlay(this.oButton1), "and overlay for button1 is destroyed");
				assert.notOk(OverlayRegistry.getOverlay(this.oButton2), "and overlay for button2 is destroyed");
				assert.strictEqual(oDeregisterPluginSpy.called, true, "and the deregisterElementOverlay method for the plugin was called after destroy");
				fnDone();
			}.bind(this));

		});

		QUnit.test("when plugins are inserted and removed", function(assert) {
			var oTabHandlingPlugin = new TabHandling();
			var oContextMenuPlugin = new ContextMenuPlugin();
			var oDragDropPlugin = new DragDrop();

			assert.equal(this.oDesignTime.getPlugins().length, 0, "initially there are no plugins on the design time");

			this.oDesignTime.addPlugin(oTabHandlingPlugin);
			this.oDesignTime.insertPlugin(oContextMenuPlugin, 0);
			this.oDesignTime.insertPlugin(oDragDropPlugin, 1);

			assert.equal(this.oDesignTime.getPlugins().length, 3, "then three plugins are present in design time");
			assert.strictEqual(this.oDesignTime.getPlugins()[0], oContextMenuPlugin, "the ContextMenu plugin was inserted in the right position of the aggregation");
			assert.strictEqual(this.oDesignTime.getPlugins()[1], oDragDropPlugin, "the ElementMover plugin was inserted in the right position of the aggregation");

			this.oDesignTime.removePlugin(oDragDropPlugin);

			assert.equal(this.oDesignTime.getPlugins().length, 2, "after removing one, two plugins remain in design time");
			assert.strictEqual(this.oDesignTime.getPlugins()[1], oTabHandlingPlugin, "the TabHandlingPlugin plugin is in the right position of the aggregation");

			this.oDesignTime.removeAllPlugins();

			assert.equal(this.oDesignTime.getPlugins().length, 0, "after calling 'removeAllPlugins' the are no more plugins on the design time");
		});

		QUnit.test("when the element inside of the DesignTime is destroyed", function(assert) {
			var fnDone = assert.async();

			this.oDesignTime.attachEventOnce("elementOverlayDestroyed", function(oEvent) {
				assert.notOk(OverlayRegistry.getOverlay(this.oButton1), "overlay for button1 destroyed");

				fnDone();
			}, this);

			this.oButton1.destroy();
		});

		QUnit.test("when the element inside of the DesignTime is removed and then destroyed", function(assert) {
			var fnDone = assert.async();

			this.oDesignTime.attachEventOnce("elementOverlayDestroyed", function() {
				assert.notOk(OverlayRegistry.getOverlay(this.oButton1), "overlay for button1 destroyed");

				fnDone();
			}, this);

			this.oInnerLayout.removeContent(this.oButton1);
			this.oButton1.destroy();
		});

		QUnit.test("when the element inside of the DesignTime is moved to 'dependents' aggregation", function(assert) {
			var fnDone = assert.async();

			this.oDesignTime.attachEventOnce("elementOverlayDestroyed", function(oEvent) {
				assert.strictEqual(oEvent.getParameter("elementOverlay").getElement(), this.oButton1, "overlay for button is destroyed");
				fnDone();
			}, this);

			this.oInnerLayout.addDependent(this.oButton1);
		});

		QUnit.test("when the element inside of the DesignTime is moved from one control to another", function(assert) {
			var fnDone = assert.async(2 /* callback will be called for remove and add aggregation */);
			var oElement = this.oButton1;
			var oOverlayBefore = OverlayRegistry.getOverlay(oElement);
			var fnOriginalCheckIfOverlayShouldBeDestroyed = this.oDesignTime._checkIfOverlayShouldBeDestroyed;

			//stub the important async functionality to get a trigger that it was called
			sandbox.stub(DesignTime.prototype, "_checkIfOverlayShouldBeDestroyed").callsFake(function(){
				fnOriginalCheckIfOverlayShouldBeDestroyed.apply(this, arguments);

				var oOverlayAfterwards = OverlayRegistry.getOverlay(oElement);
				assert.strictEqual(oOverlayBefore, oOverlayAfterwards, "overlay for moved control is not destroyed");
				fnDone();
			});

			this.oInnerLayout.removeContent(this.oButton1);
			this.oOuterLayout.addContent(this.oButton1);
		});

		QUnit.test("when the element inside of the DesignTime is destroyed and recreated with the same ID", function(assert) {
			var fnDone = assert.async();
			var sElementId = this.oButton1.getId();
			var fnOriginalCheckIfOverlayShouldBeDestroyed = this.oDesignTime._checkIfOverlayShouldBeDestroyed;

			//stub the important async functionality to get a trigger that it was called
			sandbox.stub(DesignTime.prototype, "_checkIfOverlayShouldBeDestroyed").callsFake(function(){
				fnOriginalCheckIfOverlayShouldBeDestroyed.apply(this, arguments);
				var oOverlayAfterwards = OverlayRegistry.getOverlay(sElementId);
				assert.ok(oOverlayAfterwards, "overlay for recreated control is not destroyed");
				fnDone();
			});

			this.oInnerLayout.removeContent(this.oButton1); //triggers setParent modified
			this.oButton1.destroy(); //triggers overlay removal
			this.oInnerLayout.addContent( new Button({ id : sElementId, text : "recreated"} )); //triggers overlay being added
		});

		// TODO: check after DesignTime API Enhancement
		QUnit.test("when the overlay is selected inside of the DesignTime", function(assert) {
			var fnDone = assert.async();
			var oOverlay = OverlayRegistry.getOverlay(this.oButton1);

			this.oDesignTime.getSelectionManager().attachEventOnce("change", function(oEvent) {
				var aSelection = oEvent.getParameter("selection");
				assert.strictEqual(aSelection.length, 1, "selection is just one overlay");
				assert.strictEqual(aSelection[0], oOverlay, "selection is correct");
				fnDone();
			});

			oOverlay.setSelectable(true);
			oOverlay.setSelected(true);
		});

		QUnit.test("when the DesignTime is disabled and then enabled again", function(assert) {
			this.oDesignTime.setEnabled(false);
			assert.strictEqual(
				jQuery(Overlay.getOverlayContainer()).filter(':visible').length,
				0,
				'then the overlay container has been hidden'
			);
			assert.strictEqual(
				OverlayRegistry.getOverlay(this.oOuterLayout).getVisible(),
				false,
				'then the outer overlay has been disabled'
			);
			assert.strictEqual(
				OverlayRegistry.getOverlay(this.oOuterLayout).isVisible(),
				false,
				'then the outer overlay is not visible'
			);
			assert.strictEqual(
				OverlayRegistry.getOverlay(this.oOuterLayout).getChildren()[0].isVisible(),
				false,
				'then the aggregation overlay of outer overlay is disabled'
			);

			this.oDesignTime.setEnabled(true);
			assert.strictEqual(
				jQuery(Overlay.getOverlayContainer()).filter(':visible').length,
				1,
				'then after enabling it again the overlay container is displayed'
			);
			assert.strictEqual(
				OverlayRegistry.getOverlay(this.oOuterLayout).getVisible(),
				true,
				'and the outer overlay is visible'
			);
			assert.strictEqual(
				OverlayRegistry.getOverlay(this.oOuterLayout).getChildren()[0].isVisible(),
				true,
				'and the aggregation overlay of outer overlay is visible'
			);
		});

		QUnit.test("when inner layout is destroyed and then _createChildren is called for the outer layout", function(assert){
			var fnDone = assert.async();
			var oOuterLayoutOverlay = OverlayRegistry.getOverlay(this.oOuterLayout);
			var oInnerLayoutOverlay = OverlayRegistry.getOverlay(this.oInnerLayout);
			oInnerLayoutOverlay.destroy();

			var oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);

			assert.notOk(oButton1Overlay, "then the children Overlays of the inner layout are also destroyed and de-registered");

			var fnSpy = sandbox.spy(DesignTime.prototype, "_createChildren");

			this.oDesignTime._createChildren(oOuterLayoutOverlay).then(function(){
				oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
				var oOuterLayoutAggregationOverlay = OverlayRegistry.getOverlay(this.oOuterLayout).getAggregationOverlay("content");
				var oInnerLayoutAggregationOverlay = OverlayRegistry.getOverlay(this.oInnerLayout).getAggregationOverlay("content");
				assert.ok(oButton1Overlay, "then after _createChildren is called the children Overlays are created and registered again");
				assert.ok(oOuterLayoutAggregationOverlay, "and the outer layout 'content' aggregation overlay is also created");
				assert.ok(oInnerLayoutAggregationOverlay, "and the inner layout 'content' aggregation overlay is also created");
				assert.equal(fnSpy.callCount, 4, "and _createChildren was called exactly 4 times - once for the outer layout and once for each child element");
				fnDone();
			}.bind(this));
		});

		QUnit.test("when oInnerLayout is extended by new button element without existing overlay", function(assert) {
			var fnDone = assert.async();
			var oParentOfNewOverlay;
			var oButton = new Button("button3");
			var oInnerLayoutOverlay = OverlayRegistry.getOverlay(this.oInnerLayout);

			this.oDesignTime.attachEventOnce("synced", function() {
				oParentOfNewOverlay = OverlayRegistry.getOverlay(oButton).getParentElementOverlay();
				assert.strictEqual(oParentOfNewOverlay.getId(), oInnerLayoutOverlay.getId(), "then the parent overlay of the new button is the oInnerLayoutOverlay");
				oButton.destroy();
				fnDone();
			});

			this.oInnerLayout.insertAggregation("content", oButton, 2);
		});

	});

	QUnit.module("Given a layout and a button", {
		beforeEach : function() {
			this.oButton1 = new Button("button");

			this.oLayout1 = new VerticalLayout({
				content : [this.oButton1]
			});
			this.oLayout1.placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oLayout1.destroy();
			if (this.oDesignTime) {
				this.oDesignTime.destroy();
			}
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when the content of the layout behaves like an association and DesignTime is created", function(assert){
			var fnDone = assert.async();
			sandbox.stub(AggregationOverlay.prototype, "isAssociation").returns(true);
			sandbox.stub(ElementUtil, "getAssociationInstances").returns([this.oButton1]);

			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout1]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				sap.ui.getCore().applyChanges();
				var oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
				var oLayout1Overlay = OverlayRegistry.getOverlay(this.oLayout1);
				assert.ok(oButton1Overlay, "then the button overlay is still created properly");
				assert.deepEqual(oButton1Overlay.getParentElementOverlay(), oLayout1Overlay, "and it has the correct parent");
				fnDone();
			}.bind(this));
		});

		QUnit.test("when the button is an invalid element for the layout and DesignTime is created", function(assert){
			var fnDone = assert.async();
			var fnOriginalIsElementValid = ElementUtil.isElementValid;

			// TODO: stub.withArgs doesn't work in sinon 1.14.1, replace after update to sinon-4
			ElementUtil.isElementValid = function (oElement) {
				return oElement === this.oButton1 ? false : fnOriginalIsElementValid(oElement);
			}.bind(this);

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout1]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				sap.ui.getCore().applyChanges();
				var oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
				var oLayout1Overlay = OverlayRegistry.getOverlay(this.oLayout1);
				assert.ok(oLayout1Overlay, "then the layout overlay is created");
				assert.notOk(oButton1Overlay, "but the button overlay is not created");
				ElementUtil.isElementValid = fnOriginalIsElementValid;
				fnDone();
			}.bind(this));
		});

		QUnit.test("when the design time is initialized", function(assert){
			var fnDone = assert.async();

			var oSpy = sandbox.spy(DesignTime.prototype, "_createElementOverlay");

			this.oLayout1.getMetadata().loadDesignTime().then(function(mDesignTimeMetadata){
				this.oDesignTime = new DesignTime({
					rootElements : [this.oLayout1]
				});

				this.oDesignTime.attachEventOnce("synced", function() {
					sap.ui.getCore().applyChanges();

					var aSpyCalls = oSpy.getCalls();

					assert.equal(aSpyCalls.length, 2, "then _createElementOverlay is called once for the layout and once for the button");

					assert.equal(aSpyCalls[0].args[0].element, this.oLayout1, "the first call is for the layout");
					assert.equal(aSpyCalls[1].args[0].element, this.oButton1, "the second call is for the button");
					assert.deepEqual(aSpyCalls[1].args[0].parentMetadata.actions, mDesignTimeMetadata.aggregations.content.actions,
						"the second call is made with the correct parent aggregation designtime metadata");

					fnDone();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("when a newly created overlay is destroyed before it was registered in plugins", function(assert){
			var fnDone = assert.async();

			var oTabHandlingPlugin = new TabHandling();

			var oCallElementOverlayRegistrationMethodsSpy = sandbox.spy(oTabHandlingPlugin, "callElementOverlayRegistrationMethods");

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout1],
				plugins: [oTabHandlingPlugin]
			});

			var oElementOverlayCreatedSpy = sandbox.spy(function (oEvent) {
				var oElement = oEvent.getParameter("elementOverlay").getElement();
				if (oElement.getId() === "button") {
					this.oButton1.destroy();
				}
			});
			var oElementOverlayDestroyedSpy = sandbox.spy();

			this.oDesignTime.attachElementOverlayCreated(oElementOverlayCreatedSpy, this);
			this.oDesignTime.attachElementOverlayDestroyed(oElementOverlayDestroyedSpy);

			this.oDesignTime.attachEventOnce("synced", function() {
				assert.ok(oCallElementOverlayRegistrationMethodsSpy.calledOnce, "then only 1 overlay got registered");
				assert.ok(oElementOverlayCreatedSpy.calledTwice, "two overlays got created");
				assert.ok(oElementOverlayDestroyedSpy.calledOnce, "one overlay got destroyed");
				fnDone();
			});
		});

	});

	QUnit.module("Given that the DesignTime is initalized for two root controls", {
		beforeEach : function(assert) {
			var fnDone = assert.async();

			this.oLayout1 = new VerticalLayout({
				content : []
			});
			this.oLayout2 = new VerticalLayout({
				content : []
			});
			this.oLayout3 = new VerticalLayout({
				content : []
			});
			this.oOuterLayout = new VerticalLayout({
				content : [this.oLayout1, this.oLayout2, this.oLayout3]
			});
			this.oOuterLayout.placeAt("qunit-fixture");

			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout1, this.oLayout3]
			});
			sap.ui.getCore().applyChanges();

			this.oDesignTime.attachEventOnce("synced", function() {
				sap.ui.getCore().applyChanges();
				fnDone();
			});
		},
		afterEach : function() {
			this.oOuterLayout.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function(){

		QUnit.test("when getting the created overlays", function(assert) {
			assert.ok(OverlayRegistry.getOverlay(this.oLayout1), "then overlay for layout1 exists");
			assert.notOk(OverlayRegistry.getOverlay(this.oLayout2), "then overlay for layout2 doesn't exist");
			assert.ok(OverlayRegistry.getOverlay(this.oLayout3), "then overlay for layout3 exists");
		});

		QUnit.test("when 'getRootElements' is called", function(assert) {
			assert.deepEqual(this.oDesignTime.getRootElements(), [this.oLayout1, this.oLayout3], "then layout1 and layout3 are returned");
		});

		QUnit.test("when 'getRootElements' is called after a root element is destroyed (e.g. app was closed)", function(assert) {
			this.oLayout1.destroy();
			assert.deepEqual(this.oDesignTime.getRootElements(), [this.oLayout3], "then only the remaining root element is returned");
		});

		QUnit.test("when one root element is removed", function(assert) {
			this.oDesignTime.removeRootElement(this.oLayout3);
			assert.ok(OverlayRegistry.getOverlay(this.oLayout1), "then overlay for layout1 exists");
			assert.notOk(OverlayRegistry.getOverlay(this.oLayout2), "then overlay for layout2 doesn't exist");
			assert.notOk(OverlayRegistry.getOverlay(this.oLayout3), "then overlay for layout3 doesn't exist");
		});

		QUnit.test("when all root elements are removed", function(assert) {
			this.oDesignTime.removeAllRootElement();
			assert.notOk(OverlayRegistry.getOverlay(this.oLayout1), "then overlay for layout1 doesn't exist");
			assert.notOk(OverlayRegistry.getOverlay(this.oLayout2), "then overlay for layout2 doesn't exist");
			assert.notOk(OverlayRegistry.getOverlay(this.oLayout3), "then overlay for layout3 doesn't exist");
		});

		QUnit.test("when one root element is added", function(assert) {
			var fnDone = assert.async();
			this.oDesignTime.attachEventOnce("synced", function() {
				sap.ui.getCore().applyChanges();
				assert.ok(OverlayRegistry.getOverlay(this.oLayout1), "then overlay for layout1 exists");
				assert.ok(OverlayRegistry.getOverlay(this.oLayout2), "then overlay for layout2 exists");
				assert.ok(OverlayRegistry.getOverlay(this.oLayout3), "then overlay for layout3 exists");
				fnDone();
			}, this);
			this.oDesignTime.addRootElement(this.oLayout2);
		});

		QUnit.test("when the overlay for a root element cannot be created", function(assert) {
			var fnDone = assert.async();
			var sErrorMessage = "ErrorMessage";
			sandbox.stub(DesignTime.prototype, "createOverlay").callsFake(function(){
				return Promise.reject({ message: sErrorMessage });
			});

			var spyLog = sandbox.stub(Util, "createError").callsFake(function(){
				var sErrorText = Util.printf('sap.ui.dt: root element with id = "{0}" initialization is failed due to: {1}', this.oLayout2.getId(), sErrorMessage);
				assert.equal(spyLog.callCount, 1, "then an error is created");
				assert.ok(spyLog.calledWith("DesignTime#createOverlay", sErrorText, "sap.ui.dt"), "then the correct error is created");
				fnDone();
			}.bind(this));

			this.oDesignTime.addRootElement(this.oLayout2);
		});

	});

	QUnit.module("Given that the DesignTime is initialized with custom DesignTime Metadata for sap.m.Page", {
		beforeEach : function(assert) {
			var fnDone = assert.async();
			this.oPage = new Page();
			this.oPage.getMetadata().loadDesignTime().then(function() {
				this.oDesignTime = new DesignTime({
					designTimeMetadata : {
						"sap.m.Page" : {
							testField : "testValue"
						}
					},
					rootElements : [this.oPage]
				});
				this.oDesignTime.attachEventOnce('synced', function () {
					this.oPageOverlay = OverlayRegistry.getOverlay(this.oPage);
					fnDone();
				}, this);
			}.bind(this));
		},
		afterEach : function() {
			this.oPage.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when getting the metadata for the sap.m.Page control from DesignTime", function(assert) {
			var oDTMetadata = this.oDesignTime.getDesignTimeMetadataFor(this.oPage);
			assert.strictEqual(oDTMetadata.testField, "testValue", "then the expected custom value is returned");
		});

		QUnit.test("when getting the metadata for sap.m.Page from DesignTime (using control name - backwards compatibility)", function(assert) {
			var spyLog = sandbox.stub(Log, "error").callsFake(function(){
				assert.equal(spyLog.callCount, 1, "an error is raised telling how the method should be called now");
			});
			var oDTMetadata = this.oDesignTime.getDesignTimeMetadataFor("sap.m.Page");
			assert.strictEqual(oDTMetadata.testField, "testValue", "but the expected custom value is returned anyway");
		});

		QUnit.test("when getting the metadata from the created overlay", function(assert) {
			var oOverlay = OverlayRegistry.getOverlay(this.oPage);
			assert.strictEqual(oOverlay.getDesignTimeMetadata().getData().testField, "testValue", "then DTMetadata from the DT is merged correctly");
			assert.strictEqual(oOverlay.getDesignTimeMetadata().getAggregation("content").domRef, ":sap-domref > section", "UI5 DTMetadata is merged correctly");
		});

		QUnit.test("When the overlay and its aggregations are rendered", function(assert) {
			var oContentOverlay = this.oPageOverlay.getAggregationOverlay("content");
			var oHeaderOverlay = this.oPageOverlay.getAggregationOverlay("customHeader");

			var aAggregationOverlays = this.oPageOverlay.getAggregationOverlays();
			var iIndexOfContentOverlay = aAggregationOverlays.indexOf(oContentOverlay);
			var iIndexOfHeaderOverlay = aAggregationOverlays.indexOf(oHeaderOverlay);
			var iIndexOfContentOverlayInDom = this.oPageOverlay.$().find('>.sapUiDtOverlayChildren > *').index(oContentOverlay.$());
			var iIndexOfHeaderOverlayInDom = this.oPageOverlay.$().find('>.sapUiDtOverlayChildren > *').index(oHeaderOverlay.$());

			assert.ok(
				(iIndexOfContentOverlay < iIndexOfHeaderOverlay && iIndexOfContentOverlayInDom <= iIndexOfHeaderOverlayInDom)
				|| (iIndexOfContentOverlay > iIndexOfHeaderOverlay && iIndexOfContentOverlayInDom >= iIndexOfHeaderOverlayInDom),
				'then aggregations are on the correct positions'
			);
		});
	});

	QUnit.module("Given that the DesignTime is created with hidden layout", {
		beforeEach : function(assert) {
			var fnDone = assert.async();
			this.oButton1 = new Button({ text: 'Button1' });
			this.oLayout1 = new VerticalLayout({
				content: [this.oButton1]
			});
			this.oLayoutOuter = new VerticalLayout({
				content: [this.oLayout1]
			});
			this.oLayoutOuter.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				designTimeMetadata: {
					"sap.ui.layout.VerticalLayout" : {
						aggregations: {
							content: {
								domRef: function() {}
							}
						}
					}
				},
				rootElements: [this.oLayoutOuter]
			});

			this.oDesignTime.attachEventOnce('synced', function () {
				this.oOverlayLayoutOuter = OverlayRegistry.getOverlay(this.oLayout1);
				fnDone();
			}, this);
		},
		afterEach : function() {
			this.oDesignTime.destroy();
			this.oLayoutOuter.destroy();
		}
	}, function(){

		QUnit.test("when hidden layout becomes visible", function(assert) {
			var fnDone = assert.async();
			this.oButton2 = new Button({ text: 'Button2' });
			this.oLayout2 = new VerticalLayout({
				content : [this.oButton2]
			});
			this.oLayout2.addStyleClass('hidden');

			this.oDesignTime.attachEventOnce('synced', function () {
				this.oOverlayLayout2 = OverlayRegistry.getOverlay(this.oLayout2);
				assert.ok(!!this.oOverlayLayout2, 'then layout2 overlay is created');
				this.oOverlayButton2 = OverlayRegistry.getOverlay(this.oButton2);
				assert.ok(!!this.oOverlayButton2, 'then button2 overlay is created');
				fnDone();
			}, this);

			this.oLayoutOuter.removeContent(this.oLayout1);
			this.oLayoutOuter.addContent(this.oLayout2);
			this.oLayout2.removeStyleClass('hidden');
			sap.ui.getCore().applyChanges();
		});

		QUnit.test("when switching between layouts", function(assert) {
			var fnDone = assert.async();
			this.oButton2 = new Button({ text: 'Button2' });
			this.oLayout2 = new VerticalLayout({
				content : [this.oButton2]
			});
			this.oLayout2.addStyleClass('hidden');

			this.oDesignTime.attachEventOnce('synced', function () {
				this.oOverlayLayout2 = OverlayRegistry.getOverlay(this.oLayout2);
				assert.ok(!!this.oOverlayLayout2, 'layout2 overlay is created');
				this.oLayout2.removeStyleClass('hidden');

				this.oOverlayButton2 = OverlayRegistry.getOverlay(this.oButton2);
				assert.ok(!!this.oOverlayButton2, 'then button2 overlay is created');

				this.oDesignTime.attachEventOnce('synced', function () {
					this.oOverlayButton1 = OverlayRegistry.getOverlay(this.oButton1);
					assert.ok(!!this.oOverlayButton1, 'then button1 overlay is created');
					fnDone();
				}, this);

				setTimeout(function () {
					this.oLayoutOuter.removeContent(this.oLayout2);
					this.oLayoutOuter.addContent(this.oLayout1);
					this.oOverlayLayout1 = OverlayRegistry.getOverlay(this.oLayout2);
					assert.ok(!!this.oOverlayLayout1, 'then layout1 overlay is created');
					this.oLayout1.removeStyleClass('hidden');
					sap.ui.getCore().applyChanges();
				}.bind(this), 0);

			}, this);

			this.oLayout1.addStyleClass('hidden');
			this.oLayoutOuter.removeContent(this.oLayout1);
			this.oLayoutOuter.addContent(this.oLayout2);
			sap.ui.getCore().applyChanges();
		});
	});

	QUnit.module("Metadata propagation - Given independent controls consisting of vertical layout and buttons", {
		beforeEach: function(assert){
			var fnDone = assert.async();

			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2");
			this.oLayout1 = new VerticalLayout("vertlay");

			this.oMtDtFunction = MetadataTestUtil.createPropagateMetadataObject("sap.m.Button");
			this.oElemDtMetaDt = new ElementDesignTimeMetadata(MetadataTestUtil.buildMetadataObject({}));
			this.oRelevantContainerFunction = MetadataTestUtil.createPropagateRelevantContainerObject("sap.m.Button");

			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout1]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				var oElementOverlay = OverlayRegistry.getOverlay("vertlay");
				var oAggregationOverlay = oElementOverlay.getAggregationOverlay("content");
				var oAggregationDtMetadata = oAggregationOverlay.getDesignTimeMetadata();
				var oAggregationData = oAggregationDtMetadata.getData();
				oAggregationData.propagationInfos = [MetadataTestUtil.createPropagationInfoObject(this.oRelevantContainerFunction.propagateRelevantContainer, this.oLayout1, this.oMtDtFunction.propagateMetadata)];
				oAggregationDtMetadata.setData(oAggregationData);
				this.oDesignTime.createOverlay(this.oButton1).then(function(oElementOverlay) {
					this.oOverlayButton1 = oElementOverlay;
					this.mMetadata = this.oOverlayButton1.getDesignTimeMetadata().getData();
					fnDone();
				}.bind(this));
			}.bind(this));

		},
		afterEach: function(){
			this.oButton1.destroy();
			this.oButton2.destroy();
			this.oLayout1.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function(){
		QUnit.test("when existing element is added and element overlay already exists", function(assert) {
			var mData = this.oMtDtFunction.propagateMetadata(this.oButton1);

			this.oLayout1.addContent(this.oButton1);
			assert.deepEqual(
				this.oOverlayButton1.getDesignTimeMetadata().getData().aggregations.content,
				mData.aggregations.content,
				"designtime metadata was set successfully after adding the element with an existing overlay"
			);
			assert.equal(
				this.oOverlayButton1.getDesignTimeMetadata().getData().designtimeModule,
				this.mMetadata.designtimeModule,
				"designtime metadata from the button is preserved (only extended)"
			);
		});
		QUnit.test("when existing element is added and element overlay does not exist yet", function(assert) {
			var fnDone = assert.async();
			var mData = this.oMtDtFunction.propagateMetadata(this.oButton2);

			this.oDesignTime.attachElementOverlayCreated(function(oEvent){
				assert.deepEqual(oEvent.getParameter("elementOverlay").getDesignTimeMetadata().getData().aggregations.content, mData.aggregations.content,
					"designtime metadata was set successfully after adding the element without an existing overlay");
				fnDone();
			});

			this.oLayout1.addContent(this.oButton2);
		});
	});

	QUnit.module("Metadata propagation - Given two verticalLayouts with different designTimeMetadata", {
		beforeEach: function(assert){
			var fnDone = assert.async();

			this.oPropagateMetadataFunctionForLayout1 = MetadataTestUtil.createPropagateMetadataObject("sap.m.Button", "layout1");
			this.oPropagateMetadataFunctionForLayout2 = MetadataTestUtil.createPropagateMetadataObject("sap.m.Button", "layout2");

			var oLayoutMetadata1 = MetadataTestUtil.buildMetadataObject(this.oPropagateMetadataFunctionForLayout1);
			var oLayoutMetadata2 = MetadataTestUtil.buildMetadataObject(this.oPropagateMetadataFunctionForLayout2);

			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2");
			this.oVerticalLayout1 = new VerticalLayout("layout1", {
				content: [this.oButton1]
			});

			this.oHorizontalLayout1 = new HorizontalLayout("layout2");
			this.oPage = new Page({
				content: [this.oVerticalLayout1, this.oHorizontalLayout1, this.oButton2]
			}).placeAt("qunit-fixture");

			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements : [this.oPage],
				designTimeMetadata : {
					"sap.ui.layout.VerticalLayout" : oLayoutMetadata1.data,
					"sap.ui.layout.HorizontalLayout" : oLayoutMetadata2.data
				}
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
				this.oButton2Overlay = OverlayRegistry.getOverlay(this.oButton2);
				fnDone();
			}.bind(this));

		},
		afterEach: function(){
			this.oPage.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function(){
		QUnit.test("when button1 is moved from verticalLayout1 to verticalLayout2", function(assert) {
			this.oVerticalLayout1.removeContent(this.oButton1);
			assert.deepEqual(
				this.oButton1Overlay.getDesignTimeMetadata().getData().aggregations.content,
				this.oPropagateMetadataFunctionForLayout1.propagateMetadata(this.oButton1).aggregations.content,
				"then initially verticalLayout1 property is propagated"
			);
			this.oHorizontalLayout1.addContent(this.oButton1);
			assert.deepEqual(
				this.oButton1Overlay.getDesignTimeMetadata().getData().aggregations.content,
				this.oPropagateMetadataFunctionForLayout2.propagateMetadata(this.oButton1).aggregations.content,
				"then after move horizontalLayout1 property is propagated"
			);
		});
		QUnit.test("when button2 is moved into verticalLayout1, then removed from it", function(assert) {
			this.oPage.removeContent(this.oButton2);
			this.oVerticalLayout1.addContent(this.oButton2);
			assert.deepEqual(
				this.oButton2Overlay.getDesignTimeMetadata().getData().aggregations.content,
				this.oPropagateMetadataFunctionForLayout1.propagateMetadata(this.oButton2).aggregations.content,
				"then verticalLayout1 property is propagated when the button is moved into it"
			);
			this.oVerticalLayout1.removeContent(this.oButton2);
			this.oPage.insertContent(this.oButton2);
			assert.notOk(
				this.oButton2Overlay.getDesignTimeMetadata().getData().aggregations.content,
				"after removing the button from the layout the 'content' aggregation is no longer on the button DT"
			);
		});
	});

	QUnit.module('Public API - createOverlay()', {
		beforeEach: function () {
			this.oDesignTime = new DesignTime();
		},
		afterEach: function () {
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when called with an element as the only argument", function (assert) {
			var oButton = new Button();
			return this.oDesignTime.createOverlay(oButton).then(function (oElementOverlay) {
				assert.ok(
					oElementOverlay instanceof ElementOverlay && oElementOverlay.getElement() === oButton,
					"then an overlay is created properly"
				);
				oButton.destroy();
			});
		});

		QUnit.test("when called with params objects as an argument", function (assert) {
			var oButton = new Button();
			return this.oDesignTime.createOverlay({
				element: oButton,
				root: true,
				visible: false
			}).then(function (oElementOverlay) {
				assert.ok(
					oElementOverlay instanceof ElementOverlay && oElementOverlay.getElement() === oButton,
					"then an overlay is created properly"
				);
				assert.strictEqual(oElementOverlay.getIsRoot(), true, "then property 'root' was passed properly");
				assert.strictEqual(oElementOverlay.getVisible(), false, "then property 'visible' was passed properly");
				oButton.destroy();
			});
		});

		QUnit.test("when called without element", function (assert) {
			var fnDone = assert.async();
			this.oDesignTime.createOverlay({}).then(
				// Fulfilled
				function(){
					assert.ok(false, 'this must never be called, no overlay could be created without an element');
				},
				// Rejected
				function (oError) {
					assert.ok(true, 'promise is rejected');
					assert.ok(oError instanceof Error, 'proper rejection error is specified');
					fnDone();
				}
			);
		});

		QUnit.test("when called with incorrect element", function (assert) {
			var fnDone = assert.async();
			this.oDesignTime.createOverlay({
				element: function () {}
			}).then(
				// Fulfilled
				function(){
					assert.ok(false, 'this must never be called, no overlay could be created without an element');
				},
				// Rejected
				function (oError) {
					assert.ok(true, 'promise is rejected');
					assert.ok(oError instanceof Error, 'proper rejection reason is provided');
					fnDone();
				}
			);
		});

		QUnit.test("when called with already destroyed element", function (assert) {
			var fnDone = assert.async();
			var oButton = new Button();
			oButton.destroy();
			this.oDesignTime.createOverlay(oButton).then(
				// Fulfilled
				function(){
					assert.ok(false, 'this must never be called, no overlay could be created without destroyed element');
				},
				// Rejected
				function (oError) {
					assert.ok(true, 'promise is rejected');
					assert.ok(oError instanceof Error, 'proper rejection reason is provided');
					fnDone();
				}
			);
		});

		QUnit.test("when an overlay is created for a control that already has an overlay", function (assert) {
			var oButton = new Button();
			return this.oDesignTime.createOverlay(oButton).then(function (oElementOverlay) {
				return this.oDesignTime.createOverlay(oButton).then(function (oElementOverlay2) {
					assert.strictEqual(oElementOverlay, oElementOverlay2, 'then exactly same overlay was returned');
					oButton.destroy();
				});
			}.bind(this));
		});

		QUnit.test("when API called while creation of the overlay for the same control is still in the progress", function (assert) {
			var oButton = new Button();
			var fnPromiseResolve;

			sandbox.stub(ManagedObjectMetadata.prototype, "loadDesignTime").callsFake(function () {
				return new Promise(function (fnResolve) {
					fnPromiseResolve = fnResolve;
				});
			});

			var oPromise1 = this.oDesignTime.createOverlay(oButton);
			var oPromise2 = this.oDesignTime.createOverlay(oButton);

			assert.strictEqual(oPromise1, oPromise2, 'then second promise is exactly the same');

			var oPromiseAll = Promise.all([oPromise1, oPromise2]).then(function (aElementOverlays) {
				assert.strictEqual(aElementOverlays[0], aElementOverlays[1], 'then created element overlays are the same');
				oButton.destroy();
			});

			fnPromiseResolve({});
			return oPromiseAll;
		});

		QUnit.test("when an overlay is created for a control that has no parent control", function (assert) {
			var oButton = new Button();
			return this.oDesignTime.createOverlay(oButton).then(function (oElementOverlay) {
				assert.ok(oElementOverlay, 'then the overlay is created');
				assert.ok(oElementOverlay.getIsRoot(), 'then  isRoot property automatically set to true');
				oButton.destroy();
			});
		});

		QUnit.test("when an overlay is created and event elementOverlayCreated is triggered", function (assert) {
			var oButton = new Button();
			var fnElementOverlayCreatedSpy = sandbox.spy();

			this.oDesignTime.attachEventOnce("elementOverlayCreated", fnElementOverlayCreatedSpy);

			return this.oDesignTime.createOverlay(oButton).then(function (oElementOverlay) {
				assert.ok(oElementOverlay, 'then the overlay is created');
				assert.ok(fnElementOverlayCreatedSpy.called, 'elementOverlayCreated event is triggered');
				oButton.destroy();
			});
		});

		QUnit.test("when an overlay is created and element overlay is registered in OverlayRegistry", function (assert) {
			var oButton = new Button();

			return this.oDesignTime.createOverlay(oButton).then(function (oElementOverlay) {
				assert.ok(oElementOverlay, 'then the overlay is created');
				assert.strictEqual(OverlayRegistry.getOverlay(oButton), oElementOverlay, 'element overlay is registered and exactly the same as returned into the promise');
				oButton.destroy();
			});
		});

		QUnit.test("when an element is destroyed while creating its children", function (assert) {
			var fnDone = assert.async();
			var oLayout = new VerticalLayout();
			var oButton = new Button();
			oLayout.addContent(oButton);

			sandbox.stub(DesignTime.prototype, '_createChildren').callsFake(function () {
				oLayout.destroy();
				return Promise.resolve();
			});

			var fnElementOverlayCreatedSpy = sandbox.spy();
			this.oDesignTime.attachEventOnce("elementOverlayCreated", fnElementOverlayCreatedSpy);

			this.oDesignTime.createOverlay(oLayout).then(
				// Fulfilled
				function () {
					assert.ok(false, 'this must never be called');
				},
				// Rejected
				function (oError) {
					assert.ok(true, 'promise is rejected');
					assert.ok(oError instanceof Error, 'proper rejection reason is provided');
					assert.ok(
						oError.toString().indexOf("while creating children overlays, its parent overlay has been destroyed") !== -1,
						'proper rejection reason is provided'
					);
					assert.notOk(OverlayRegistry.getOverlay(oLayout), 'no overlay for Layout is registered');
					assert.notOk(OverlayRegistry.getOverlay(oButton), 'no overlay for Button is registered');
					assert.notOk(fnElementOverlayCreatedSpy.called, 'elementOverlayCreated event is not triggered');
					fnDone();
				}
			);
		});

		QUnit.test("when an element is destroyed while creating its children *element* overlays (aggregation overlays are already created)", function (assert) {
			var fnDone = assert.async();

			var oLayout = new VerticalLayout();
			var oButton = new Button();
			oLayout.addContent(oButton);
			var oContentAggregtionOverlay;

			var fnElementOverlayCreatedSpy = sandbox.spy();
			this.oDesignTime.attachEventOnce("elementOverlayCreated", fnElementOverlayCreatedSpy);
			var fnElementOverlayDestroyedSpy = sandbox.spy();
			this.oDesignTime.attachEventOnce("elementOverlayDestroyed", fnElementOverlayDestroyedSpy);

			var fnRegisterOriginal = OverlayRegistry.register;
			sandbox.stub(OverlayRegistry, 'register').callsFake(function (oOverlay) {
				if (oOverlay instanceof AggregationOverlay && oOverlay.getElement() === oLayout) {
					oContentAggregtionOverlay = oOverlay;
				}
				fnRegisterOriginal(oOverlay);
			});

			var fnCreateOverlayOriginal = this.oDesignTime.createOverlay;
			sandbox.stub(this.oDesignTime, 'createOverlay').callsFake(function (mParams) {
				if (mParams.element === oButton) {
					oLayout.destroy();
				}
				return fnCreateOverlayOriginal.apply(this, arguments);
			});

			this.oDesignTime.createOverlay({
				element: oLayout
			})
				.then(
					// Fulfilled
					function () {
						assert.ok(false, 'this must never be called');
					},
					// Rejected
					function (oError) {
						assert.ok(true, 'then the Promise is rejected as expected');
						assert.ok(oError instanceof Error, 'proper rejection reason is provided');
						assert.ok(
							oError.message.indexOf('while creating children overlays, its parent overlay has been destroyed') > -1,
							'then the error contains right rejection information'
						);
						assert.strictEqual(oContentAggregtionOverlay.bIsDestroyed, true, 'aggregation overlay for content aggregation was properly destroyed');
						assert.notOk(OverlayRegistry.getOverlay(oContentAggregtionOverlay.getId()), 'aggregation overlay was properly unregistered');
						assert.notOk(fnElementOverlayCreatedSpy.called, 'elementOverlayCreated event is not triggered');
						assert.notOk(fnElementOverlayDestroyedSpy.called, "elementOverlayDestroyed event is not triggered");
						fnDone();
					}
				)
				.catch(function () {
					assert.ok(false, 'catch must never be called');
				});
		});

		QUnit.test("when 'initFailed' is fired with a foreign error by a created Overlay", function (assert) {
			var fnDone = assert.async();

			sandbox.stub(ElementOverlay.prototype, "asyncInit").callsFake(function () {
				throw new Error('some unexpected error');
			});

			var oButton = new Button();

			this.oDesignTime.createOverlay(oButton)
				.then(
					// Fulfilled
					function () {
						assert.ok(false, 'this must never be called');
					},
					// Rejected
					function (oError) {
						assert.ok(true, 'promise is rejected');
						assert.ok(oError instanceof Error, 'proper rejection reason is provided');
						assert.ok(
							oError.toString().indexOf("some unexpected error") !== -1,
							'error contains information about original failure'
						);
						fnDone();
					}
				)
				.catch(function () {
					assert.ok(false, 'catch must never be called');
				});
		});

		QUnit.test("when a new control triggers the creation of an overlay but an error happens within the loadDesignTimeMetadata promise chain", function (assert) {
			var fnDone = assert.async();

			var oButton = new Button();
			var someError = new Error("some error occurred");
			sandbox.stub(ManagedObjectMetadata.prototype, "loadDesignTime").returns(Promise.reject(someError));

			sandbox.stub(Log, "error").callsFake(function() {
				assert.ok(false, 'async public API should not raise any errors in console, Promise.reject() is enough');
			});

			this.oDesignTime.createOverlay(oButton)
				.then(
					// Fulfilled
					function () {
						assert.ok(false, 'this must never be called');
					},
					// Rejected
					function (oError) {
						assert.ok(true, 'then the Promise is rejected as expected');
						assert.ok(oError instanceof Error, 'proper rejection reason is provided');
						assert.ok(
							oError.message.indexOf('some error occurred') > -1,
							'then the error contains information about original failure'
						);
						fnDone();
					}
				)
				.catch(function () {
					assert.ok(false, 'catch must never be called');
				});
		});

		QUnit.test("when DesignTime instance is destroyed while creating an element overlay", function (assert) {
			var fnDone = assert.async();
			var oButton = new Button();

			sandbox.stub(ManagedObjectMetadata.prototype, "loadDesignTime").callsFake(function () {
				this.oDesignTime.destroy();
				return Promise.resolve({});
			}.bind(this));

			var fnElementOverlayCreatedSpy = sandbox.spy();
			this.oDesignTime.attachEventOnce("elementOverlayCreated", fnElementOverlayCreatedSpy);
			var fnElementOverlayDestroyedSpy = sandbox.spy();
			this.oDesignTime.attachEventOnce("elementOverlayDestroyed", fnElementOverlayDestroyedSpy);

			this.oDesignTime.createOverlay(oButton).then(
				// Fulfilled
				function () {
					assert.ok(false, 'this must never be called');
				},
				// Rejected
				function (oError) {
					assert.ok(true, 'promise is rejected');
					assert.ok(oError instanceof Error, 'proper rejection reason is provided');
					assert.ok(
						oError.toString().indexOf("while creating overlay, DesignTime instance has been destroyed") !== -1,
						'proper rejection reason is provided'
					);
					assert.notOk(OverlayRegistry.getOverlay(oButton), 'no overlay for Button is registered');
					assert.notOk(fnElementOverlayCreatedSpy.called, "then event 'elementOverlayCreated' is not called");
					assert.notOk(fnElementOverlayDestroyedSpy.called, "then event 'elementOverlayDestroyed' is not called");
					fnDone();
				}
			);
		});
	});

	QUnit.module("Check overlay styles for new overlays after initial sync", {
		beforeEach: function(assert) {
			var fnDone = assert.async();
			this.oPanel = new Panel({
				width: '300px',
				height: '100px'
			});
			this.oPanel.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oPanel]
			});

			this.oDesignTime.attachEventOnce('synced', fnDone, this);
		},
		afterEach: function() {
			this.oDesignTime.destroy();
			this.oPanel.destroy();
		}
	}, function () {
		QUnit.test("when adding new control into an aggregation", function (assert) {
			var fnDone = assert.async();
			var oButton = new Button({ text: 'New Button' });
			var fnMetadataResolve;

			sandbox.stub(ManagedObjectMetadata.prototype, "loadDesignTime").callsFake(function () {
				return new Promise(function (fnResolve) {
					fnMetadataResolve = fnResolve;
				});
			});

			this.oDesignTime.attachEventOnce('synced', function () {
				var oElementOverlay = OverlayRegistry.getOverlay(oButton);
				assert.ok(oElementOverlay.isRendered(), 'the overlay is rendered');
				assert.ok(oElementOverlay.$().width() > 0 && oElementOverlay.$().height() > 0, 'the overlay has non-zero dimension');
				fnDone();
			}, this);

			this.oPanel.addContent(oButton);
			sap.ui.getCore().applyChanges();

			// If it brakes with "fnMetadataResolve is not a function",
			// then just wrap the next line into setTimeout
			fnMetadataResolve({});
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});