/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/base/Log",
	"sap/base/util/merge",
	"sap/m/List",
	"sap/m/CustomListItem",
	"sap/m/Button",
	"sap/m/Toolbar",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/layout/HorizontalLayout",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/ui/base/ManagedObjectMetadata",
	"sap/ui/base/ManagedObject",
	"sap/ui/dt/Overlay",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/AggregationOverlay",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/DesignTimeStatus",
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/Plugin",
	"sap/ui/dt/plugin/ContextMenu",
	"sap/ui/dt/plugin/DragDrop",
	"sap/ui/dt/plugin/ToolHooks",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/dt/Util",
	"qunit/MetadataTestUtil",
	"sap/ui/dt/DOMUtil",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	jQuery,
	Log,
	merge,
	List,
	CustomListItem,
	Button,
	Toolbar,
	VerticalLayout,
	HorizontalLayout,
	Page,
	Panel,
	ManagedObjectMetadata,
	ManagedObject,
	Overlay,
	ElementOverlay,
	AggregationOverlay,
	OverlayRegistry,
	DesignTime,
	DesignTimeStatus,
	ElementUtil,
	Plugin,
	ContextMenuPlugin,
	DragDrop,
	ToolHooks,
	ElementDesignTimeMetadata,
	DtUtil,
	MetadataTestUtil,
	DOMUtil,
	JSONModel,
	sinon,
	nextUIUpdate
) {
	"use strict";

	var style = document.createElement("style");
	document.head.appendChild(style);
	style.sheet.insertRule("\
		.hidden {\
			display: none !important;\
		}\
	");

	var sandbox = sinon.createSandbox();

	function isOverlayVisible(oElementOverlay) {
		return oElementOverlay.$().width() > 0 && oElementOverlay.$().height() > 0;
	}

	QUnit.module("Given that the DesignTime is created", {
		beforeEach() {
			this.oDesignTime = new DesignTime();
		},
		afterEach() {
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("when the DesignTime is created for a root control ", async function(assert) {
			var fnDone = assert.async();

			this.oButton = new Button();
			this.oButton.placeAt("qunit-fixture");
			await nextUIUpdate();

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

				this.oButton.destroy();
				fnDone();
			}.bind(this));
		});

		QUnit.test("when empty composite control is added to root followed by a button which is added to the composite control", async function(assert) {
			var fnDone = assert.async();
			var oOuterLayout;
			var oInnerLayout;
			var oButton;

			oOuterLayout = new VerticalLayout("outer-layout");
			oOuterLayout.placeAt("qunit-fixture");
			await nextUIUpdate();
			this.oDesignTime.addRootElement(oOuterLayout);

			this.oDesignTime.attachEventOnce("synced", async function() {
				this.oDesignTime.attachEventOnce("synced", function() {
					// TODO: Remove when it is no longer allowed that DT "synced" event is called before all applyStyles calls are finalized
					window.requestAnimationFrame(function() {
						var oButtonOverlay = OverlayRegistry.getOverlay(oButton);
						var oInnerOverlay = oButtonOverlay.getParentElementOverlay();
						assert.equal(
							oInnerOverlay.getElement().getId(),
							"inner-layout",
							"then the button overlay is inside in inner-layout overlay"
						);
						var oOuterOverlay = oInnerOverlay.getParentElementOverlay();
						assert.equal(
							oOuterOverlay.getElement().getId(),
							"outer-layout",
							"then the inner-layout overlay is chained at outer-layout overlay"
						);
						assert.strictEqual(
							DOMUtil.isVisible(oOuterOverlay.getDomRef()),
							true,
							"then the outer-layout overlay is visible"
						);
						assert.strictEqual(
							DOMUtil.isVisible(oInnerOverlay.getDomRef()),
							true,
							"then the inner-layout overlay is visible"
						);
						assert.strictEqual(
							DOMUtil.isVisible(oButtonOverlay.getDomRef()),
							true,
							"then the button-layout overlay is visible"
						);
						oOuterLayout.destroy();
						fnDone();
					});
				});
				oInnerLayout = new VerticalLayout("inner-layout");
				oButton = new Button("button1");
				oInnerLayout.addContent(oButton);
				oOuterLayout.addContent(oInnerLayout);
				await nextUIUpdate();
			}.bind(this));
		});

		QUnit.test("when getBusyPlugins() is called", function(assert) {
			var CustomPlugin1 = Plugin.extend("qunit.CustomPlugin1");
			var CustomPlugin2 = Plugin.extend("qunit.CustomPlugin2", {
				isBusy() {
					return true;
				}
			});
			var oCustomPlugin1 = new CustomPlugin1();
			var oCustomPlugin2 = new CustomPlugin2();

			this.oDesignTime.addPlugin(oCustomPlugin1);
			this.oDesignTime.addPlugin(oCustomPlugin2);
			assert.deepEqual(this.oDesignTime.getBusyPlugins(), [oCustomPlugin2]);
		});
	});

	QUnit.module("Given a Designtime with plugins", {
		beforeEach() {
			this.oContextMenuPlugin = new ContextMenuPlugin();
			this.oDragDropPlugin = new DragDrop();
			this.oToolHooks = new ToolHooks();
			this.oDesignTime = new DesignTime({
				plugins: [
					this.oToolHooks, this.oContextMenuPlugin, this.oDragDropPlugin
				]
			});
		},
		afterEach() {
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("when several plugins are busy", function(assert) {
			var done = assert.async();
			this.oToolHooks.setBusy(true);
			this.oContextMenuPlugin.setBusy(true);

			assert.strictEqual(this.oDesignTime.getBusyPlugins().length, 2, "two plugins are busy");

			this.oDesignTime.waitForBusyPlugins().then(function() {
				assert.strictEqual(this.oDesignTime.getBusyPlugins().length, 0, "no plugin is busy anymore");
				done();
			}.bind(this));

			this.oToolHooks.setBusy(false);
			this.oContextMenuPlugin.setBusy(false);
		});

		QUnit.test("when no plugin is busy", function(assert) {
			var aBusyPlugins = this.oDesignTime.getBusyPlugins();
			assert.strictEqual(aBusyPlugins.length, 0, "no plugin is busy");

			return this.oDesignTime.waitForBusyPlugins().then(function() {
				assert.ok(true, "the function resolves directly");
			});
		});
	});

	QUnit.module("Given that the DesignTime is created for a root control", {
		async beforeEach(assert) {
			var fnDone = assert.async();

			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2");
			this.oInnerLayout = new Panel({
				content: [
					this.oButton1,
					this.oButton2
				]
			});
			this.oOuterLayout = new Panel({
				content: [this.oInnerLayout]
			});

			this.oOuterLayout.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oOuterLayout]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				fnDone();
			});
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oOuterLayout.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the DesignTime is initialized ", function(assert) {
			var aOverlays = OverlayRegistry.getOverlays();

			assert.strictEqual(aOverlays.length, 10, "10 Overlays are created: 4 elements + 6 aggregations");

			assert.ok(OverlayRegistry.getOverlay(this.oOuterLayout), "overlay for outer layout exists");
			assert.ok(OverlayRegistry.getOverlay(this.oInnerLayout), "overlay for inner layout exists");
			assert.ok(OverlayRegistry.getOverlay(this.oButton1), "overlay for button1 exists");
			assert.ok(OverlayRegistry.getOverlay(this.oButton2), "overlay for button2 exists");

			assert.strictEqual(this.oDesignTime.getSelectionManager().get().length, 0, "and a new selection is created and initially empty");
		});

		QUnit.test("when an already created overlay is added as root", function(assert) {
			var done = assert.async();

			var oElementOverlay = OverlayRegistry.getOverlay(this.oButton1);
			oElementOverlay.attachIsRootChanged(function(oEvent) {
				assert.strictEqual(oEvent.getParameter("value"), true, "the isRoot has been changed to true");
				done();
			});
			this.oDesignTime.addRootElement(this.oButton1);
		});

		QUnit.test("when an Overlay is selected via overlay API and SelectionManager declines this selection", function(assert) {
			assert.strictEqual(this.oDesignTime.getSelectionManager().get().length, 0, "and a new selection is created and initially empty");
			var oElementOverlay = OverlayRegistry.getOverlay(this.oButton1);
			oElementOverlay.setSelectable(true);
			this.oDesignTime.getSelectionManager().addValidator(function(aElementOverlays) {
				return !aElementOverlays.map(function(oElementOverlay) {
					return oElementOverlay.getId();
				}).includes(oElementOverlay.getId());
			});
			oElementOverlay.setSelected(true);
			assert.notOk(oElementOverlay.isSelected());
			assert.strictEqual(this.oDesignTime.getSelectionManager().get().length, 0);
		});

		QUnit.test("when '_onAddAggregation' is called and a foreign error occurs during overlay creation", function(assert) {
			var fnDone = assert.async();
			sandbox.stub(this.oDesignTime, "createOverlay").rejects("custom error message");

			var oNewButton = new Button();

			var stubLog = sandbox.stub(Log, "error").callsFake(function() {
				assert.equal(stubLog.callCount, 1, "then an error is raised");
				assert.ok(stubLog.args[0][0].indexOf("Error in sap.ui.dt.DesignTime#_onAddAggregation") > -1, "the error has the correct text");
				assert.ok(stubLog.args[0][0].indexOf("custom error message") > -1, "the error contains information about custom error");
				fnDone();
			});

			this.oDesignTime._onAddAggregation(oNewButton, this.oInnerLayout, "content");
		});

		QUnit.test("when a new control is added to an existing control aggregation", function(assert) {
			var fnDone = assert.async();
			var oButton = new Button("newButton");
			var oElementOverlayCreatedSpy = sandbox.spy();

			this.oDesignTime.attachElementOverlayCreated(oElementOverlayCreatedSpy);

			this.oDesignTime.attachEventOnce("elementOverlayAdded", function(oEvent) {
				var oButtonOverlay = OverlayRegistry.getOverlay(oButton);
				assert.strictEqual(oElementOverlayCreatedSpy.callCount, 1, "elementOverlayCreated event is emitted before");
				assert.deepEqual(
					oEvent.getParameters(),
					{
						id: oButtonOverlay.getId(),
						targetAggregation: "content",
						targetId: oButtonOverlay.getParentAggregationOverlay().getId(),
						targetIndex: 1
					},
					"then event 'elementOverlayAdded' was fired with the required parameters"
				);
				fnDone();
			});

			this.oOuterLayout.addContent(oButton);
		});

		QUnit.test("when elementOverlayCreated listener fails with an exception", function(assert) {
			var fnDone = assert.async(2);
			var oButton3 = new Button("button3");
			var oButton4 = new Button("button4");
			var sErrorMessage = "some error";
			var oStub = sandbox.stub();
			oStub
			.withArgs(
				sinon.match(function(oEvent) {
					return oEvent.getParameter("elementOverlay").getElement().getId() === oButton3.getId();
				})
			)
			.throws(sErrorMessage);

			sandbox.stub(Log, "error")
			.callThrough()
			.withArgs(
				sinon.match(function(sMessage) {
					return sMessage.includes(sErrorMessage);
				})
			)
			.callsFake(function() {
				assert.ok(true);
				fnDone();
			});

			this.oDesignTime.attachElementOverlayCreated(oStub);

			this.oDesignTime.attachEventOnce("synced", function() {
				// This timeout is needed because of the callback racing for the synced event
				// FIXME: Needs to be removed when DesignTime class gets rid of usage of synced event internally.
				setTimeout(function() {
					assert.strictEqual(oStub.callCount, 2);
					fnDone();
				});
			});

			this.oOuterLayout.addContent(oButton3);
			this.oOuterLayout.addContent(oButton4);
		});

		QUnit.test("when registerElementOverlay fails for one of the overlays", function(assert) {
			var fnDone = assert.async(2);
			var oButton3 = new Button("button3");
			var oButton4 = new Button("button4");
			var sErrorMessage = "some error";
			var oStub = sandbox.stub();
			oStub
			.withArgs(
				sinon.match(function(oElementOverlay) {
					return oElementOverlay.getElement().getId() === oButton3.getId();
				})
			)
			.throws(sErrorMessage);

			var CustomPlugin = Plugin.extend("qunit.CustomPlugin", {
				registerElementOverlay: oStub,
				_registerOverlays() {} // to avoid registration of existent overlays
			});
			var oCustomPlugin = new CustomPlugin();
			this.oDesignTime.addPlugin(oCustomPlugin);

			sandbox.stub(Log, "error")
			.callThrough()
			.withArgs(
				sinon.match(function(sMessage) {
					return sMessage.includes(sErrorMessage);
				})
			)
			.callsFake(function() {
				assert.ok(true);
				fnDone();
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				// This timeout is needed because of the callback racing for the synced event
				// FIXME: Needs to be removed when DesignTime class gets rid of usage of synced event internally.
				setTimeout(function() {
					assert.strictEqual(oStub.callCount, 2);
					fnDone();
				});
			});

			this.oOuterLayout.addContent(oButton3);
			this.oOuterLayout.addContent(oButton4);
		});

		QUnit.test("when an existing control is moved from one control's aggregation to another control's aggregation", function(assert) {
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

		QUnit.test("when an existing element overlay's editable property is changed", function(assert) {
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

		QUnit.test("when an existing element overlay's editable property is changed and designtime is synced later and this overlay is destroyed in the meantime", function(assert) {
			var fnDone = assert.async();
			var oButton = new Button("button3");
			var fnResolveLoadDesigntime;

			sandbox.stub(ManagedObjectMetadata.prototype, "loadDesignTime")
			.callThrough()
			.withArgs(oButton)
			.callsFake(function() {
				return new Promise(function(fnResolve) {
					fnResolveLoadDesigntime = fnResolve;
				});
			});

			var oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);

			var oElementOverlayEditableChangedSpy = sandbox.spy();
			this.oDesignTime.attachEventOnce("elementOverlayEditableChanged", oElementOverlayEditableChangedSpy);

			// Set DesignTime in syncing state
			this.oInnerLayout.addContent(oButton);
			assert.strictEqual(this.oDesignTime.getStatus(), DesignTimeStatus.SYNCING);

			// Trigger editable property change
			oButton1Overlay.setEditable(!oButton1Overlay.getEditable());

			// In between "syncing" and "synced" events the overlay is destroyed
			this.oButton1.destroy();

			this.oDesignTime.attachEventOnce("synced", function() {
				assert.ok(oElementOverlayEditableChangedSpy.notCalled, "then event listeners for property changed was not called");
				fnDone();
			});

			// Continue execution (this will fire sync)
			fnResolveLoadDesigntime({});
		});

		QUnit.test("when an element overlay is created and in the meanwhile it is removed from the afterwards destroyed parent", function(assert) {
			var fnDone = assert.async();
			var oButton = new Button("newButton");
			var fnResolveLoadDesigntime;

			sandbox.stub(ManagedObjectMetadata.prototype, "loadDesignTime")
			.callThrough()
			.withArgs(oButton)
			.callsFake(function() {
				return new Promise(function(fnResolve) {
					fnResolveLoadDesigntime = fnResolve;
				});
			});
			var fnLogErrorSpy = sandbox.spy(Log, "error");
			var oElementOverlayAddedSpy = sandbox.spy();
			this.oDesignTime.attachEventOnce("elementOverlayAdded", oElementOverlayAddedSpy);

			// Set DesignTime in syncing state
			this.oInnerLayout.addContent(oButton);
			assert.strictEqual(this.oDesignTime.getStatus(), DesignTimeStatus.SYNCING);

			// In between "syncing" and "synced" events
			// 1. control is removed from parent
			// 2. the parent overlay is destroyed
			this.oInnerLayout.removeContent(oButton);
			this.oInnerLayout.destroy();

			this.oDesignTime.attachEventOnce("synced", function() {
				assert.ok(oElementOverlayAddedSpy.notCalled, "then event listeners is not called");
				assert.ok(fnLogErrorSpy.notCalled, "then no error message is shown");
				oButton.destroy();
				fnDone();
			});

			// Continue execution (this will fire sync)
			fnResolveLoadDesigntime({});
		});

		QUnit.test("when a parent is destroyed while overlays were being created for its children", function(assert) {
			var fnDone = assert.async();
			var oButton21 = new Button("innerButton21");
			var oButton22 = new Button("innerButton22");

			var oInnerLayout2 = new Panel({
				id: "innerPanel",
				content: [
					oButton21,
					oButton22
				]
			});

			sandbox.stub(this.oDesignTime, "_createChildren").callsFake(function(...aArgs) {
				const [oElementOverlay] = aArgs;
				return this.oDesignTime._createChildren.wrappedMethod.apply(this.oDesignTime, aArgs)
				.then(function() {
					if (oElementOverlay.getElement().getId() === "innerButton21") {
						oElementOverlay.getElement().getParent().destroy();
					}
				});
			}.bind(this));

			var fnLogErrorSpy = sandbox.spy(Log, "error");
			var oElementOverlayAddedSpy = sandbox.spy();
			this.oDesignTime.attachEventOnce("elementOverlayAdded", oElementOverlayAddedSpy);

			this.oDesignTime.attachEventOnce("synced", function() {
				assert.ok(oElementOverlayAddedSpy.notCalled, "then event listeners is not called");
				assert.ok(fnLogErrorSpy.notCalled, "then no error message is shown");
				fnDone();
			});

			// Set DesignTime in syncing state
			this.oOuterLayout.addContent(oInnerLayout2);
			assert.strictEqual(this.oDesignTime.getStatus(), DesignTimeStatus.SYNCING);
		});

		QUnit.test("when a new element overlay's editable property is changed during synchronization process", function(assert) {
			assert.expect(4);
			var fnDone = assert.async();
			var mExpectedResponse;
			var oButton = new Button("button");
			var oElementOverlayCreatedSpy = sandbox.spy();
			var CustomPlugin = Plugin.extend("qunit.CustomPlugin", {
				registerElementOverlay(oElementOverlay) {
					mExpectedResponse = {
						editable: !oElementOverlay.getEditable(),
						id: oElementOverlay.getId()
					};
					assert.strictEqual(oElementOverlay.getElement().getId(), oButton.getId(), "registerElementOverlay called with a new overlay");
					oElementOverlay.setEditable(mExpectedResponse.editable);
				},
				_registerOverlays() {} // to avoid registration of existent overlays
			});
			var oCustomPlugin = new CustomPlugin();
			var oSyncedSpy = sandbox.spy();
			var oElementOverlayEditableChangedSpy = sandbox.spy(function(oEvent) {
				assert.deepEqual(oEvent.getParameters(), mExpectedResponse, "then event 'elementOverlayEditableChanged' was fired with the required parameters");
				assert.ok(oElementOverlayEditableChangedSpy.calledAfter(oElementOverlayCreatedSpy), "then event 'elementOverlayEditableChanged' is emitted after 'elementOverlayCreated' event");
				assert.ok(oElementOverlayEditableChangedSpy.calledAfter(oSyncedSpy), "then event 'elementOverlayEditableChanged' is emitted after 'synced' event");
				fnDone();
			});

			this.oDesignTime.addPlugin(oCustomPlugin);
			this.oDesignTime.attachElementOverlayCreated(oElementOverlayCreatedSpy);
			this.oDesignTime.attachSynced(oSyncedSpy);
			this.oDesignTime.attachEventOnce("elementOverlayEditableChanged", oElementOverlayEditableChangedSpy);

			this.oOuterLayout.addContent(oButton);
		});

		QUnit.test("when a property on an element with an overlay is changed", function(assert) {
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

		QUnit.test("when a property on an element with an overlay was changed and designtime is synced later and this overlay is destroyed in the meantime", function(assert) {
			var fnDone = assert.async();
			var oButton = new Button("button3");
			var fnResolveLoadDesigntime;

			sandbox.stub(ManagedObjectMetadata.prototype, "loadDesignTime")
			.callThrough()
			.withArgs(oButton)
			.callsFake(function() {
				return new Promise(function(fnResolve) {
					fnResolveLoadDesigntime = fnResolve;
				});
			});

			var oElementPropertyChangedSpy = sandbox.spy();
			this.oDesignTime.attachEventOnce("elementPropertyChanged", oElementPropertyChangedSpy);

			// Set DesignTime in syncing state
			this.oInnerLayout.addContent(oButton);
			assert.strictEqual(this.oDesignTime.getStatus(), DesignTimeStatus.SYNCING);

			// Trigger property change
			this.oButton1.setVisible(false);

			// In between "syncing" and "synced" events the overlay is destroyed
			this.oButton1.destroy();

			this.oDesignTime.attachEventOnce("synced", function() {
				assert.ok(oElementPropertyChangedSpy.notCalled, "then event listeners for property changed was not called");
				fnDone();
			});

			// Continue execution (this will fire sync)
			fnResolveLoadDesigntime({});
		});

		QUnit.test("when a property on an element is changed during the creation of its overlay", function(assert) {
			var fnDone = assert.async();
			var oButton = new Button("button");
			var oLayout = new VerticalLayout("layout", {
				content: [oButton]
			});
			var mExpectedResponse = {
				id: undefined,
				name: "visible",
				oldValue: true,
				value: false
			};
			var oElementOverlayCreatedSpy = sandbox.spy(function(oEvent) {
				var oElementOverlay = oEvent.getParameter("elementOverlay");
				if (oElementOverlay.getElement() === oLayout) {
					mExpectedResponse.id = oEvent.getParameter("elementOverlay").getId();
				}
			});
			var oSyncedSpy = sandbox.spy();
			var oElementPropertyChangedSpy = sandbox.spy(function(oEvent) {
				assert.deepEqual(oEvent.getParameters(), mExpectedResponse, "then event 'elementPropertyChanged' was fired with the required parameters");
				assert.ok(oElementPropertyChangedSpy.calledAfter(oElementOverlayCreatedSpy), "then event 'elementOverlayEditableChanged' is emitted after 'elementOverlayCreated' event");
				assert.ok(oElementPropertyChangedSpy.calledAfter(oSyncedSpy), "then event 'elementOverlayEditableChanged' is emitted after 'synced' event");
				fnDone();
			});
			var fnLoadDesignTime = ManagedObjectMetadata.prototype.loadDesignTime;

			sandbox.stub(ManagedObjectMetadata.prototype, "loadDesignTime")
			.callThrough()
			.withArgs(oButton)
			.callsFake(function(...aArgs) {
				oLayout.setVisible(false);
				return fnLoadDesignTime.apply(this, aArgs);
			});

			this.oDesignTime.attachElementOverlayCreated(oElementOverlayCreatedSpy);
			this.oDesignTime.attachSynced(oSyncedSpy);
			this.oDesignTime.attachEventOnce("elementPropertyChanged", oElementPropertyChangedSpy);

			this.oOuterLayout.addContent(oLayout);
		});

		QUnit.test("when a new control without overlay is added to a root control aggregation", async function(assert) {
			var fnDone = assert.async();

			var oButton = new Button();
			var oLayout = new VerticalLayout({content: [oButton]});

			var bSyncingCalled = false;
			this.oDesignTime.attachEventOnce("syncing", function() {
				bSyncingCalled = true;
			});

			var iElementOverlaysCreated = 0;
			this.oDesignTime.attachEvent("elementOverlayCreated", function() {
				iElementOverlaysCreated++;
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				assert.strictEqual(bSyncingCalled, true, "syncing event was called");
				assert.strictEqual(iElementOverlaysCreated, 2, "two element overlays created events were called");

				assert.ok(OverlayRegistry.getOverlay(oButton), "overlay for the button exists");
				assert.ok(OverlayRegistry.getOverlay(oLayout), "overlay for the layout exists");

				fnDone();
			});

			this.oOuterLayout.addContent(oLayout);
			await nextUIUpdate();
		});

		QUnit.test("when a control is destroyed while loading design time metadata while adding it through aggregation", async function(assert) {
			var fnDone = assert.async();

			var oButton = new Button();

			// Simulate control is being destroyed
			sandbox.stub(ManagedObjectMetadata.prototype, "loadDesignTime").callsFake(function() {
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
			await nextUIUpdate();
		});

		QUnit.test("when a control is moved inside of root element", async function(assert) {
			var oOuterLayoutOverlay = OverlayRegistry.getOverlay(this.oOuterLayout);

			var oOldButtonOverlay = OverlayRegistry.getOverlay(this.oButton1);
			this.oOuterLayout.addContent(this.oButton1);

			await nextUIUpdate();

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

		QUnit.test("when a plugin is added, a new Overlay is created and the DesignTime is destroyed", async function(assert) {
			var fnDone = assert.async();
			var oToolHooksPlugin = new ToolHooks();
			var oRegisterPluginSpy = sandbox.spy(oToolHooksPlugin, "registerElementOverlay");
			var oDeregisterPluginSpy = sandbox.spy(oToolHooksPlugin, "deregisterElementOverlay");

			this.oDesignTime.addPlugin(oToolHooksPlugin);
			assert.strictEqual(oRegisterPluginSpy.called, true, "then the registerElementOverlay method for the plugin was called");

			var oPluginSpy = sandbox.spy(oToolHooksPlugin, "callElementOverlayRegistrationMethods");

			var oButton = new Button();
			this.oOuterLayout.addContent(oButton);
			await nextUIUpdate();

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
			var done = assert.async(6);
			var oToolHooksPlugin = new ToolHooks();
			var oContextMenuPlugin = new ContextMenuPlugin();
			var oDragDropPlugin = new DragDrop();
			var oRegisterElementOverlay = sandbox.spy(oToolHooksPlugin, "registerElementOverlay");
			var oTaskManagerAddSpy = sandbox.spy(this.oDesignTime._oTaskManager, "add");

			assert.equal(this.oDesignTime.getPlugins().length, 0, "initially there are no plugins on the design time");

			this.oDesignTime.addPlugin(oToolHooksPlugin);
			DtUtil.waitForSynced(this.oDesignTime, done)()
			.then(function() {
				assert.equal(oRegisterElementOverlay.callCount, 4,
					"then the plugin registration is called before designtime is synced");
				assert.equal(oTaskManagerAddSpy.calledWith({ type: "pluginInProcess", plugin: oToolHooksPlugin.getMetadata().getName()}), true,
					"then on addPlugin the taskManager is used with tasks from 'pluginInProcess' type");
				this.oDesignTime.insertPlugin(oContextMenuPlugin, 0);
				return DtUtil.waitForSynced(this.oDesignTime, done)();
			}.bind(this))
			.then(function() {
				assert.equal(oTaskManagerAddSpy.calledWith({ type: "pluginInProcess", plugin: oContextMenuPlugin.getMetadata().getName()}), true,
					"then on insertPlugin the taskManager is used with tasks from 'pluginInProcess' type");
				this.oDesignTime.insertPlugin(oDragDropPlugin, 1);
				return DtUtil.waitForSynced(this.oDesignTime, done)();
			}.bind(this))
			.then(function() {
				assert.equal(this.oDesignTime.getPlugins().length, 3, "then three plugins are present in design time");
				assert.strictEqual(this.oDesignTime.getPlugins()[0], oContextMenuPlugin,
					"the ContextMenu plugin was inserted in the right position of the aggregation");
				assert.strictEqual(this.oDesignTime.getPlugins()[1], oDragDropPlugin,
					"the ElementMover plugin was inserted in the right position of the aggregation");
				this.oDesignTime.removePlugin(oDragDropPlugin);
				return DtUtil.waitForSynced(this.oDesignTime, done)();
			}.bind(this))
			.then(function() {
				assert.equal(this.oDesignTime.getPlugins().length, 2,
					"after removing one, two plugins remain in design time");
				assert.strictEqual(this.oDesignTime.getPlugins()[1], oToolHooksPlugin,
					"the toolHooks plugin is in the right position of the aggregation");
				this.oDesignTime.removeAllPlugins();
				return DtUtil.waitForSynced(this.oDesignTime, done)();
			}.bind(this))
			.then(function() {
				assert.equal(this.oDesignTime.getPlugins().length, 0,
					"after calling 'removeAllPlugins' the are no more plugins on the design time");
				done();
			}.bind(this));
		});

		QUnit.test("when the element inside of the DesignTime is destroyed", function(assert) {
			var fnDone = assert.async();

			this.oDesignTime.attachEventOnce("elementOverlayDestroyed", function() {
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

			// stub the important async functionality to get a trigger that it was called
			sandbox.stub(DesignTime.prototype, "_checkIfOverlayShouldBeDestroyed").callsFake(function(...aArgs) {
				fnOriginalCheckIfOverlayShouldBeDestroyed.apply(this, aArgs);

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

			// stub the important async functionality to get a trigger that it was called
			sandbox.stub(DesignTime.prototype, "_checkIfOverlayShouldBeDestroyed").callsFake(function(...aArgs) {
				fnOriginalCheckIfOverlayShouldBeDestroyed.apply(this, aArgs);
				var oOverlayAfterwards = OverlayRegistry.getOverlay(sElementId);
				assert.ok(oOverlayAfterwards, "overlay for recreated control is not destroyed");
				fnDone();
			});

			this.oInnerLayout.removeContent(this.oButton1); // triggers setParent modified
			this.oButton1.destroy(); // triggers overlay removal
			this.oInnerLayout.addContent(new Button({ id: sElementId, text: "recreated"})); // triggers overlay being added
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
				jQuery(Overlay.getOverlayContainer()).filter(":visible").length,
				0,
				"then the overlay container has been hidden"
			);
			assert.strictEqual(
				OverlayRegistry.getOverlay(this.oOuterLayout).getVisible(),
				false,
				"then the outer overlay has been disabled"
			);
			assert.strictEqual(
				OverlayRegistry.getOverlay(this.oOuterLayout).isVisible(),
				false,
				"then the outer overlay is not visible"
			);
			assert.strictEqual(
				OverlayRegistry.getOverlay(this.oOuterLayout).getChildren()[0].isVisible(),
				false,
				"then the aggregation overlay of outer overlay is disabled"
			);

			this.oDesignTime.setEnabled(true);
			assert.strictEqual(
				jQuery(Overlay.getOverlayContainer()).filter(":visible").length,
				1,
				"then after enabling it again the overlay container is displayed"
			);
			assert.strictEqual(
				OverlayRegistry.getOverlay(this.oOuterLayout).getVisible(),
				true,
				"and the outer overlay is visible"
			);
			assert.strictEqual(
				OverlayRegistry.getOverlay(this.oOuterLayout).getChildren()[0].isVisible(),
				true,
				"and the aggregation overlay of outer overlay is visible"
			);
		});

		QUnit.test("when scrolling happens on the page while DesignTime is disabled, then scrollbar should be in sync after enabling", async function(assert) {
			var fnDone = assert.async();
			var oOuterLayoutOverlay = OverlayRegistry.getOverlay(this.oOuterLayout);

			oOuterLayoutOverlay.attachEventOnce("geometryChanged", function() {
				var oContentAggregationOverlay = oOuterLayoutOverlay.getAggregationOverlay("content");
				var oContentAggregationOverlayDomRef = oContentAggregationOverlay.getDomRef();
				var oContentAggregationDomRef = this.oOuterLayout.$("content").get(0);

				assert.strictEqual(oContentAggregationDomRef.scrollTop, oContentAggregationOverlayDomRef.scrollTop);
				this.oDesignTime.setEnabled(false);
				oContentAggregationDomRef.scrollTop = 50;
				oContentAggregationOverlay.attachEventOnce("scrollSynced", function() {
					assert.strictEqual(oContentAggregationDomRef.scrollTop, oContentAggregationOverlayDomRef.scrollTop);
					fnDone();
				}, this);
				this.oDesignTime.setEnabled(true);
			}, this);

			this.oOuterLayout.setWidth("110px");
			this.oOuterLayout.setHeight("50px");
			await nextUIUpdate();
		});

		QUnit.test("when inner layout is destroyed and then _createChildren is called for the outer layout", function(assert) {
			var fnDone = assert.async();
			var oOuterLayoutOverlay = OverlayRegistry.getOverlay(this.oOuterLayout);
			var oInnerLayoutOverlay = OverlayRegistry.getOverlay(this.oInnerLayout);
			oInnerLayoutOverlay.destroy();

			var oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);

			assert.notOk(oButton1Overlay, "then the children Overlays of the inner layout are also destroyed and de-registered");

			var fnSpy = sandbox.spy(DesignTime.prototype, "_createChildren");

			this.oDesignTime._createChildren(oOuterLayoutOverlay, {}).then(function() {
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

		function _haveChildrenRegisteredOverlays(oParentControl) {
			return oParentControl.every(function(oChild) {
				return OverlayRegistry.getOverlay(oChild) instanceof ElementOverlay;
			});
		}

		QUnit.test("when designTime goes to 'syncing' status before the previous 'synced' event was asynchronously fired", function(assert) {
			var fnDone = assert.async();
			var oButton3 = new Button("button3");
			var oButton4 = new Button("button4");

			function sendDesignTimeToSyncing() {
				var oOverlayForButton3 = OverlayRegistry.getOverlay(oButton3);
				if (this.oDesignTime.getStatus() === DesignTimeStatus.SYNCED && oOverlayForButton3) {
					var oClock = sinon.useFakeTimers();
					// this will send the designTime back to 'syncing'
					this.oInnerLayout.insertAggregation("content", oButton4, 3);
					oClock.tick(0);
					oClock.restore();
					this.oDesignTime._oTaskManager.detachEvent("complete", sendDesignTimeToSyncing, this);
				}
			}

			this.oDesignTime._oTaskManager.attachEvent("complete", sendDesignTimeToSyncing, this);

			this.oDesignTime.attachEventOnce("synced", function() {
				var aInnerLayoutContent = this.oInnerLayout.getContent();
				var bChildrenHaveRegisteredOverlays = _haveChildrenRegisteredOverlays(aInnerLayoutContent);

				assert.strictEqual(this.oDesignTime.getStatus(), "synced", "then DesignTime status was 'synced'");
				assert.strictEqual(aInnerLayoutContent.length, 4, "then 4 children are present in the internal layout");
				assert.strictEqual(bChildrenHaveRegisteredOverlays, true, "then all inner layout children have registered overlays");
				fnDone();
			}.bind(this));

			this.oInnerLayout.insertAggregation("content", oButton3, 2);
		});

		QUnit.test("when the DesignTime is destroyed", function(assert) {
			const oRemoveOverlayContainerSpy = sandbox.spy(Overlay, "removeOverlayContainer");
			this.oDesignTime.destroy();
			assert.ok(oRemoveOverlayContainerSpy.calledOnce, "then the overlay container is destroyed as well");
		});
	});

	QUnit.module("Given a layout and a button", {
		async beforeEach() {
			this.oButton1 = new Button("button");

			this.oLayout1 = new VerticalLayout("layout", {
				content: [this.oButton1]
			});
			this.oLayout1.placeAt("qunit-fixture");

			await nextUIUpdate();
		},
		afterEach() {
			this.oLayout1.destroy();
			if (this.oDesignTime) {
				this.oDesignTime.destroy();
			}
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the content of the layout behaves like an association and DesignTime is created", function(assert) {
			var fnDone = assert.async();
			sandbox.stub(AggregationOverlay.prototype, "isAssociation").returns(true);
			sandbox.stub(ElementUtil, "getAssociationInstances").returns([this.oButton1]);

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout1]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				var oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
				var oLayout1Overlay = OverlayRegistry.getOverlay(this.oLayout1);
				assert.ok(oButton1Overlay, "then the button overlay is still created properly");
				assert.deepEqual(oButton1Overlay.getParentElementOverlay(), oLayout1Overlay, "and it has the correct parent");
				fnDone();
			}.bind(this));
		});

		QUnit.test("when the design time is initialized", function(assert) {
			var fnDone = assert.async();

			var oSpy = sandbox.spy(DesignTime.prototype, "_createElementOverlay");

			this.oLayout1.getMetadata().loadDesignTime().then(function(mDesignTimeMetadata) {
				this.oDesignTime = new DesignTime({
					rootElements: [this.oLayout1]
				});

				this.oDesignTime.attachEventOnce("synced", async function() {
					await nextUIUpdate();

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
	});

	QUnit.module("Given that the DesignTime is initalized for two root controls", {
		async beforeEach(assert) {
			var fnDone = assert.async();

			this.oLayout1 = new VerticalLayout({
				content: []
			});
			this.oLayout2 = new VerticalLayout({
				content: []
			});
			this.oLayout3 = new VerticalLayout({
				content: []
			});
			this.oOuterLayout = new VerticalLayout({
				content: [this.oLayout1, this.oLayout2, this.oLayout3]
			});
			this.oOuterLayout.placeAt("qunit-fixture");

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout1, this.oLayout3]
			});
			await nextUIUpdate();

			this.oDesignTime.attachEventOnce("synced", async function() {
				await nextUIUpdate();
				fnDone();
			});
		},
		afterEach() {
			this.oOuterLayout.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function() {
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
			this.oDesignTime.attachEventOnce("synced", async function() {
				await nextUIUpdate();
				assert.ok(OverlayRegistry.getOverlay(this.oLayout1), "then overlay for layout1 exists");
				assert.ok(OverlayRegistry.getOverlay(this.oLayout2), "then overlay for layout2 exists");
				assert.ok(OverlayRegistry.getOverlay(this.oLayout3), "then overlay for layout3 exists");
				fnDone();
			}, this);
			this.oDesignTime.addRootElement(this.oLayout2);
		});

		QUnit.test("when the overlay for a root element cannot be created", function(assert) {
			var fnDone = assert.async(2);
			var sErrorMessage = "some error";
			sandbox.stub(DesignTime.prototype, "createOverlay").callsFake(function() {
				return Promise.reject(sErrorMessage);
			});

			sandbox.stub(Log, "error")
			.callThrough()
			.withArgs(
				sinon.match(function(sMessage) {
					return sMessage.includes(sErrorMessage);
				})
			)
			.callsFake(function() {
				assert.ok(true, "then error message is written to console");
				fnDone();
			});

			this.oDesignTime.attachSyncFailed(function() {
				assert.ok(true, "then 'syncFailed' event is fired");
				fnDone();
			});
			this.oDesignTime.addRootElement(this.oLayout2);
		});
	});

	function getJsonModelWithData(iCount, sIdPrefix, sIdSuffix) {
		var oData = [];
		for (var i = 0, n = iCount; i < n; i++) {
			oData.push({text: (sIdPrefix || "item") + i + (sIdSuffix || "-bound")});
		}
		return new JSONModel(oData);
	}

	QUnit.module("Given that the DesignTime is initialized with control including aggregation bindinding", {
		async beforeEach(assert) {
			const fnDone = assert.async();
			const oModel = getJsonModelWithData(2);
			this.oCustomListItemTemplate = new CustomListItem(
				"boundListItem",
				{content: [new Button("boundListItem-btn", {text: "{text}"})]}
			);
			this.oBoundList = new List("boundlist").setModel(oModel);
			this.oBoundList.bindAggregation("items", {
				path: "/",
				template: this.oCustomListItemTemplate,
				templateShareable: false
			});

			// create list with unbound items
			this.oUnboundList = new List("unboundlist");
			this.oUnboundList.addItem(new CustomListItem("unboundlist-0", {content: [new Button("item1-btn", {text: "item1-unbound"})]}));
			this.oUnboundList.addItem(new CustomListItem("unboundlist-1", {content: [new Button("item2-btn", {text: "item2-unbound"})]}));

			// create a HorizontalLayout containing the two lists
			this.oHorizontalLayout = new HorizontalLayout("horLyout", {
				content: [this.oBoundList, this.oUnboundList]
			});
			this.oHorizontalLayout.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oHorizontalLayout]
			});

			this.oDesignTime.attachEventOnce("synced", fnDone);
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oHorizontalLayout.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("when control gets bound after DesignTime is initialized", function(assert) {
		const fnDone = assert.async();
		const oCustomListItemTemplate = new CustomListItem(
			"boundListItem-2",
			{content: [new Button("boundListItem-btn-2", {text: "{text}"})]}
		);
		this.oDesignTime.attachEventOnce("synced", function() {
			const oBoundListItemOverlay = OverlayRegistry.getOverlay(oCustomListItemTemplate);
			const oBoundListItemContentOverlay = OverlayRegistry.getOverlay(oCustomListItemTemplate.getContent()[0]);
			assert.ok(oBoundListItemOverlay, "overlay for bound item exists");
			assert.strictEqual(
				oBoundListItemOverlay.getParentAggregationOverlay().sParentAggregationName,
				"aggregationBindingTemplateOverlays",
				"then the parent aggregation overlay is in the 'aggregationBindingTemplateOverlays' aggregation"
			);
			assert.ok(oBoundListItemContentOverlay, "overlay for bound item content exists");
			fnDone();
		}, this);
		this.oUnboundList.bindAggregation("items", {
			path: "/",
			template: oCustomListItemTemplate,
			templateShareable: false
		});
	});

	QUnit.test("when control gets unbound after DesignTime is initialized", function(assert) {
		const fnDone = assert.async();
		this.oDesignTime.attachEventOnce("synced", function() {
			const oBoundListOverlay = OverlayRegistry.getOverlay(this.oBoundList);
			const oBoundListItemOverlay = OverlayRegistry.getOverlay(this.oCustomListItemTemplate);
			assert.notOk(oBoundListItemOverlay, "overlay for bound item doesn't exist");
			assert.notOk(
				oBoundListOverlay.getAggregationBindingTemplateOverlays().length,
				"then the aggregation overlay for bound items is empty"
			);
			fnDone();
		}, this);
		this.oBoundList.unbindAggregation("items");
	});

	QUnit.test("when designtime is created", function(assert) {
		const aOverlays = OverlayRegistry.getOverlays();
		assert.strictEqual(aOverlays.length, 26, "then 26 Overlays are created: 12 elements + 13 aggregations + 1 template");

		const oButton1AOverlay = OverlayRegistry.getOverlay(this.oBoundList.getItems()[0].getContent()[0]);
		const oButton1BOverlay = OverlayRegistry.getOverlay(this.oBoundList.getItems()[1].getContent()[0]);
		const oButton2AOverlay = OverlayRegistry.getOverlay(this.oUnboundList.getItems()[0].getContent()[0]);
		const oButton2BOverlay = OverlayRegistry.getOverlay(this.oUnboundList.getItems()[1].getContent()[0]);
		const oButtonTemplateOverlay = OverlayRegistry.getOverlay(this.oCustomListItemTemplate.getContent()[0]);

		assert.ok(OverlayRegistry.getOverlay(this.oBoundList.getItems()[0]), "overlay for first bound item exists");
		assert.ok(oButton1AOverlay, "overlay for first bound item button exists");
		assert.ok(OverlayRegistry.getOverlay(this.oBoundList.getItems()[1]), "overlay for second bound item exists");
		assert.ok(oButton1BOverlay, "overlay for second bound item button exists");
		assert.ok(OverlayRegistry.getOverlay(this.oUnboundList.getItems()[0]), "overlay for first unbound item exists");
		assert.ok(oButton2AOverlay, "overlay for second unbound item button exists");
		assert.ok(OverlayRegistry.getOverlay(this.oUnboundList.getItems()[1]), "overlay for second unbound item exists");
		assert.ok(oButton2BOverlay, "overlay for second unbound item button exists");
		assert.ok(OverlayRegistry.getOverlay(this.oBoundList).getAggregationBindingTemplateOverlays()[0],
			"aggregation overlay for the aggregation template exists");
		assert.ok(OverlayRegistry.getOverlay(this.oCustomListItemTemplate),
			"overlay for the aggregation template (custom list item) exists");
		assert.ok(oButtonTemplateOverlay, "overlay for the button inside aggregation template (custom list item) exists");
		assert.strictEqual(
			DOMUtil.isVisible(oButton1AOverlay.getDomRef()),
			true,
			"then the first bound button overlay is visible"
		);
		assert.strictEqual(
			DOMUtil.isVisible(oButtonTemplateOverlay.getDomRef()),
			false,
			"then the button overlay inside aggregation template is not visible");
	});

	// *Controls*
	// VerticalLayout
	//	List -> with aggregation binding on items aggregation: "root-list"
	//		[items]
	//			CustomListItem: "outer-template" -> (template) without binding
	//				Button: "inner-top-button"
	//				List -> with aggregation binding on items
	//					[items]
	//						CustomListItem: "inner-template" (nested template)
	//							Button: "deep-button"
	//				Button: "inner-bottom-button"
	//		[headerToolbar]
	//			Toolbar -> without binding
	// 				Button

	// *Overlays* EO = ElementOverlay; AO = AggregationOverlay; TO = TemplateOverlay
	// VerticalLayout (EO)
	//  [content] (AO)
	//		List (EO)
	//          [aggregationBindingTemplateOverlays]
	//				[items] (AO/TO) "root-list"
	//					"outer-template" (EO/TO)
	//						[content] (AO/TO)
	//							"inner-top-button" (EO/TO)
	//							"inner-list" (EO/TO)
	//								[aggregationBindingTemplateOverlays]
	//									[items] (AO/TO)
	//									"inner-template" (EO/TO)
	//										[content] (AO/TO)
	//										"deep-button" (EO/TO)
	//								[headerToolBar] (AO/TO)
	//								[infoToolbar] (AO/TO)
	//							"inner-bottom-button" (EO/TO)
	//				root-list (EO)
	//                 ... (clones from the templates above)
	//				[headerToolbar] (AO)
	//				[infoToolbar] (AO)
	QUnit.module("Given that the DesignTime is initialized with controls including aggregation binding and nested aggregation binding", {
		async beforeEach(assert) {
			var fnDone = assert.async();
			// create list with bound items
			var oRootModel = getJsonModelWithData(2, "outer", "");
			var oInnerModel = getJsonModelWithData(3, "inner", "");

			this.oInnerTemplate = new CustomListItem("inner-template", {
				content: [new Button("deep-button", {text: "deep"})]
			});
			this.oInnerList = new List("inner-list").setModel(oInnerModel);
			this.oInnerList.bindAggregation("items", {
				path: "/",
				template: this.oInnerTemplate,
				templateShareable: false
			});

			this.oOuterTemplate = new CustomListItem("outer-template", {
				content: [
					new Button("inner-top-button", {text: "inner-top"}),
					this.oInnerList,
					new Button("inner-bottom-button", {text: "inner-bottom"})
				]
			});

			this.oToolbar = new Toolbar("external-toolbar", {
				content: [new Button("external-button", {text: "external"})]
			});

			this.oRootList = new List("root-list", {
				headerToolbar: [this.oToolbar]
			}).setModel(oRootModel);
			this.oRootList.bindAggregation("items", {
				path: "/",
				template: this.oOuterTemplate,
				templateShareable: false
			});

			this.oVerticalLayout = new VerticalLayout("verticalLayout", {
				content: [this.oRootList]
			});
			this.oVerticalLayout.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVerticalLayout]
			});

			this.oDesignTime.attachEventOnce("synced", fnDone);
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oVerticalLayout.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when designtime is created", function(assert) {
			var aOverlays = OverlayRegistry.getOverlays();
			assert.strictEqual(aOverlays.length, 55, "then 55 Overlays are created");

			var oVerticalLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
			var oOuterAggregationBindingTemplateOverlay = OverlayRegistry.getOverlay(this.oRootList).getAggregationBindingTemplateOverlays()[0];
			var oExternalListToolbarOverlay = OverlayRegistry.getOverlay(this.oRootList.getHeaderToolbar());

			assert.strictEqual(oVerticalLayoutOverlay.getElement().getId(), "verticalLayout",
				"then overlay is created for vertical layout");
			assert.strictEqual(oVerticalLayoutOverlay.getAggregationBindingTemplateOverlays().length, 0,
				"then there are no templates attached to the vertical layout overlay");
			assert.notOk(oVerticalLayoutOverlay.getIsPartOfTemplate(),
				"and it is not marked as part of an aggregation binding template");
			assert.strictEqual(oOuterAggregationBindingTemplateOverlay.getElement().getId(), "root-list",
				"then overlay is created for aggregation binding template and attached to the List overlay");
			assert.ok(oOuterAggregationBindingTemplateOverlay.getIsPartOfTemplate(),
				"and it is marked as part of an aggregation binding template");
			assert.strictEqual(oExternalListToolbarOverlay.getElement().getId(), "external-toolbar",
				"then overlay for not bound item on an additional aggregation exists");
			assert.strictEqual(oExternalListToolbarOverlay.getAggregationBindingTemplateOverlays().length, 0,
				"then there are no templates attached to the additional aggregation");

			// inside outer template
			var oTopButtonInsideOuterTemplateOverlay = OverlayRegistry.getOverlay("inner-top-button");
			var oListInsideOuterTemplateOverlay = OverlayRegistry.getOverlay("inner-list");
			var oBottomButtonInsideOuterTemplateOverlay = OverlayRegistry.getOverlay("inner-bottom-button");

			assert.ok(oTopButtonInsideOuterTemplateOverlay,	"then overlay is created for first item inside aggregation binding template");
			assert.ok(oTopButtonInsideOuterTemplateOverlay.getIsPartOfTemplate(),
				"and it marked as part of an aggregation binding template");
			assert.strictEqual(oTopButtonInsideOuterTemplateOverlay.getAggregationBindingTemplateOverlays().length, 0,
				"then there are no templates attached to the top button inside aggregation binding template");
			assert.ok(oListInsideOuterTemplateOverlay, "then overlay for first bound item exists");
			assert.strictEqual(oListInsideOuterTemplateOverlay.getAggregationBindingTemplateOverlays()[0].getElement().getId(), "inner-list",
				"then there is a template attached (nested) to the list inside aggregation binding template");
			assert.ok(oListInsideOuterTemplateOverlay.getAggregationBindingTemplateOverlays()[0].getIsPartOfTemplate(),
				"and it is marked as part of an aggregation binding template");
			assert.ok(oBottomButtonInsideOuterTemplateOverlay, "then overlay is created for second item inside aggregation binding template");
			assert.ok(oBottomButtonInsideOuterTemplateOverlay.getIsPartOfTemplate(),
				"and it is marked as part of an aggregation binding template");
			assert.strictEqual(oBottomButtonInsideOuterTemplateOverlay.getAggregationBindingTemplateOverlays().length, 0,
				"then there are no templates attached to the bottom button inside aggregation binding template");

			// inside inner template
			var oInnerTemplateOverlay = OverlayRegistry.getOverlay(this.oInnerList).getAggregationBindingTemplateOverlays()[0].getChildren()[0]; // columnListItem
			var oButtonInsideInnerTemplateOverlay = oInnerTemplateOverlay.getChildren()[0].getChildren()[0];

			assert.ok(oInnerTemplateOverlay, "then overlay is created for the inner (nested) aggregation binding template");
			assert.ok(oInnerTemplateOverlay.getIsPartOfTemplate(),
				"and it is marked as part of an aggregation binding template");
			assert.strictEqual(oButtonInsideInnerTemplateOverlay.getElement().getId(), "deep-button",
				"then overlay is created for nested aggregation binding template and attached to the List overlay");
			assert.ok(oButtonInsideInnerTemplateOverlay.getIsPartOfTemplate(),
				"and it is marked as part of an aggregation binding template");
			assert.strictEqual(oButtonInsideInnerTemplateOverlay.getAggregationBindingTemplateOverlays().length, 0,
				"then there are no templates attached to the button inside the inner (nested) aggregation binding template");

			// instances created from template by aggregation binding
			var oFirstAggregationBindingInstanceOverlay = OverlayRegistry.getOverlay(this.oRootList.getItems()[0]);
			var oSecondAggregationBindingInstanceOverlay = OverlayRegistry.getOverlay(this.oRootList.getItems()[1]);

			assert.strictEqual(oFirstAggregationBindingInstanceOverlay.getElement().getId(), "outer-template-root-list-0",
				"then overlay for first bound item exists");
			assert.notOk(oFirstAggregationBindingInstanceOverlay.getIsPartOfTemplate(),
				"and it is not marked as part of an aggregation binding template");
			assert.strictEqual(oFirstAggregationBindingInstanceOverlay.getAggregationBindingTemplateOverlays().length, 0,
				"then there are no templates attached to the first instance from template");
			assert.strictEqual(oSecondAggregationBindingInstanceOverlay.getElement().getId(), "outer-template-root-list-1",
				"then overlay for second bound item exists");
			assert.notOk(oSecondAggregationBindingInstanceOverlay.getIsPartOfTemplate(),
				"and it is not marked as part of an aggregation binding template");
			assert.strictEqual(oSecondAggregationBindingInstanceOverlay.getAggregationBindingTemplateOverlays().length, 0,
				"then there are no templates attached to the second instance from template");

			// inside first instance of the outer template
			var oFirstInstanceElement = this.oRootList.getItems()[0]; // customListItem
			var oTopButtonInsideOuterInstanceOverlay = OverlayRegistry.getOverlay(oFirstInstanceElement.getContent()[0]);
			var oListInsideOuterInstanceOverlay = OverlayRegistry.getOverlay(oFirstInstanceElement.getContent()[1]);
			var oBottomButtonInsideOuterInstanceOverlay = OverlayRegistry.getOverlay(oFirstInstanceElement.getContent()[2]);

			assert.ok(oTopButtonInsideOuterInstanceOverlay,	"then overlay is created for first item inside aggregation binding instance");
			assert.strictEqual(oTopButtonInsideOuterInstanceOverlay.getAggregationBindingTemplateOverlays().length, 0,
				"then there are no templates attached to the top button inside aggregation binding instance");
			assert.ok(oListInsideOuterInstanceOverlay, "then overlay for first bound item exists");
			assert.strictEqual(oListInsideOuterInstanceOverlay.getAggregationBindingTemplateOverlays().length, 0,
				"then there are no templates attached (nested) to the list inside aggregation binding instance");
			assert.ok(oBottomButtonInsideOuterInstanceOverlay, "then overlay is created for second item inside aggregation binding instance");
			assert.strictEqual(oBottomButtonInsideOuterInstanceOverlay.getAggregationBindingTemplateOverlays().length, 0,
				"then there are no templates attached to the bottom button inside aggregation binding instance");

			// inside first instance: nested template into outer template
			var oInnerTemplateInstanceElement = oFirstInstanceElement.getContent()[1].getItems()[0]; // [customListItem]
			var oInnerTemplateInstanceOverlay = OverlayRegistry.getOverlay(oInnerTemplateInstanceElement);
			var oButtonInsideInnerInstanceOverlay = OverlayRegistry.getOverlay(oInnerTemplateInstanceElement.getContent()[0]);

			assert.ok(oInnerTemplateInstanceOverlay, "then overlay is created for the inner (nested) aggregation binding instance");
			assert.strictEqual(oInnerTemplateInstanceOverlay.getAggregationBindingTemplateOverlays().length, 0,
				"then there are no templates attached to the inner template instance ");
			assert.strictEqual(oButtonInsideInnerInstanceOverlay.getElement().getId(), "deep-button-root-list-0-inner-list-root-list-0-0",
				"then overlay is created for nested aggregation binding instance of the button and attached to the List overlay");
			assert.notOk(oButtonInsideInnerInstanceOverlay.getIsPartOfTemplate(),
				"and it is not marked as part of an aggregation binding template");
			assert.strictEqual(oButtonInsideInnerInstanceOverlay.getAggregationBindingTemplateOverlays().length, 0,
				"then there are no templates attached to the button inside the inner (nested) aggregation binding instance");
			assert.strictEqual(oButtonInsideInnerInstanceOverlay.getChildren().length, 0,
				"then there are no other ovelrays attached to the button inside the inner (nested) aggregation binding template");
		});
	});

	QUnit.module("Given that the DesignTime is initialized with custom DesignTime Metadata for sap.m.Page", {
		beforeEach(assert) {
			var fnDone = assert.async();
			this.oPage = new Page();
			this.oPage.getMetadata().loadDesignTime().then(async function() {
				this.oPage.placeAt("qunit-fixture");
				await nextUIUpdate();

				this.oDesignTime = new DesignTime({
					designTimeMetadata: {
						"sap.m.Page": {
							testField: "testValue"
						}
					},
					rootElements: [this.oPage]
				});
				this.oDesignTime.attachEventOnce("synced", function() {
					this.oPageOverlay = OverlayRegistry.getOverlay(this.oPage);
					fnDone();
				}, this);
			}.bind(this));
		},
		afterEach() {
			this.oPage.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when getting the metadata for the sap.m.Page control from DesignTime", function(assert) {
			var oDTMetadata = this.oDesignTime.getDesignTimeMetadataFor(this.oPage);
			assert.strictEqual(oDTMetadata.testField, "testValue", "then the expected custom value is returned");
		});

		QUnit.test("when getting the metadata for sap.m.Page from DesignTime (using control name - backwards compatibility)", function(assert) {
			var spyLog = sandbox.stub(Log, "error").callsFake(function() {
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
	});

	QUnit.module("Given that the DesignTime is created with hidden layout", {
		async beforeEach(assert) {
			var fnDone = assert.async();
			this.oButton1 = new Button({ text: "Button1" });
			this.oLayout1 = new VerticalLayout({
				content: [this.oButton1]
			});
			this.oLayoutOuter = new VerticalLayout({
				content: [this.oLayout1]
			});
			this.oButton2 = new Button({ text: "Button2" });
			this.oLayout2 = new VerticalLayout({
				content: [this.oButton2]
			});
			this.oLayoutOuter.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				designTimeMetadata: {
					"sap.ui.layout.VerticalLayout": {
						aggregations: {
							content: {
								domRef() {}
							}
						}
					}
				},
				rootElements: [this.oLayoutOuter]
			});

			this.oDesignTime.attachEventOnce("synced", fnDone);
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oLayout1.destroy();
			this.oLayout2.destroy();
			this.oLayoutOuter.destroy();
		}
	}, function() {
		QUnit.test("when hidden layout becomes visible", function(assert) {
			var fnDone = assert.async();

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oOverlayLayout2 = OverlayRegistry.getOverlay(this.oLayout2);
				assert.ok(this.oOverlayLayout2, "then layout2 overlay is created");
				assert.notOk(isOverlayVisible(this.oOverlayLayout2), "the overlay has no size");

				this.oOverlayButton2 = OverlayRegistry.getOverlay(this.oButton2);
				assert.ok(this.oOverlayButton2, "then button2 overlay is created");

				this.oOverlayLayout2.attachEventOnce("geometryChanged", function() {
					assert.ok(isOverlayVisible(this.oOverlayLayout2), "the overlay has non-zero width/height");
					fnDone();
				}, this);
				this.oLayout2.removeStyleClass("hidden");
			}, this);

			this.oLayout2.addStyleClass("hidden");
			this.oLayoutOuter.removeContent(this.oLayout1);
			this.oLayoutOuter.addContent(this.oLayout2);
		});

		QUnit.test("when switching between layouts", function(assert) {
			var fnDone = assert.async();
			this.oLayout1.addStyleClass("hidden");
			this.oLayout2.addStyleClass("hidden");

			const fnSyncedCallback = function() {
				this.oOverlayLayout2 = OverlayRegistry.getOverlay(this.oLayout2);
				// sometimes there are additional synced events before the overlay was created
				if (!this.oOverlayLayout2) {
					this.oDesignTime.attachEventOnce("synced", fnSyncedCallback, this);
					return;
				}
				assert.ok(this.oOverlayLayout2, "layout2 overlay is created");
				this.oOverlayButton2 = OverlayRegistry.getOverlay(this.oButton2);
				assert.ok(this.oOverlayButton2, "then button2 overlay is created");
				assert.notOk(isOverlayVisible(this.oOverlayLayout2), "the layout2 overlay has no size when hidden");

				this.oOverlayLayout2.attachEventOnce("geometryChanged", function() {
					assert.ok(isOverlayVisible(this.oOverlayLayout2), "the layout2 overlay has non-zero width/height when made visible");

					// eslint-disable-next-line max-nested-callbacks
					this.oOverlayLayout2.attachEventOnce("destroyed", function() {
						this.oOverlayLayout2 = OverlayRegistry.getOverlay(this.oLayout2);
						assert.notOk(this.oOverlayLayout2, "layout2 overlay is removed");

						// eslint-disable-next-line max-nested-callbacks
						this.oDesignTime.attachEventOnce("synced", function() {
							this.oOverlayLayout1 = OverlayRegistry.getOverlay(this.oLayout1);
							assert.ok(this.oOverlayLayout1, "then layout1 overlay is created");
							this.oOverlayButton1 = OverlayRegistry.getOverlay(this.oButton1);
							assert.ok(this.oOverlayButton1, "then button1 overlay is created");
							assert.notOk(isOverlayVisible(this.oOverlayButton1), "the layout1 overlay has no size when hidden");

							// eslint-disable-next-line max-nested-callbacks
							this.oOverlayLayout1.attachEventOnce("geometryChanged", function() {
								assert.ok(
									isOverlayVisible(this.oOverlayLayout1),
									"the layout1 overlay has non-zero width/height when made visible"
								);
								fnDone();
							}, this);
							this.oLayout1.removeStyleClass("hidden");
						}, this);

						this.oLayoutOuter.addContent(this.oLayout1);
					}, this);

					this.oLayoutOuter.removeContent(this.oLayout2);
				}, this);

				this.oLayout2.removeStyleClass("hidden");
			};

			this.oDesignTime.attachEventOnce("synced", fnSyncedCallback, this);

			this.oOverlayLayout1 = OverlayRegistry.getOverlay(this.oLayout1);
			this.oOverlayLayout1.attachEventOnce("destroyed", function() {
				this.oLayoutOuter.addContent(this.oLayout2);
			}, this);
			this.oLayoutOuter.removeContent(this.oLayout1);
		});
	});

	QUnit.module("Metadata propagation - Given independent controls consisting of vertical layout and buttons", {
		async beforeEach(assert) {
			var fnDone = assert.async();

			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2");
			this.oLayout1 = new VerticalLayout("vertlay");

			this.oMtDtFunction = MetadataTestUtil.createPropagateMetadataObject("sap.m.Button");
			this.oElemDtMetaDt = new ElementDesignTimeMetadata(MetadataTestUtil.buildMetadataObject({}));
			this.oRelevantContainerFunction = MetadataTestUtil.createPropagateRelevantContainerObject("sap.m.Button");

			this.oLayout1.placeAt("qunit-fixture");
			await nextUIUpdate();
			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout1]
			});

			this.oDesignTime.attachEventOnce("synced", async function() {
				this.oButton1.placeAt("qunit-fixture");
				await nextUIUpdate();
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
		afterEach() {
			this.oButton1.destroy();
			this.oButton2.destroy();
			this.oLayout1.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function() {
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

			this.oDesignTime.attachElementOverlayCreated(function(oEvent) {
				assert.deepEqual(oEvent.getParameter("elementOverlay").getDesignTimeMetadata().getData().aggregations.content, mData.aggregations.content,
					"designtime metadata was set successfully after adding the element without an existing overlay");
				fnDone();
			});

			this.oLayout1.addContent(this.oButton2);
		});
	});

	QUnit.module("Metadata propagation - Given two verticalLayouts with different designTimeMetadata", {
		async beforeEach(assert) {
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

			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oPage],
				designTimeMetadata: {
					"sap.ui.layout.VerticalLayout": oLayoutMetadata1.data,
					"sap.ui.layout.HorizontalLayout": oLayoutMetadata2.data
				}
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
				this.oButton2Overlay = OverlayRegistry.getOverlay(this.oButton2);
				fnDone();
			}.bind(this));
		},
		afterEach() {
			this.oPage.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function() {
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

	QUnit.module("Public API - createOverlay()", {
		beforeEach() {
			this.oDesignTime = new DesignTime();
		},
		afterEach() {
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when called with an element as the only argument", async function(assert) {
			var oButton = new Button();
			oButton.placeAt("qunit-fixture");
			await nextUIUpdate();

			return this.oDesignTime.createOverlay(oButton).then(function(oElementOverlay) {
				assert.ok(
					oElementOverlay instanceof ElementOverlay && oElementOverlay.getElement() === oButton,
					"then an overlay is created properly"
				);
				oButton.destroy();
			});
		});

		QUnit.test("when a new control is added destroyed and another control with the same id is added again", async function(assert) {
			var sButtonId = "test-button";
			var oButton1 = new Button(sButtonId);
			var oButton2;
			var sFirstOverlayId;
			oButton1.placeAt("qunit-fixture");
			await nextUIUpdate();

			return this.oDesignTime.createOverlay(oButton1)
			.then(async function(oElementOverlay) {
				sFirstOverlayId = oElementOverlay.getId();
				oButton1.destroy();
				oButton2 = new Button(sButtonId);
				oButton2.placeAt("qunit-fixture");
				await nextUIUpdate();
				return this.oDesignTime.createOverlay(oButton2);
			}.bind(this))
			.then(function(oElementOverlay) {
				assert.notOk(oElementOverlay._bIsBeingDestroyed, "then the second created overlay is not destroyed");
				assert.notStrictEqual(oElementOverlay.getId(), sFirstOverlayId, "then the second created overlay is returned with a new overlay id");
			});
		});

		QUnit.test("when called with params objects as an argument", async function(assert) {
			var oButton = new Button();
			oButton.placeAt("qunit-fixture");
			await nextUIUpdate();

			return this.oDesignTime.createOverlay({
				element: oButton,
				root: true,
				visible: false
			}).then(function(oElementOverlay) {
				assert.ok(
					oElementOverlay instanceof ElementOverlay && oElementOverlay.getElement() === oButton,
					"then an overlay is created properly"
				);
				assert.strictEqual(oElementOverlay.getIsRoot(), true, "then property 'root' was passed properly");
				assert.strictEqual(oElementOverlay.getVisible(), false, "then property 'visible' was passed properly");
				oButton.destroy();
			});
		});

		QUnit.test("when called without element", function(assert) {
			var fnDone = assert.async();
			this.oDesignTime.createOverlay({}).then(
				// Fulfilled
				function() {
					assert.ok(false, "this must never be called, no overlay could be created without an element");
				},
				// Rejected
				function(oError) {
					assert.ok(true, "promise is rejected");
					assert.ok(oError instanceof Error, "proper error object is provided");
					assert.ok(oError.message.includes("Cannot create overlay — no element is specified"), "proper rejection reason is provided");
					fnDone();
				}
			);
		});

		QUnit.test("when called with incorrect element", function(assert) {
			var fnDone = assert.async();
			this.oDesignTime.createOverlay({
				element() {}
			}).then(
				// Fulfilled
				function() {
					assert.ok(false, "this must never be called, no overlay could be created without an element");
				},
				// Rejected
				function(oError) {
					assert.ok(true, "promise is rejected");
					assert.ok(oError instanceof Error, "proper error object is provided");
					assert.ok(oError.message.includes("Cannot create overlay without a valid element"), "proper rejection reason is provided");
					fnDone();
				}
			);
		});

		QUnit.test("when called with unsupported ManagedObject element", function(assert) {
			var fnDone = assert.async();
			this.oDesignTime.createOverlay({
				element: new ManagedObject()
			}).then(
				// Fulfilled
				function() {
					assert.ok(false, "this must never be called, no overlay could be created without an element");
				},
				// Rejected
				function(oError) {
					assert.ok(true, "promise is rejected");
					assert.ok(oError instanceof Error, "proper error object is provided");
					assert.ok(oError.message.includes("Cannot create overlay without a valid element"), "proper rejection reason is provided");
					fnDone();
				}
			);
		});

		QUnit.test("when called with already destroyed element", function(assert) {
			var fnDone = assert.async();
			var oButton = new Button();
			oButton.destroy();
			this.oDesignTime.createOverlay(oButton).then(
				// Fulfilled
				function() {
					assert.ok(false, "this must never be called, no overlay could be created without destroyed element");
				},
				// Rejected
				function(oError) {
					assert.ok(true, "promise is rejected");
					assert.ok(oError instanceof Error, "proper error object is provided");
					assert.ok(oError.message.includes("Cannot create overlay — the element is already destroyed"), "proper rejection reason is provided");
					fnDone();
				}
			);
		});

		QUnit.test("when called with an element from a bound aggregation but without control representation in the template", function(assert) {
			var fnDone = assert.async();
			var oModel = new JSONModel({
				texts: [{}, {}, {}] // this will create 3 horizontal layouts in items aggregation of VerticalLayout
			});

			var oVerticalLayout = new VerticalLayout({
				content: {
					path: "/texts",
					template: new HorizontalLayout({
						content: []
					})
				}
			});

			oVerticalLayout.setModel(oModel);

			var oButton = new Button("ManualButton");
			var oManualItem = new HorizontalLayout({
				content: [
					oButton
				]
			});

			oVerticalLayout.addContent(oManualItem);

			this.oDesignTime.createOverlay(oButton).then(
				// Fulfilled
				function() {
					assert.ok(false, "this must never be called, no overlay could be created without destroyed element");
				},
				// Rejected
				function(oError) {
					assert.ok(true, "promise is rejected");
					assert.ok(oError instanceof Error, "proper error object is provided");
					assert.ok(oError.message.startsWith("Element is in a bound aggregation, but not found in the binding template."), "proper rejection reason is provided");
					fnDone();
				}
			);
		});

		QUnit.test("when an overlay is created for a control that already has an overlay", async function(assert) {
			var oButton = new Button();
			oButton.placeAt("qunit-fixture");
			await nextUIUpdate();

			return this.oDesignTime.createOverlay(oButton).then(function(oElementOverlay) {
				return this.oDesignTime.createOverlay(oButton).then(function(oElementOverlay2) {
					assert.strictEqual(oElementOverlay, oElementOverlay2, "then exactly same overlay was returned");
					oButton.destroy();
				});
			}.bind(this));
		});

		QUnit.test("when called too frequently for the same control", async function(assert) {
			var oButton = new Button();
			var fnResolveLoadDesigntime;

			sandbox.stub(ManagedObjectMetadata.prototype, "loadDesignTime").callsFake(function() {
				return new Promise(function(fnResolve) {
					fnResolveLoadDesigntime = fnResolve;
				});
			});

			oButton.placeAt("qunit-fixture");
			await nextUIUpdate();

			var oPromise1 = this.oDesignTime.createOverlay(oButton);
			var oPromise2 = this.oDesignTime.createOverlay(oButton);

			assert.ok(oPromise1 === oPromise2, "then second promise is exactly the same");

			var oPromiseAll = Promise.all([oPromise1, oPromise2]).then(function(aElementOverlays) {
				assert.strictEqual(aElementOverlays[0].getId(), aElementOverlays[1].getId(), "then created element overlays are the same");
				oButton.destroy();
			});

			fnResolveLoadDesigntime({});
			return oPromiseAll;
		});

		QUnit.test("when called second time for the same control while the first creation is still in the progress", async function(assert) {
			var fnDone = assert.async(2);
			var oButton1;
			var oButton2;
			var oLayout = new VerticalLayout({
				content: [
					oButton1 = new Button("button1"),
					oButton2 = new Button("button2")
				]
			});
			oLayout.placeAt("qunit-fixture");
			await nextUIUpdate();

			sandbox.stub(ManagedObjectMetadata.prototype, "loadDesignTime")
			.callThrough()
			.withArgs(oButton2)
			.callsFake(function() {
				return new Promise(function(fnResolve) {
					// By using timeout we make sure that overlay for Button1 is already created and waits
					// in the waiting batch until it"s being registered.
					setTimeout(function() {
						this.oPromise2 = this.oDesignTime.createOverlay(oButton1);
						assert.ok(this.oPromise1 === this.oPromise2, "then the promises for the pending overlays are the same");
						fnResolve({});
						fnDone();
					}.bind(this), 20);
				}.bind(this));
			}.bind(this));

			this.oDesignTime.addRootElement(oLayout);

			// Extract the first promise. It should be the same as the one when creating this child control (proved by the previous test case)
			this.oPromise1 = this.oDesignTime.createOverlay(oButton1);

			this.oDesignTime.attachEventOnce("synced", function() {
				// Check values in Promises
				Promise.all([this.oPromise1, this.oPromise2]).then(function(aElementOverlays) {
					assert.strictEqual(aElementOverlays[0].getId(), aElementOverlays[1].getId(), "then created element overlays are the same");
					oLayout.destroy();
					fnDone();
				});
			}, this);
		});

		QUnit.test("when an overlay is created for a control that has no parent control", async function(assert) {
			var oButton = new Button();

			oButton.placeAt("qunit-fixture");
			await nextUIUpdate();

			return this.oDesignTime.createOverlay(oButton).then(function(oElementOverlay) {
				assert.ok(oElementOverlay, "then the overlay is created");
				assert.ok(oElementOverlay.getIsRoot(), "then  isRoot property automatically set to true");
				oButton.destroy();
			});
		});

		QUnit.test("when an overlay is created and event elementOverlayCreated is triggered", async function(assert) {
			var oButton = new Button();
			var fnElementOverlayCreatedSpy = sandbox.spy();

			this.oDesignTime.attachEventOnce("elementOverlayCreated", fnElementOverlayCreatedSpy);

			oButton.placeAt("qunit-fixture");
			await nextUIUpdate();

			return this.oDesignTime.createOverlay(oButton).then(function(oElementOverlay) {
				assert.ok(oElementOverlay, "then the overlay is created");
				assert.ok(fnElementOverlayCreatedSpy.called, "elementOverlayCreated event is triggered");
				oButton.destroy();
			});
		});

		QUnit.test("when an overlay is created and element overlay is registered in OverlayRegistry", async function(assert) {
			var oButton = new Button();
			oButton.placeAt("qunit-fixture");
			await nextUIUpdate();

			return this.oDesignTime.createOverlay(oButton).then(function(oElementOverlay) {
				assert.ok(oElementOverlay, "then the overlay is created");
				assert.strictEqual(OverlayRegistry.getOverlay(oButton), oElementOverlay, "element overlay is registered and exactly the same as returned into the promise");
				oButton.destroy();
			});
		});

		QUnit.test("when an element is destroyed while creating its children", async function(assert) {
			var fnDone = assert.async();
			var oLayout = new VerticalLayout();
			var oButton = new Button();
			oLayout.addContent(oButton);

			sandbox.stub(DesignTime.prototype, "_createChildren").callsFake(function() {
				oLayout.destroy();
				return Promise.resolve();
			});

			var fnElementOverlayCreatedSpy = sandbox.spy();
			this.oDesignTime.attachEventOnce("elementOverlayCreated", fnElementOverlayCreatedSpy);

			oLayout.placeAt("qunit-fixture");
			await nextUIUpdate();
			this.oDesignTime.createOverlay(oLayout).then(
				// Fulfilled
				function() {
					assert.ok(false, "this must never be called");
				},
				// Rejected
				function(oError) {
					assert.ok(true, "promise is rejected");
					assert.ok(oError instanceof Error, "proper rejection reason is provided");
					assert.ok(
						oError.toString().indexOf("while creating children overlays, its parent overlay has been destroyed") !== -1,
						"proper rejection reason is provided"
					);
					assert.notOk(OverlayRegistry.getOverlay(oLayout), "no overlay for Layout is registered");
					assert.notOk(OverlayRegistry.getOverlay(oButton), "no overlay for Button is registered");
					assert.notOk(fnElementOverlayCreatedSpy.called, "elementOverlayCreated event is not triggered");
					fnDone();
				}
			);
		});

		QUnit.test("when an element is destroyed while creating its children *element* overlays (aggregation overlays are already created)", async function(assert) {
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
			sandbox.stub(OverlayRegistry, "register").callsFake(function(oOverlay) {
				if (oOverlay instanceof AggregationOverlay && oOverlay.getElement() === oLayout) {
					oContentAggregtionOverlay = oOverlay;
				}
				fnRegisterOriginal(oOverlay);
			});

			var fnCreateOverlayOriginal = this.oDesignTime.createOverlay;
			sandbox.stub(this.oDesignTime, "createOverlay").callsFake(function(...aArgs) {
				const [mParams] = aArgs;
				if (mParams.element === oButton) {
					oLayout.destroy();
				}
				return fnCreateOverlayOriginal.apply(this, aArgs);
			});

			// Avoid error about destroyed element in console (as it's a managed destroy during the test)
			sandbox.stub(Log, "error")
			.callThrough()
			.withArgs(
				sinon.match(function(sMessage) {
					return sMessage.includes("Cannot create overlay");
				})
			)
			.returns();

			oLayout.placeAt("qunit-fixture");
			await nextUIUpdate();
			this.oDesignTime.createOverlay({
				element: oLayout
			})
			.then(
				// Fulfilled
				function() {
					assert.ok(false, "this must never be called");
				},
				// Rejected
				function(oError) {
					assert.ok(true, "then the Promise is rejected as expected");
					assert.ok(oError instanceof Error, "proper rejection reason is provided");
					assert.ok(
						oError.message.indexOf("while creating children overlays, its parent overlay has been destroyed") > -1,
						"then the error contains right rejection information"
					);
					assert.strictEqual(oContentAggregtionOverlay.bIsDestroyed, true, "aggregation overlay for content aggregation was properly destroyed");
					assert.notOk(OverlayRegistry.getOverlay(oContentAggregtionOverlay.getId()), "aggregation overlay was properly unregistered");
					assert.notOk(fnElementOverlayCreatedSpy.called, "elementOverlayCreated event is not triggered");
					assert.notOk(fnElementOverlayDestroyedSpy.called, "elementOverlayDestroyed event is not triggered");
					fnDone();
				}
			)
			.catch(function() {
				assert.ok(false, "catch must never be called");
			});
		});

		QUnit.test("when 'initFailed' is fired with a foreign error by a created Overlay", function(assert) {
			var fnDone = assert.async();

			sandbox.stub(ElementOverlay.prototype, "asyncInit").callsFake(function() {
				throw new Error("some unexpected error");
			});

			var oButton = new Button();

			this.oDesignTime.createOverlay(oButton)
			.then(
				// Fulfilled
				function() {
					assert.ok(false, "this must never be called");
				},
				// Rejected
				function(oError) {
					assert.ok(true, "promise is rejected");
					assert.ok(oError instanceof Error, "proper rejection reason is provided");
					assert.ok(
						oError.toString().indexOf("some unexpected error") !== -1,
						"error contains information about original failure"
					);
					fnDone();
				}
			)
			.catch(function() {
				assert.ok(false, "catch must never be called");
			});
		});

		QUnit.test("when a new control triggers the creation of an overlay but an error happens within the loadDesignTimeMetadata promise chain", function(assert) {
			var fnDone = assert.async();

			var oButton = new Button();
			var someError = new Error("some error occurred");
			sandbox.stub(ManagedObjectMetadata.prototype, "loadDesignTime").returns(Promise.reject(someError));

			sandbox.stub(Log, "error").callsFake(function() {
				assert.ok(false, "async public API should not raise any errors in console, Promise.reject() is enough");
			});

			this.oDesignTime.createOverlay(oButton)
			.then(
				// Fulfilled
				function() {
					assert.ok(false, "this must never be called");
				},
				// Rejected
				function(oError) {
					assert.ok(true, "then the Promise is rejected as expected");
					assert.ok(oError instanceof Error, "proper rejection reason is provided");
					assert.ok(oError.message.includes("Can't load designtime metadata data for overlay"), "then the error message is correct");
					assert.ok(oError.message.includes("some error occurred"), "then the error contains information about original failure");
					fnDone();
				}
			)
			.catch(function() {
				assert.ok(false, "catch must never be called");
			});
		});

		QUnit.test("when a control is destroyed while loading design time metadata", function(assert) {
			var fnDone = assert.async();
			var oButton = new Button();

			// Simulate control is being destroyed
			sandbox.stub(ManagedObjectMetadata.prototype, "loadDesignTime").callsFake(function() {
				oButton.destroy();
				return Promise.resolve({});
			});

			var fnElementOverlayCreatedSpy = sinon.spy();
			var fnElementOverlayDestroyedSpy = sinon.spy();
			this.oDesignTime.attachEventOnce("elementOverlayCreated", fnElementOverlayCreatedSpy);
			this.oDesignTime.attachEventOnce("elementOverlayDestroyed", fnElementOverlayDestroyedSpy);

			sandbox.stub(Log, "error").callsFake(function() {
				assert.ok(false, "then the error must not be raised");
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				assert.notOk(fnElementOverlayCreatedSpy.called, "then event 'elementOverlayCreated' wasn't called");
				assert.notOk(fnElementOverlayDestroyedSpy.called, "then event 'elementOverlayDestroyed' wasn't called");
			});

			this.oDesignTime.createOverlay(oButton)
			.then(
				function() {
					assert.ok(false, "resolve() must not ever happen");
				},
				function(oError) {
					assert.ok(true, "then Promise is rejected as expected");
					assert.ok(oError instanceof Error, "proper rejection reason is provided");
					assert.ok(oError.message.includes("Can't set metadata to overlay which element has been destroyed already"));
					assert.notOk(fnElementOverlayCreatedSpy.called, "then event 'elementOverlayCreated' wasn't called");
					assert.notOk(fnElementOverlayDestroyedSpy.called, "then event 'elementOverlayDestroyed' wasn't called");
					assert.ok(!OverlayRegistry.getOverlay(oButton), "then overlay of destroyed control is not available from registry");
					fnDone();
				}
			)
			.catch(function() {
				assert.ok(false, "catch() must not ever happen");
			});
		});

		QUnit.test("when DesignTime instance is destroyed while creating an element overlay", async function(assert) {
			var fnDone = assert.async();
			var oButton = new Button();

			sandbox.stub(ManagedObjectMetadata.prototype, "loadDesignTime").callsFake(function() {
				this.oDesignTime.destroy();
				return Promise.resolve({});
			}.bind(this));

			var fnElementOverlayCreatedSpy = sandbox.spy();
			this.oDesignTime.attachEventOnce("elementOverlayCreated", fnElementOverlayCreatedSpy);
			var fnElementOverlayDestroyedSpy = sandbox.spy();
			this.oDesignTime.attachEventOnce("elementOverlayDestroyed", fnElementOverlayDestroyedSpy);

			oButton.placeAt("qunit-fixture");
			await nextUIUpdate();
			this.oDesignTime.createOverlay(oButton)
			.then(
				// Fulfilled
				function() {
					assert.ok(false, "this must never be called");
				},
				// Rejected
				function(oError) {
					assert.ok(true, "promise is rejected");
					assert.ok(oError instanceof Error, "proper rejection reason is provided");
					assert.ok(
						oError.toString().indexOf("while creating overlay, DesignTime instance has been destroyed") !== -1,
						"proper rejection reason is provided"
					);
					assert.notOk(OverlayRegistry.getOverlay(oButton), "no overlay for Button is registered");
					assert.notOk(fnElementOverlayCreatedSpy.called, "then event 'elementOverlayCreated' is not called");
					assert.notOk(fnElementOverlayDestroyedSpy.called, "then event 'elementOverlayDestroyed' is not called");
					fnDone();
				}
			);
		});

		QUnit.test("when an overlay with actionsFromResponsibleElement is created", function(assert) {
			var oButton1 = new Button("button1");
			var oLayout = new VerticalLayout("layout1", {
				content: [
					oButton1
				]
			});
			var oButton2 = new Button("button2");
			var oLayout2 = new VerticalLayout("layout2", {
				content: [
					oButton2
				]
			});
			var oNewDesigntime = {};
			return oButton1.getMetadata().loadDesignTime().then(function(oDesignTimeMetadata) {
				oNewDesigntime = merge(oNewDesigntime, oDesignTimeMetadata, {
					actions: {
						actionsFromResponsibleElement: "rename",
						getResponsibleElement(oButton) {
							return oButton.getParent();
						}
					}
				});
				sandbox.stub(Button.prototype.getMetadata(), "loadDesignTime").resolves(oNewDesigntime);

				return Promise.all([
					this.oDesignTime.createOverlay(oLayout),
					this.oDesignTime.createOverlay(oLayout2)
				]);
			}.bind(this))
			.then(function() {
				assert.deepEqual(
					this.oDesignTime.getSelectionManager().getConnectedElements(),
					{
						layout1: "button1",
						button1: "layout1",
						layout2: "button2",
						button2: "layout2"
					},
					"the connected overlays are registered in the selection manager"
				);
			}.bind(this))
			.finally(function() {
				oLayout.destroy();
				oLayout2.destroy();
			});
		});
	});

	QUnit.module("Check overlay styles for new overlays after initial sync", {
		async beforeEach(assert) {
			var fnDone = assert.async();
			this.oPanel = new Panel({
				width: "300px",
				height: "100px"
			});
			this.oPanel.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oPanel]
			});

			this.oDesignTime.attachEventOnce("synced", fnDone, this);
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oPanel.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when adding new control into an aggregation", async function(assert) {
			var fnDone = assert.async();
			var oButton = new Button({ text: "New Button" });
			var fnMetadataResolve;

			sandbox.stub(ManagedObjectMetadata.prototype, "loadDesignTime").callsFake(function() {
				return new Promise(function(fnResolve) {
					fnMetadataResolve = fnResolve;
				});
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				var oElementOverlay = OverlayRegistry.getOverlay(oButton);
				assert.ok(oElementOverlay.isRendered(), "the overlay is rendered");
				assert.ok(isOverlayVisible(oElementOverlay), "the overlay has non-zero width/height");
				fnDone();
			}, this);

			this.oPanel.addContent(oButton);
			await nextUIUpdate();

			// If it brakes with "fnMetadataResolve is not a function",
			// then just wrap the next line into setTimeout
			fnMetadataResolve({});
		});
	});

	QUnit.module("Overlays registration", {
		async beforeEach() {
			this.oButton1 = new Button("button");

			this.oLayout = new VerticalLayout("layout", {
				content: [this.oButton1]
			});
			this.oLayout.placeAt("qunit-fixture");

			await nextUIUpdate();
		},
		afterEach() {
			this.oLayout.destroy();
			if (this.oDesignTime) {
				this.oDesignTime.destroy();
			}
			sandbox.restore();
		}
	}, function() {
		QUnit.test("registration order", function(assert) {
			assert.expect(6);
			var fnDone = assert.async();
			var oToolHooksPlugin = new ToolHooks();
			var oElementOverlayCreatedSpy = sandbox.spy();
			var oRegisterElementOverlaySpy = sandbox.stub(oToolHooksPlugin, "registerElementOverlay")
			.onFirstCall().callsFake(function() {
				assert.ok(OverlayRegistry.getOverlay(this.oButton1), "then button overlay is already registered in the overlayRegistry");
				assert.ok(OverlayRegistry.getOverlay(this.oLayout), "then layout overlay is already registered in the overlayRegistry");
				assert.equal(oElementOverlayCreatedSpy.callCount, 0, "then elementOverlayCreated event is not emitted");
			}.bind(this))
			.onSecondCall().callsFake(function() {
				assert.equal(oElementOverlayCreatedSpy.callCount, 0, "then elementOverlayCreated is not emitted");
			});

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout],
				plugins: [oToolHooksPlugin],
				elementOverlayCreated: oElementOverlayCreatedSpy
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				assert.equal(oRegisterElementOverlaySpy.callCount, 2, "then registerElementOverlay is called twice");
				assert.equal(oElementOverlayCreatedSpy.callCount, 2, "then elementOverlayCreated event is emitted twice");
				fnDone();
			});
		});

		QUnit.test("when control is destroyed before its overlay is released to external world", async function(assert) {
			var fnDone = assert.async();
			var oToolHooksPlugin = new ToolHooks();
			var oRegisterElementOverlaySpy = sandbox.spy(oToolHooksPlugin, "registerElementOverlay");
			var oElementOverlayCreatedSpy = sandbox.spy();
			var oElementOverlayDestroyedSpy = sandbox.spy();

			this.oButton2 = new Button("button2");
			this.oLayout.addContent(this.oButton2);
			await nextUIUpdate();

			// Destroy Button1 while creating an overlay for Button2
			sandbox.stub(ManagedObjectMetadata.prototype, "loadDesignTime")
			.callThrough()
			.withArgs(this.oButton2)
			.callsFake(function() {
				return new Promise(function(fnResolve) {
					// By using timeout we make sure that overlay for Button1 is already created and waits
					// in the waiting batch until it's being registered.
					setTimeout(function() {
						this.oButton1.destroy();
						fnResolve({});
					}.bind(this), 20);
				}.bind(this));
			}.bind(this));

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout],
				plugins: [oToolHooksPlugin],
				elementOverlayCreated: oElementOverlayCreatedSpy,
				elementOverlayDestroyed: oElementOverlayDestroyedSpy
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				assert.strictEqual(oRegisterElementOverlaySpy.callCount, 2, "then only 2 overlays got registered");
				assert.strictEqual(oElementOverlayCreatedSpy.callCount, 2, "two overlays got created");
				assert.strictEqual(oElementOverlayDestroyedSpy.callCount, 0, "no destroy event is expected for the overlay which wasn't released under 'elementOverlayCreated' event before");
				fnDone();
			});
		});

		QUnit.test("when createOverlay() is called as a public function, then the resolved overlay (and its children) should be registered properly", function(assert) {
			var oToolHooksPlugin = new ToolHooks();
			var oRegisterElementOverlaySpy = sandbox.spy(oToolHooksPlugin, "registerElementOverlay");
			var oElementOverlayCreatedSpy = sandbox.spy();
			var oElementOverlayDestroyedSpy = sandbox.spy();

			this.oDesignTime = new DesignTime({
				plugins: [oToolHooksPlugin],
				elementOverlayCreated: oElementOverlayCreatedSpy,
				elementOverlayDestroyed: oElementOverlayDestroyedSpy
			});

			return this.oDesignTime.createOverlay(this.oLayout).then(function() {
				assert.ok(OverlayRegistry.getOverlay(this.oLayout), "then overlay for layout control is available in registry");
				assert.ok(OverlayRegistry.getOverlay(this.oButton1), "then overlay for button control is available in registry");
				assert.strictEqual(oRegisterElementOverlaySpy.callCount, 2, "then only 2 overlays got registered");
				assert.strictEqual(oElementOverlayCreatedSpy.callCount, 2, "two overlays got created");
			}.bind(this));
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});