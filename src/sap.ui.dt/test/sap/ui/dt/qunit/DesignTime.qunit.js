/* global QUnit */

sap.ui.define([
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
	"sap/ui/dt/OverlayUtil",
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
	"sap/ui/test/utils/nextUIUpdate"
], function(
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
	OverlayUtil,
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

	const style = document.createElement("style");
	document.head.appendChild(style);
	style.sheet.insertRule("\
		.hidden {\
			display: none !important;\
		}\
	");

	const sandbox = sinon.createSandbox();

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
			const fnDone = assert.async();

			this.oButton = new Button();
			this.oButton.placeAt("qunit-fixture");
			await nextUIUpdate();

			let bSyncingCalled = false;
			this.oDesignTime.attachEventOnce("syncing", function() {
				bSyncingCalled = true;
			});

			this.oDesignTime.addRootElement(this.oButton);

			this.oDesignTime.attachEventOnce("synced", function() {
				assert.ok(bSyncingCalled, "then syncing event was called initially");
				assert.ok("and synced event was called");

				assert.ok(OverlayRegistry.getOverlay(this.oButton), "overlay for button exists");
				const oButtonDTMetadata = OverlayRegistry.getOverlay(this.oButton).getDesignTimeMetadata();
				assert.ok(oButtonDTMetadata, "the DesignTimeMetadata is available");

				this.oButton.destroy();
				fnDone();
			}.bind(this));
		});

		QUnit.test("when empty composite control is added to root followed by a button which is added to the composite control", async function(assert) {
			const fnDone = assert.async();
			const oOuterLayout = new VerticalLayout("outer-layout");
			oOuterLayout.placeAt("qunit-fixture");
			await nextUIUpdate();
			this.oDesignTime.addRootElement(oOuterLayout);

			this.oDesignTime.attachEventOnce("synced", async function() {
				this.oDesignTime.attachEventOnce("synced", function() {
					// todos#23: sap.ui.dt: DT "synced" event can fire before all applyStyles calls are finalized
					window.requestAnimationFrame(function() {
						const oButtonOverlay = OverlayRegistry.getOverlay(oButton);
						const oInnerOverlay = oButtonOverlay.getParentElementOverlay();
						assert.equal(
							oInnerOverlay.getElement().getId(),
							"inner-layout",
							"then the button overlay is inside in inner-layout overlay"
						);
						const oOuterOverlay = oInnerOverlay.getParentElementOverlay();
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
				const oInnerLayout = new VerticalLayout("inner-layout");
				const oButton = new Button("button1");
				oInnerLayout.addContent(oButton);
				oOuterLayout.addContent(oInnerLayout);
				await nextUIUpdate();
			}.bind(this));
		});

		QUnit.test("when getBusyPlugins() is called", function(assert) {
			const CustomPlugin1 = Plugin.extend("qunit.CustomPlugin1");
			const CustomPlugin2 = Plugin.extend("qunit.CustomPlugin2", {
				isBusy() {
					return true;
				}
			});
			const oCustomPlugin1 = new CustomPlugin1();
			const oCustomPlugin2 = new CustomPlugin2();

			this.oDesignTime.addPlugin(oCustomPlugin1);
			this.oDesignTime.addPlugin(oCustomPlugin2);
			assert.deepEqual(this.oDesignTime.getBusyPlugins(), [oCustomPlugin2]);
		});
	});

	QUnit.module("Given a DesignTime with plugins", {
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
			const done = assert.async();
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
			const aBusyPlugins = this.oDesignTime.getBusyPlugins();
			assert.strictEqual(aBusyPlugins.length, 0, "no plugin is busy");

			return this.oDesignTime.waitForBusyPlugins().then(function() {
				assert.ok(true, "the function resolves directly");
			});
		});
	});

	QUnit.module("Given that the DesignTime is created for a root control", {
		async beforeEach(assert) {
			const fnDone = assert.async();

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
			const aOverlays = OverlayRegistry.getOverlays();

			assert.strictEqual(aOverlays.length, 10, "10 Overlays are created: 4 elements + 6 aggregations");

			assert.ok(OverlayRegistry.getOverlay(this.oOuterLayout), "overlay for outer layout exists");
			assert.ok(OverlayRegistry.getOverlay(this.oInnerLayout), "overlay for inner layout exists");
			assert.ok(OverlayRegistry.getOverlay(this.oButton1), "overlay for button1 exists");
			assert.ok(OverlayRegistry.getOverlay(this.oButton2), "overlay for button2 exists");

			assert.strictEqual(this.oDesignTime.getSelectionManager().get().length, 0, "and a new selection is created and initially empty");
		});

		QUnit.test("when an already created overlay is added as root", function(assert) {
			const done = assert.async();

			const oElementOverlay = OverlayRegistry.getOverlay(this.oButton1);
			oElementOverlay.attachIsRootChanged(function(oEvent) {
				assert.strictEqual(oEvent.getParameter("value"), true, "the isRoot has been changed to true");
				done();
			});
			this.oDesignTime.addRootElement(this.oButton1);
		});

		QUnit.test("when an Overlay is selected via overlay API and SelectionManager declines this selection", function(assert) {
			assert.strictEqual(this.oDesignTime.getSelectionManager().get().length, 0, "and a new selection is created and initially empty");
			const oElementOverlay = OverlayRegistry.getOverlay(this.oButton1);
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
			const fnDone = assert.async();
			sandbox.stub(this.oDesignTime, "createOverlay").rejects("custom error message");

			const oNewButton = new Button();

			const stubLog = sandbox.stub(Log, "error").callsFake(function() {
				assert.equal(stubLog.callCount, 1, "then an error is raised");
				assert.ok(stubLog.args[0][0].indexOf("Error in sap.ui.dt.DesignTime#_onAddAggregation") > -1, "the error has the correct text");
				assert.ok(stubLog.args[0][0].indexOf("custom error message") > -1, "the error contains information about custom error");
				fnDone();
			});

			this.oDesignTime._onAddAggregation(oNewButton, this.oInnerLayout, "content");
		});

		QUnit.test("when a new control is added to an existing control aggregation", function(assert) {
			const fnDone = assert.async();
			const oButton = new Button("newButton");
			const oElementOverlayCreatedSpy = sandbox.spy();

			this.oDesignTime.attachElementOverlayCreated(oElementOverlayCreatedSpy);

			this.oDesignTime.attachEventOnce("elementOverlayAdded", function(oEvent) {
				const oButtonOverlay = OverlayRegistry.getOverlay(oButton);
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
			const fnDone = assert.async(2);
			const oButton3 = new Button("button3");
			const oButton4 = new Button("button4");
			const sErrorMessage = "some error";
			const oStub = sandbox.stub();
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
			const fnDone = assert.async(2);
			const oButton3 = new Button("button3");
			const oButton4 = new Button("button4");
			const sErrorMessage = "some error";
			const oStub = sandbox.stub();
			oStub
			.withArgs(
				sinon.match(function(oElementOverlay) {
					return oElementOverlay.getElement().getId() === oButton3.getId();
				})
			)
			.throws(sErrorMessage);

			const CustomPlugin = Plugin.extend("qunit.CustomPlugin", {
				registerElementOverlay: oStub,
				_registerOverlays() {} // to avoid registration of existent overlays
			});
			const oCustomPlugin = new CustomPlugin();
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
			const fnDone = assert.async();

			this.oDesignTime.attachEventOnce("elementOverlayMoved", function(oEvent) {
				const oExpectedResponse = {
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
			const fnDone = assert.async();
			const oElementOverlay = OverlayRegistry.getOverlay(this.oOuterLayout);
			const oExpectedResponse = {
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
			const fnDone = assert.async();
			const oButton = new Button("button3");
			let fnResolveLoadDesigntime;

			sandbox.stub(ManagedObjectMetadata.prototype, "loadDesignTime")
			.callThrough()
			.withArgs(oButton)
			.callsFake(function() {
				return new Promise(function(fnResolve) {
					fnResolveLoadDesigntime = fnResolve;
				});
			});

			const oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);

			const oElementOverlayEditableChangedSpy = sandbox.spy();
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
			const fnDone = assert.async();
			const oButton = new Button("newButton");
			let fnResolveLoadDesigntime;

			sandbox.stub(ManagedObjectMetadata.prototype, "loadDesignTime")
			.callThrough()
			.withArgs(oButton)
			.callsFake(function() {
				return new Promise(function(fnResolve) {
					fnResolveLoadDesigntime = fnResolve;
				});
			});
			const fnLogErrorSpy = sandbox.spy(Log, "error");
			const oElementOverlayAddedSpy = sandbox.spy();
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
			const fnDone = assert.async();
			const oButton21 = new Button("innerButton21");
			const oButton22 = new Button("innerButton22");

			const oInnerLayout2 = new Panel({
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

			const fnLogErrorSpy = sandbox.spy(Log, "error");
			const oElementOverlayAddedSpy = sandbox.spy();
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
			const fnDone = assert.async();
			let mExpectedResponse;
			const oButton = new Button("button");
			const oElementOverlayCreatedSpy = sandbox.spy();
			const CustomPlugin = Plugin.extend("qunit.CustomPlugin", {
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
			const oCustomPlugin = new CustomPlugin();
			const oSyncedSpy = sandbox.spy();
			const oElementOverlayEditableChangedSpy = sandbox.spy(function(oEvent) {
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
			const fnDone = assert.async();
			const oElementOverlay = OverlayRegistry.getOverlay(this.oOuterLayout);
			const oExpectedResponse = {
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

		QUnit.test("when a property changes, the fired params are a shallow copy (distinct object, type/target deleted)", function(assert) {
			const fnDone = assert.async();
			const oElementOverlay = OverlayRegistry.getOverlay(this.oOuterLayout);
			const oFireSpy = sandbox.spy(this.oDesignTime, "fireElementPropertyChanged");
			let oRawParams;

			oElementOverlay.attachEventOnce("elementModified", (oEvent) => {
				oRawParams = oEvent.getParameters();
			});

			this.oDesignTime.attachEventOnce("elementPropertyChanged", () => {
				assert.ok(oFireSpy.calledOnce, "fireElementPropertyChanged was called once");
				const oFiredParams = oFireSpy.firstCall.args[0];
				assert.notStrictEqual(oFiredParams, oRawParams, "fired params is a copy, not the live event parameters object");
				assert.notOk("type" in oFiredParams, "type was deleted from the copy");
				assert.notOk("target" in oFiredParams, "target was deleted from the copy");
				assert.strictEqual(oFiredParams.id, oElementOverlay.getId(), "id of the overlay was injected into the copy");
				fnDone();
			});

			this.oOuterLayout.setVisible(false);
		});

		QUnit.test("when a property on an element with an overlay was changed and designtime is synced later and this overlay is destroyed in the meantime", function(assert) {
			const fnDone = assert.async();
			const oButton = new Button("button3");
			let fnResolveLoadDesigntime;

			sandbox.stub(ManagedObjectMetadata.prototype, "loadDesignTime")
			.callThrough()
			.withArgs(oButton)
			.callsFake(function() {
				return new Promise(function(fnResolve) {
					fnResolveLoadDesigntime = fnResolve;
				});
			});

			const oElementPropertyChangedSpy = sandbox.spy();
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
			const fnDone = assert.async();
			const oButton = new Button("button");
			const oLayout = new VerticalLayout("layout", {
				content: [oButton]
			});
			const mExpectedResponse = {
				id: undefined,
				name: "visible",
				oldValue: true,
				value: false
			};
			const oElementOverlayCreatedSpy = sandbox.spy(function(oEvent) {
				const oElementOverlay = oEvent.getParameter("elementOverlay");
				if (oElementOverlay.getElement() === oLayout) {
					mExpectedResponse.id = oEvent.getParameter("elementOverlay").getId();
				}
			});
			const oSyncedSpy = sandbox.spy();
			const oElementPropertyChangedSpy = sandbox.spy(function(oEvent) {
				assert.deepEqual(oEvent.getParameters(), mExpectedResponse, "then event 'elementPropertyChanged' was fired with the required parameters");
				assert.ok(oElementPropertyChangedSpy.calledAfter(oElementOverlayCreatedSpy), "then event 'elementOverlayEditableChanged' is emitted after 'elementOverlayCreated' event");
				assert.ok(oElementPropertyChangedSpy.calledAfter(oSyncedSpy), "then event 'elementOverlayEditableChanged' is emitted after 'synced' event");
				fnDone();
			});
			const fnLoadDesignTime = ManagedObjectMetadata.prototype.loadDesignTime;

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
			const fnDone = assert.async();

			const oButton = new Button();
			const oLayout = new VerticalLayout({ content: [oButton] });

			let bSyncingCalled = false;
			this.oDesignTime.attachEventOnce("syncing", function() {
				bSyncingCalled = true;
			});

			let iElementOverlaysCreated = 0;
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
			const fnDone = assert.async();

			const oButton = new Button();

			// Simulate control is being destroyed
			sandbox.stub(ManagedObjectMetadata.prototype, "loadDesignTime").callsFake(function() {
				oButton.destroy();
				return Promise.resolve({});
			});

			const fnElementOverlayCreatedSpy = sinon.spy();
			const fnElementOverlayDestroyedSpy = sinon.spy();
			this.oDesignTime.attachEventOnce("elementOverlayCreated", fnElementOverlayCreatedSpy);
			this.oDesignTime.attachEventOnce("elementOverlayDestroyed", fnElementOverlayDestroyedSpy);

			this.oDesignTime.attachEventOnce("synced", function() {
				assert.notOk(fnElementOverlayCreatedSpy.called, "then event 'elementOverlayCreated' wasn't called");
				assert.notOk(fnElementOverlayDestroyedSpy.called, "then event 'elementOverlayDestroyed' wasn't called");

				const oButtonOverlay = OverlayRegistry.getOverlay(oButton);
				assert.ok(!oButtonOverlay, "then overlay of destroyed control is also destroyed");

				fnDone();
			});

			this.oOuterLayout.addContent(oButton);
			await nextUIUpdate();
		});

		QUnit.test("when a control is moved inside of root element", async function(assert) {
			const oOuterLayoutOverlay = OverlayRegistry.getOverlay(this.oOuterLayout);

			const oOldButtonOverlay = OverlayRegistry.getOverlay(this.oButton1);
			this.oOuterLayout.addContent(this.oButton1);

			await nextUIUpdate();

			const oNewButtonOverlay = OverlayRegistry.getOverlay(this.oButton1);
			assert.strictEqual(oOldButtonOverlay, oNewButtonOverlay, "overlay for button1 is not changed");

			assert.deepEqual(oNewButtonOverlay.getParentElementOverlay(), oOuterLayoutOverlay, "the control has the correct new parent overlay");
		});

		QUnit.test("when a control is removed from root element", function(assert) {
			const fnDone = assert.async();

			this.oInnerLayout.removeContent(this.oButton1);

			this.oDesignTime.attachEventOnce("elementOverlayDestroyed", function(oEvent) {
				assert.strictEqual(oEvent.getParameter("elementOverlay").getElement(), this.oButton1, "overlay for button is destroyed");
				fnDone();
				this.oButton1.destroy();
			}.bind(this));
		});

		QUnit.test("when a plugin is added, a new Overlay is created and the DesignTime is destroyed", async function(assert) {
			const fnDone = assert.async();
			const oToolHooksPlugin = new ToolHooks();
			const oRegisterPluginSpy = sandbox.spy(oToolHooksPlugin, "registerElementOverlay");
			const oDeregisterPluginSpy = sandbox.spy(oToolHooksPlugin, "deregisterElementOverlay");

			this.oDesignTime.addPlugin(oToolHooksPlugin);
			assert.strictEqual(oRegisterPluginSpy.called, true, "then the registerElementOverlay method for the plugin was called");

			const oPluginSpy = sandbox.spy(oToolHooksPlugin, "callElementOverlayRegistrationMethods");

			const oButton = new Button();
			this.oOuterLayout.addContent(oButton);
			await nextUIUpdate();

			this.oDesignTime.attachEventOnce("synced", function() {
				const oButtonOverlay = OverlayRegistry.getOverlay(oButton);
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
			const done = assert.async(6);
			const oToolHooksPlugin = new ToolHooks();
			const oContextMenuPlugin = new ContextMenuPlugin();
			const oDragDropPlugin = new DragDrop();
			const oRegisterElementOverlay = sandbox.spy(oToolHooksPlugin, "registerElementOverlay");
			const oTaskManagerAddSpy = sandbox.spy(this.oDesignTime._oTaskManager, "add");

			assert.equal(this.oDesignTime.getPlugins().length, 0, "initially there are no plugins on the design time");

			this.oDesignTime.addPlugin(oToolHooksPlugin);
			DtUtil.waitForSynced(this.oDesignTime, done)()
			.then(function() {
				assert.equal(oRegisterElementOverlay.callCount, 4,
					"then the plugin registration is called before designtime is synced");
				assert.equal(oTaskManagerAddSpy.calledWith({ type: "pluginInProcess", plugin: oToolHooksPlugin.getMetadata().getName() }), true,
					"then on addPlugin the taskManager is used with tasks from 'pluginInProcess' type");
				this.oDesignTime.insertPlugin(oContextMenuPlugin, 0);
				return DtUtil.waitForSynced(this.oDesignTime, done)();
			}.bind(this))
			.then(function() {
				assert.equal(oTaskManagerAddSpy.calledWith({ type: "pluginInProcess", plugin: oContextMenuPlugin.getMetadata().getName() }), true,
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
			const fnDone = assert.async();

			this.oDesignTime.attachEventOnce("elementOverlayDestroyed", function() {
				assert.notOk(OverlayRegistry.getOverlay(this.oButton1), "overlay for button1 destroyed");

				fnDone();
			}, this);

			this.oButton1.destroy();
		});

		QUnit.test("when the element inside of the DesignTime is removed and then destroyed", function(assert) {
			const fnDone = assert.async();

			this.oDesignTime.attachEventOnce("elementOverlayDestroyed", function() {
				assert.notOk(OverlayRegistry.getOverlay(this.oButton1), "overlay for button1 destroyed");

				fnDone();
			}, this);

			this.oInnerLayout.removeContent(this.oButton1);
			this.oButton1.destroy();
		});

		QUnit.test("when the element inside of the DesignTime is moved to 'dependents' aggregation", function(assert) {
			const fnDone = assert.async();

			this.oDesignTime.attachEventOnce("elementOverlayDestroyed", function(oEvent) {
				assert.strictEqual(oEvent.getParameter("elementOverlay").getElement(), this.oButton1, "overlay for button is destroyed");
				fnDone();
			}, this);

			this.oInnerLayout.addDependent(this.oButton1);
		});

		QUnit.test("when the element inside of the DesignTime is moved from one control to another", function(assert) {
			const fnDone = assert.async(2 /* callback will be called for remove and add aggregation */);
			const oElement = this.oButton1;
			const oOverlayBefore = OverlayRegistry.getOverlay(oElement);
			const fnOriginalCheckIfOverlayShouldBeDestroyed = this.oDesignTime._checkIfOverlayShouldBeDestroyed;

			// stub the important async functionality to get a trigger that it was called
			sandbox.stub(DesignTime.prototype, "_checkIfOverlayShouldBeDestroyed").callsFake(function(...aArgs) {
				fnOriginalCheckIfOverlayShouldBeDestroyed.apply(this, aArgs);

				const oOverlayAfterwards = OverlayRegistry.getOverlay(oElement);
				assert.strictEqual(oOverlayBefore, oOverlayAfterwards, "overlay for moved control is not destroyed");
				fnDone();
			});

			this.oInnerLayout.removeContent(this.oButton1);
			this.oOuterLayout.addContent(this.oButton1);
		});

		QUnit.test("when the element inside of the DesignTime is destroyed and recreated with the same ID", function(assert) {
			const fnDone = assert.async();
			const sElementId = this.oButton1.getId();
			const fnOriginalCheckIfOverlayShouldBeDestroyed = this.oDesignTime._checkIfOverlayShouldBeDestroyed;

			// stub the important async functionality to get a trigger that it was called
			sandbox.stub(DesignTime.prototype, "_checkIfOverlayShouldBeDestroyed").callsFake(function(...aArgs) {
				fnOriginalCheckIfOverlayShouldBeDestroyed.apply(this, aArgs);
				const oOverlayAfterwards = OverlayRegistry.getOverlay(sElementId);
				assert.ok(oOverlayAfterwards, "overlay for recreated control is not destroyed");
				fnDone();
			});

			this.oInnerLayout.removeContent(this.oButton1); // triggers setParent modified
			this.oButton1.destroy(); // triggers overlay removal
			this.oInnerLayout.addContent(new Button({ id: sElementId, text: "recreated" })); // triggers overlay being added
		});

		// TODO: check after DesignTime API Enhancement
		QUnit.test("when the overlay is selected inside of the DesignTime", function(assert) {
			const fnDone = assert.async();
			const oOverlay = OverlayRegistry.getOverlay(this.oButton1);

			this.oDesignTime.getSelectionManager().attachEventOnce("change", function(oEvent) {
				const aSelection = oEvent.getParameter("selection");
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
				Overlay.getOverlayContainer().style.display !== "none",
				false,
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
				Overlay.getOverlayContainer().style.display !== "none",
				true,
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
			const fnDone = assert.async();
			const oOuterLayoutOverlay = OverlayRegistry.getOverlay(this.oOuterLayout);

			oOuterLayoutOverlay.attachEventOnce("geometryChanged", function() {
				const oContentAggregationOverlay = oOuterLayoutOverlay.getAggregationOverlay("content");
				const oContentAggregationOverlayDomRef = oContentAggregationOverlay.getDomRef();
				const oContentAggregationDomRef = this.oOuterLayout.$("content").get(0);

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
			const fnDone = assert.async();
			const oOuterLayoutOverlay = OverlayRegistry.getOverlay(this.oOuterLayout);
			const oInnerLayoutOverlay = OverlayRegistry.getOverlay(this.oInnerLayout);
			oInnerLayoutOverlay.destroy();

			let oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);

			assert.notOk(oButton1Overlay, "then the children Overlays of the inner layout are also destroyed and de-registered");

			const fnSpy = sandbox.spy(DesignTime.prototype, "_createChildren");

			this.oDesignTime._createChildren(oOuterLayoutOverlay, {}).then(function() {
				oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
				const oOuterLayoutAggregationOverlay = OverlayRegistry.getOverlay(this.oOuterLayout).getAggregationOverlay("content");
				const oInnerLayoutAggregationOverlay = OverlayRegistry.getOverlay(this.oInnerLayout).getAggregationOverlay("content");
				assert.ok(oButton1Overlay, "then after _createChildren is called the children Overlays are created and registered again");
				assert.ok(oOuterLayoutAggregationOverlay, "and the outer layout 'content' aggregation overlay is also created");
				assert.ok(oInnerLayoutAggregationOverlay, "and the inner layout 'content' aggregation overlay is also created");
				assert.equal(fnSpy.callCount, 4, "and _createChildren was called exactly 4 times - once for the outer layout and once for each child element");
				fnDone();
			}.bind(this));
		});

		QUnit.test("when a child overlay is parented under a wrong aggregation overlay (e.g. flex move applied between two passes of _createChildrenOverlays), the next _createChildrenOverlays pass for the new model parent re-parents the overlay", async function(assert) {
			const oInnerLayoutOverlay = OverlayRegistry.getOverlay(this.oInnerLayout);
			const oOuterLayoutOverlay = OverlayRegistry.getOverlay(this.oOuterLayout);
			const oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
			const oInnerContentAggOverlay = oInnerLayoutOverlay.getAggregationOverlay("content");

			assert.strictEqual(
				oButton1Overlay.getParent(),
				oInnerContentAggOverlay,
				"precondition: button1 overlay is initially under innerLayout's content aggregation overlay"
			);

			// Emulate the race where MoveControls applies before the target parent's
			// _createChildrenOverlays pass starts: move button1 to outerLayout but keep
			// its overlay attached to innerLayout's content aggregation overlay.
			this.oInnerLayout.removeContent(this.oButton1);
			this.oOuterLayout.addContent(this.oButton1);
			oInnerContentAggOverlay.addChild(oButton1Overlay, true);

			assert.strictEqual(
				this.oButton1.getParent(),
				this.oOuterLayout,
				"after the move, button1's parent is outerLayout"
			);
			assert.strictEqual(
				oButton1Overlay.getParent(),
				oInnerContentAggOverlay,
				"but the overlay tree is stale: button1 overlay is still under innerLayout's content aggregation overlay"
			);

			// Detach (do NOT destroy — that would cascade-destroy inner and its children's
			// overlays) outerLayout's existing content aggregation overlay from outerLayout
			// so we can call _createChildrenOverlays without producing a duplicate that
			// would orphan one.
			const oOldOuterContentAggOverlay = oOuterLayoutOverlay.getAggregationOverlay("content");
			oOuterLayoutOverlay.removeAggregation("children", oOldOuterContentAggOverlay, true);

			try {
				await this.oDesignTime._createChildrenOverlays(oOuterLayoutOverlay, {}, ["content"], false, {});
				const oNewOuterContentAggOverlay = oOuterLayoutOverlay.getAggregationOverlay("content");
				assert.ok(oNewOuterContentAggOverlay, "outerLayout has a content aggregation overlay after the pass");
				assert.notStrictEqual(
					oNewOuterContentAggOverlay,
					oOldOuterContentAggOverlay,
					"and it is the newly created one"
				);
				assert.strictEqual(
					oButton1Overlay.getParent(),
					oNewOuterContentAggOverlay,
					"button1 overlay is re-parented to outerLayout's content aggregation overlay"
				);
				assert.notStrictEqual(
					oButton1Overlay.getParent(),
					oInnerContentAggOverlay,
					"and it is no longer under innerLayout's content aggregation overlay"
				);
			} catch (oError) {
				assert.notOk(oError, `no error during _createChildrenOverlays: ${oError && oError.message}`);
			} finally {
				oOldOuterContentAggOverlay.destroy();
			}
		});

		QUnit.test("when a child overlay is stale under the old parent and the child's live parent is NOT the model element (aggregation forwarding, SmartForm Combine case), the overlay is re-parented and survives destruction of the old parent overlay", async function(assert) {
			// Reproduces incident: after combining two GroupElements, a forwarded field (SmartLink)
			// overlay is left attached to the OLD GroupElement's aggregation overlay and gets
			// destroyed when that old overlay is destroyed.
			//
			// With aggregation forwarding, ElementUtil.getAggregation(parent, name) returns the field
			// although field.getParent() points at an inner wrapper, not the parent itself. We emulate
			// that here by making outerLayout's "content" aggregation report button1 as a child while
			// button1's live parent stays innerLayout.
			const oInnerLayoutOverlay = OverlayRegistry.getOverlay(this.oInnerLayout);
			const oOuterLayoutOverlay = OverlayRegistry.getOverlay(this.oOuterLayout);
			const oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
			const oInnerContentAggOverlay = oInnerLayoutOverlay.getAggregationOverlay("content");

			assert.strictEqual(
				oButton1Overlay.getParent(),
				oInnerContentAggOverlay,
				"precondition: button1 overlay is under innerLayout's content aggregation overlay"
			);
			assert.notStrictEqual(
				this.oButton1.getParent(),
				this.oOuterLayout,
				"precondition: button1's live parent is innerLayout, not outerLayout (emulated forwarding)"
			);

			// Emulate forwarding: outerLayout's content getter returns button1 even though button1's
			// live parent remains innerLayout.
			const fnOriginalGetAggregation = ElementUtil.getAggregation;
			sandbox.stub(ElementUtil, "getAggregation").callsFake(function(oElement, sAggregationName) {
				if (oElement === this.oOuterLayout && sAggregationName === "content") {
					return [this.oButton1];
				}
				return fnOriginalGetAggregation.call(ElementUtil, oElement, sAggregationName);
			}.bind(this));

			// Detach outerLayout's existing content aggregation overlay so the pass creates a fresh one
			// without producing a duplicate.
			const oOldOuterContentAggOverlay = oOuterLayoutOverlay.getAggregationOverlay("content");
			oOuterLayoutOverlay.removeAggregation("children", oOldOuterContentAggOverlay, true);

			try {
				await this.oDesignTime._createChildrenOverlays(oOuterLayoutOverlay, {}, ["content"], false, {});

				const oNewOuterContentAggOverlay = oOuterLayoutOverlay.getAggregationOverlay("content");
				assert.strictEqual(
					oButton1Overlay.getParent(),
					oNewOuterContentAggOverlay,
					"button1 overlay is re-parented to outerLayout's new content aggregation overlay despite the forwarding mismatch"
				);

				// Now the old parent's aggregation overlay is destroyed (as happens when the old
				// GroupElement overlay is destroyed after combine). The re-parented overlay must survive.
				oInnerContentAggOverlay.destroy();
				assert.ok(
					!oButton1Overlay.bIsDestroyed,
					"button1 (SmartLink) overlay survives destruction of the old parent's aggregation overlay"
				);
			} catch (oError) {
				assert.notOk(oError, `no error during _createChildrenOverlays: ${oError && oError.message}`);
			} finally {
				oOldOuterContentAggOverlay.destroy();
			}
		});

		QUnit.test("when oInnerLayout is extended by new button element without existing overlay", function(assert) {
			const fnDone = assert.async();
			let oParentOfNewOverlay;
			const oButton = new Button("button3");
			const oInnerLayoutOverlay = OverlayRegistry.getOverlay(this.oInnerLayout);

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
			const fnDone = assert.async();
			const oButton3 = new Button("button3");
			const oButton4 = new Button("button4");

			function sendDesignTimeToSyncing() {
				const oOverlayForButton3 = OverlayRegistry.getOverlay(oButton3);
				if (this.oDesignTime.getStatus() === DesignTimeStatus.SYNCED && oOverlayForButton3) {
					const oClock = sinon.useFakeTimers();
					// this will send the designTime back to 'syncing'
					this.oInnerLayout.insertAggregation("content", oButton4, 3);
					oClock.tick(0);
					oClock.restore();
					this.oDesignTime._oTaskManager.detachEvent("complete", sendDesignTimeToSyncing, this);
				}
			}

			this.oDesignTime._oTaskManager.attachEvent("complete", sendDesignTimeToSyncing, this);

			this.oDesignTime.attachEventOnce("synced", function() {
				const aInnerLayoutContent = this.oInnerLayout.getContent();
				const bChildrenHaveRegisteredOverlays = _haveChildrenRegisteredOverlays(aInnerLayoutContent);

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
			const fnDone = assert.async();
			sandbox.stub(AggregationOverlay.prototype, "isAssociation").returns(true);
			sandbox.stub(ElementUtil, "getAssociationInstances").returns([this.oButton1]);

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout1]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				const oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
				const oLayout1Overlay = OverlayRegistry.getOverlay(this.oLayout1);
				assert.ok(oButton1Overlay, "then the button overlay is still created properly");
				assert.deepEqual(oButton1Overlay.getParentElementOverlay(), oLayout1Overlay, "and it has the correct parent");
				fnDone();
			}.bind(this));
		});

		QUnit.test("when the design time is initialized", function(assert) {
			const fnDone = assert.async();

			const oSpy = sandbox.spy(DesignTime.prototype, "_createElementOverlay");

			this.oLayout1.getMetadata().loadDesignTime().then(function(mDesignTimeMetadata) {
				this.oDesignTime = new DesignTime({
					rootElements: [this.oLayout1]
				});

				this.oDesignTime.attachEventOnce("synced", async function() {
					await nextUIUpdate();

					const aSpyCalls = oSpy.getCalls();

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
			const fnDone = assert.async();

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

		QUnit.test("when 'getElementOverlays' is called, it returns all overlays from all roots matching OverlayRegistry", function(assert) {
			const aElementOverlays = this.oDesignTime.getElementOverlays();
			const aRegistryOverlays = OverlayRegistry.getOverlays().filter((oOvl) => oOvl instanceof ElementOverlay);
			assert.ok(aElementOverlays.length >= 2, "at least the two root overlays are returned");
			assert.strictEqual(
				aElementOverlays.length,
				aRegistryOverlays.length,
				"the number of overlays matches the OverlayRegistry count"
			);
			assert.ok(
				aElementOverlays.includes(OverlayRegistry.getOverlay(this.oLayout1)),
				"overlay for layout1 is included"
			);
			assert.ok(
				aElementOverlays.includes(OverlayRegistry.getOverlay(this.oLayout3)),
				"overlay for layout3 is included"
			);
			assert.notOk(
				aElementOverlays.includes(OverlayRegistry.getOverlay(this.oLayout2)),
				"overlay for layout2 (not a root) is not included"
			);
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
			const fnDone = assert.async();
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
			const fnDone = assert.async(2);
			const sErrorMessage = "some error";
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
		const oData = [];
		for (let i = 0, n = iCount; i < n; i++) {
			oData.push({ text: (sIdPrefix || "item") + i + (sIdSuffix || "-bound") });
		}
		return new JSONModel(oData);
	}

	QUnit.module("Given that the DesignTime is initialized with control including aggregation bindinding", {
		async beforeEach(assert) {
			const fnDone = assert.async();
			const oModel = getJsonModelWithData(2);
			this.oCustomListItemTemplate = new CustomListItem(
				"boundListItem",
				{ content: [new Button("boundListItem-btn", { text: "{text}" })] }
			);
			this.oBoundList = new List("boundlist").setModel(oModel);
			this.oBoundList.bindAggregation("items", {
				path: "/",
				template: this.oCustomListItemTemplate,
				templateShareable: false
			});

			// create list with unbound items
			this.oUnboundList = new List("unboundlist");
			this.oUnboundList.addItem(new CustomListItem("unboundlist-0", { content: [new Button("item1-btn", { text: "item1-unbound" })] }));
			this.oUnboundList.addItem(new CustomListItem("unboundlist-1", { content: [new Button("item2-btn", { text: "item2-unbound" })] }));

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
			{ content: [new Button("boundListItem-btn-2", { text: "{text}" })] }
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

	QUnit.module("Given a control including aggregation binding", {
		async beforeEach() {
			const oModel = getJsonModelWithData(2);
			this.oCustomListItemTemplate = new CustomListItem(
				"boundListItem",
				{ content: [new Button("boundListItem-btn", { text: "{text}" })] }
			);
			this.oBoundList = new List("boundlist").setModel(oModel);
			this.oBoundList.bindAggregation("items", {
				path: "/",
				template: this.oCustomListItemTemplate,
				templateShareable: true
			});

			// create a HorizontalLayout containing the two lists
			this.oHorizontalLayout = new HorizontalLayout("horLayout", {
				content: [this.oBoundList]
			});
			this.oHorizontalLayout.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oHorizontalLayout.destroy();
			this.oCustomListItemTemplate.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("rebind during element overlay creation", async function(assert) {
			this.oDesignTime = new DesignTime({
				rootElements: [this.oHorizontalLayout]
			});
			sandbox.stub(this.oDesignTime, "_createElementOverlay").callsFake(async function(...aArgs) {
				const oReturn = await this.oDesignTime._createElementOverlay.wrappedMethod.apply(this.oDesignTime, aArgs);
				if (aArgs[0].element === this.oBoundList) {
					this.oBoundList.bindAggregation("items", {
						path: "/",
						template: this.oCustomListItemTemplate,
						templateShareable: true
					});
				}
				return oReturn;
			}.bind(this));
			await DtUtil.waitForSynced(this.oDesignTime)();

			const oBoundListOverlay = OverlayRegistry.getOverlay(this.oBoundList);
			const aAggregationTemplateOverlays = oBoundListOverlay.getAggregationBindingTemplateOverlays();
			const aElementOverlayChildren = oBoundListOverlay.getAggregationOverlay("items").getChildren();
			assert.strictEqual(
				aAggregationTemplateOverlays.length,
				1,
				"then the aggregation overlay for the aggregation template exists"
			);
			assert.strictEqual(
				aAggregationTemplateOverlays[0].getChildren().length,
				1,
				"and has the template as child created just once"
			);
			assert.strictEqual(
				aElementOverlayChildren.length,
				2,
				"then the element overlay children are created once"
			);
			assert.strictEqual(
				aElementOverlayChildren.some((oOverlay) => oOverlay.bIsDestroyed),
				false,
				"then children overlays are not destroyed"
			);
		});

		QUnit.test("rebind element after overlay creation is finished", async function(assert) {
			this.oDesignTime = new DesignTime({
				rootElements: [this.oHorizontalLayout]
			});
			await DtUtil.waitForSynced(this.oDesignTime)();
			this.oBoundList.bindAggregation("items", {
				path: "/",
				template: this.oCustomListItemTemplate,
				templateShareable: true
			});
			await DtUtil.waitForSynced(this.oDesignTime)();
			// the binding overlay creation starts after the first designtime sync
			await DtUtil.waitForSynced(this.oDesignTime)();

			const oBoundListOverlay = OverlayRegistry.getOverlay(this.oBoundList);
			const aAggregationTemplateOverlays = oBoundListOverlay.getAggregationBindingTemplateOverlays();
			const aElementOverlayChildren = oBoundListOverlay.getAggregationOverlay("items").getChildren();
			assert.strictEqual(
				aAggregationTemplateOverlays.length,
				1,
				"then the aggregation overlay for the aggregation template exists"
			);
			assert.strictEqual(
				aAggregationTemplateOverlays[0].getChildren().length,
				1,
				"and has the template as child created just once"
			);
			assert.strictEqual(
				aElementOverlayChildren.length,
				2,
				"then the element overlay children are created once"
			);
			assert.strictEqual(
				aElementOverlayChildren.some((oOverlay) => oOverlay.bIsDestroyed),
				false,
				"then children overlays are not destroyed"
			);
		});
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
			const fnDone = assert.async();
			// create list with bound items
			const oRootModel = getJsonModelWithData(2, "outer", "");
			const oInnerModel = getJsonModelWithData(3, "inner", "");

			this.oInnerTemplate = new CustomListItem("inner-template", {
				content: [new Button("deep-button", { text: "deep" })]
			});
			this.oInnerList = new List("inner-list").setModel(oInnerModel);
			this.oInnerList.bindAggregation("items", {
				path: "/",
				template: this.oInnerTemplate,
				templateShareable: false
			});

			this.oOuterTemplate = new CustomListItem("outer-template", {
				content: [
					new Button("inner-top-button", { text: "inner-top" }),
					this.oInnerList,
					new Button("inner-bottom-button", { text: "inner-bottom" })
				]
			});

			this.oToolbar = new Toolbar("external-toolbar", {
				content: [new Button("external-button", { text: "external" })]
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
			const aOverlays = OverlayRegistry.getOverlays();
			assert.strictEqual(aOverlays.length, 55, "then 55 Overlays are created");

			const oVerticalLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
			const oOuterAggregationBindingTemplateOverlay = OverlayRegistry.getOverlay(this.oRootList).getAggregationBindingTemplateOverlays()[0];
			const oExternalListToolbarOverlay = OverlayRegistry.getOverlay(this.oRootList.getHeaderToolbar());

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
			const oTopButtonInsideOuterTemplateOverlay = OverlayRegistry.getOverlay("inner-top-button");
			const oListInsideOuterTemplateOverlay = OverlayRegistry.getOverlay("inner-list");
			const oBottomButtonInsideOuterTemplateOverlay = OverlayRegistry.getOverlay("inner-bottom-button");

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
			const oInnerTemplateOverlay = OverlayRegistry.getOverlay(this.oInnerList).getAggregationBindingTemplateOverlays()[0].getChildren()[0]; // columnListItem
			const oButtonInsideInnerTemplateOverlay = oInnerTemplateOverlay.getChildren()[0].getChildren()[0];

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
			const oFirstAggregationBindingInstanceOverlay = OverlayRegistry.getOverlay(this.oRootList.getItems()[0]);
			const oSecondAggregationBindingInstanceOverlay = OverlayRegistry.getOverlay(this.oRootList.getItems()[1]);

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
			const oFirstInstanceElement = this.oRootList.getItems()[0]; // customListItem
			const oTopButtonInsideOuterInstanceOverlay = OverlayRegistry.getOverlay(oFirstInstanceElement.getContent()[0]);
			const oListInsideOuterInstanceOverlay = OverlayRegistry.getOverlay(oFirstInstanceElement.getContent()[1]);
			const oBottomButtonInsideOuterInstanceOverlay = OverlayRegistry.getOverlay(oFirstInstanceElement.getContent()[2]);

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
			const oInnerTemplateInstanceElement = oFirstInstanceElement.getContent()[1].getItems()[0]; // [customListItem]
			const oInnerTemplateInstanceOverlay = OverlayRegistry.getOverlay(oInnerTemplateInstanceElement);
			const oButtonInsideInnerInstanceOverlay = OverlayRegistry.getOverlay(oInnerTemplateInstanceElement.getContent()[0]);

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
			const fnDone = assert.async();
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
			const oDTMetadata = this.oDesignTime.getDesignTimeMetadataFor(this.oPage);
			assert.strictEqual(oDTMetadata.testField, "testValue", "then the expected custom value is returned");
		});

		QUnit.test("when getting the metadata for sap.m.Page from DesignTime (using control name - backwards compatibility)", function(assert) {
			const spyLog = sandbox.stub(Log, "error").callsFake(function() {
				assert.equal(spyLog.callCount, 1, "an error is raised telling how the method should be called now");
			});
			const oDTMetadata = this.oDesignTime.getDesignTimeMetadataFor("sap.m.Page");
			assert.strictEqual(oDTMetadata.testField, "testValue", "but the expected custom value is returned anyway");
		});

		QUnit.test("when getting the metadata from the created overlay", function(assert) {
			const oOverlay = OverlayRegistry.getOverlay(this.oPage);
			assert.strictEqual(oOverlay.getDesignTimeMetadata().getData().testField, "testValue", "then DTMetadata from the DT is merged correctly");
			assert.strictEqual(oOverlay.getDesignTimeMetadata().getAggregation("content").domRef, ":sap-domref > section", "UI5 DTMetadata is merged correctly");
		});
	});

	QUnit.module("Given that the DesignTime is created with hidden layout", {
		async beforeEach(assert) {
			const fnDone = assert.async();
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
			const fnDone = assert.async();

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
			const fnDone = assert.async();
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
			const fnDone = assert.async();

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
				const oElementOverlay = OverlayRegistry.getOverlay("vertlay");
				const oAggregationOverlay = oElementOverlay.getAggregationOverlay("content");
				const oAggregationDtMetadata = oAggregationOverlay.getDesignTimeMetadata();
				const oAggregationData = oAggregationDtMetadata.getData();
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
			const mData = this.oMtDtFunction.propagateMetadata(this.oButton1);

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
			const fnDone = assert.async();
			const mData = this.oMtDtFunction.propagateMetadata(this.oButton2);

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
			const fnDone = assert.async();

			this.oPropagateMetadataFunctionForLayout1 = MetadataTestUtil.createPropagateMetadataObject("sap.m.Button", "layout1");
			this.oPropagateMetadataFunctionForLayout2 = MetadataTestUtil.createPropagateMetadataObject("sap.m.Button", "layout2");

			const oLayoutMetadata1 = MetadataTestUtil.buildMetadataObject(this.oPropagateMetadataFunctionForLayout1);
			const oLayoutMetadata2 = MetadataTestUtil.buildMetadataObject(this.oPropagateMetadataFunctionForLayout2);

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

	QUnit.module("On element modified - Given that the DesignTime is created for a root control", {
		async beforeEach(assert) {
			const fnDone = assert.async();

			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2");
			this.oLayout = new Panel({
				id: "layout1",
				content: [
					this.oButton1,
					this.oButton2
				]
			});
			this.oLayout.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout]
			});
			this.oDesignTime.attachEventOnce("synced", function() {
				fnDone();
			});
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oLayout.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when a new control is added to the panel content aggregation (_onAddAggregation)", function(assert) {
			const fnDone = assert.async();
			const oNewButton = new Button("newButton");
			const oUpdateRemovabilitySpy = sandbox.spy(OverlayUtil, "updateLastElementRemovability");

			this.oDesignTime.attachEventOnce("elementOverlayAdded", function(oEvent) {
				const oNewButtonOverlay = OverlayRegistry.getOverlay(oNewButton);
				assert.ok(oNewButtonOverlay, "then an overlay is created for the new button");
				assert.deepEqual(
					oEvent.getParameters(),
					{
						id: oNewButtonOverlay.getId(),
						targetAggregation: "content",
						targetId: oNewButtonOverlay.getParentAggregationOverlay().getId(),
						targetIndex: 2
					},
					"then event 'elementOverlayAdded' was fired with the correct parameters"
				);
				assert.deepEqual(
					oUpdateRemovabilitySpy.lastCall.args[0],
					{
						type: "add",
						element: oNewButton,
						parentElement: this.oLayout,
						aggregationName: "content",
						designTime: this.oDesignTime
					},
					"then OverlayUtil.updateLastElementRemovability was called with correct parameters"
				);
				fnDone();
			}.bind(this));

			this.oLayout.addContent(oNewButton);
		});

		QUnit.test("when an existing control is moved within the panel content aggregation (_onAddAggregation for move)", function(assert) {
			const fnDone = assert.async();
			const oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);

			this.oDesignTime.attachEventOnce("elementOverlayMoved", function(oEvent) {
				assert.deepEqual(
					oEvent.getParameters(),
					{
						id: oButton1Overlay.getId(),
						targetAggregation: "content",
						targetId: oButton1Overlay.getParentAggregationOverlay().getId(),
						targetIndex: 1
					},
					"then event 'elementOverlayMoved' was fired with the correct parameters"
				);
				fnDone();
			});

			// Move button1 to the end (after button2)
			this.oLayout.removeContent(this.oButton1);
			this.oLayout.addContent(this.oButton1);
		});

		QUnit.test("when a control is removed from the panel content aggregation (_onRemoveAggregation)", function(assert) {
			const fnDone = assert.async();
			const oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
			const sButton1OverlayId = oButton1Overlay.getId();
			const oUpdateRemovabilitySpy = sandbox.spy(OverlayUtil, "updateLastElementRemovability");

			this.oDesignTime.attachEventOnce("elementOverlayDestroyed", function(oEvent) {
				assert.strictEqual(
					oEvent.getParameter("elementOverlay").getId(),
					sButton1OverlayId,
					"then event 'elementOverlayDestroyed' was fired for the removed button"
				);
				assert.deepEqual(
					oUpdateRemovabilitySpy.lastCall.args[0],
					{
						type: "remove",
						element: this.oButton1,
						parentElement: this.oLayout,
						aggregationName: "content",
						designTime: this.oDesignTime
					},
					"then OverlayUtil.updateLastElementRemovability was called with correct parameters"
				);
				fnDone();
				this.oButton1.destroy();
			}.bind(this));

			this.oLayout.removeContent(this.oButton1);
		});

		QUnit.test("when a control visibility is set to false (_onPropertyChanged)", function(assert) {
			const fnDone = assert.async();
			const oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
			const oExpectedResponse = {
				id: oButton1Overlay.getId(),
				name: "visible",
				oldValue: true,
				value: false
			};
			const oUpdateRemovabilitySpy = sandbox.spy(OverlayUtil, "updateLastElementRemovability");

			this.oDesignTime.attachEventOnce("elementPropertyChanged", function(oEvent) {
				assert.deepEqual(
					oEvent.getParameters(),
					oExpectedResponse,
					"then event 'elementPropertyChanged' was fired with the correct parameters when setting visible to false"
				);
				assert.deepEqual(
					oUpdateRemovabilitySpy.lastCall.args[0],
					{
						type: "remove",
						element: this.oButton1,
						parentElement: this.oLayout,
						aggregationName: "content",
						designTime: this.oDesignTime
					},
					"then OverlayUtil.updateLastElementRemovability was called with type 'remove'"
				);
				fnDone();
			}.bind(this));

			this.oButton1.setVisible(false);
		});

		QUnit.test("when a control visibility is set to true after being hidden (_onPropertyChanged)", function(assert) {
			const fnDone = assert.async();
			const oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);

			// First set to false
			this.oButton1.setVisible(false);

			const oExpectedResponse = {
				id: oButton1Overlay.getId(),
				name: "visible",
				oldValue: false,
				value: true
			};
			const oUpdateRemovabilitySpy = sandbox.spy(OverlayUtil, "updateLastElementRemovability");

			this.oDesignTime.attachEventOnce("elementPropertyChanged", function(oEvent) {
				assert.deepEqual(
					oEvent.getParameters(),
					oExpectedResponse,
					"then event 'elementPropertyChanged' was fired with the correct parameters when setting visible to true"
				);
				assert.deepEqual(
					oUpdateRemovabilitySpy.lastCall.args[0],
					{
						type: "add",
						element: this.oButton1,
						parentElement: this.oLayout,
						aggregationName: "content",
						designTime: this.oDesignTime
					},
					"then OverlayUtil.updateLastElementRemovability was called with type 'add'"
				);
				fnDone();
			}.bind(this));

			this.oButton1.setVisible(true);
		});

		QUnit.test("when multiple controls visibility is toggled (_onPropertyChanged)", function(assert) {
			const fnDone = assert.async();
			const oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
			const oButton2Overlay = OverlayRegistry.getOverlay(this.oButton2);
			const aExpectedEvents = [
				{
					id: oButton1Overlay.getId(),
					name: "visible",
					oldValue: true,
					value: false
				},
				{
					id: oButton2Overlay.getId(),
					name: "visible",
					oldValue: true,
					value: false
				}
			];
			let iEventCount = 0;

			this.oDesignTime.attachEvent("elementPropertyChanged", function(oEvent) {
				assert.deepEqual(
					oEvent.getParameters(),
					aExpectedEvents[iEventCount],
					`then event 'elementPropertyChanged' was fired with the correct parameters for button ${iEventCount + 1}`
				);
				iEventCount++;
				if (iEventCount === 2) {
					fnDone();
				}
			});

			this.oButton1.setVisible(false);
			this.oButton2.setVisible(false);
		});

		QUnit.test("when a control is added and then removed from the panel (_onAddAggregation, _onRemoveAggregation)", function(assert) {
			const fnDone = assert.async();
			const oNewButton = new Button("tempButton");

			this.oDesignTime.attachEventOnce("elementOverlayAdded", function() {
				const oNewButtonOverlay = OverlayRegistry.getOverlay(oNewButton);
				assert.ok(oNewButtonOverlay, "then an overlay is created for the new button");

				this.oDesignTime.attachEventOnce("elementOverlayDestroyed", function(oEvent) {
					assert.strictEqual(
						oEvent.getParameter("elementOverlay").getElement(),
						oNewButton,
						"then event 'elementOverlayDestroyed' was fired for the removed button"
					);
					oNewButton.destroy();
					fnDone();
				});

				this.oLayout.removeContent(oNewButton);
			}.bind(this));

			this.oLayout.addContent(oNewButton);
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
			const oButton = new Button();
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
			const sButtonId = "test-button";
			const oButton1 = new Button(sButtonId);
			let oButton2;
			let sFirstOverlayId;
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
			const oButton = new Button();
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
			const fnDone = assert.async();
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
			const fnDone = assert.async();
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
			const fnDone = assert.async();
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
			const fnDone = assert.async();
			const oButton = new Button();
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
			const fnDone = assert.async();
			const oModel = new JSONModel({
				texts: [{}, {}, {}] // this will create 3 horizontal layouts in items aggregation of VerticalLayout
			});

			const oVerticalLayout = new VerticalLayout({
				content: {
					path: "/texts",
					template: new HorizontalLayout({
						content: []
					})
				}
			});

			oVerticalLayout.setModel(oModel);

			const oButton = new Button("ManualButton");
			const oManualItem = new HorizontalLayout({
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
			const oButton = new Button();
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
			const oButton = new Button();
			let fnResolveLoadDesigntime;

			sandbox.stub(ManagedObjectMetadata.prototype, "loadDesignTime").callsFake(function() {
				return new Promise(function(fnResolve) {
					fnResolveLoadDesigntime = fnResolve;
				});
			});

			oButton.placeAt("qunit-fixture");
			await nextUIUpdate();

			const oPromise1 = this.oDesignTime.createOverlay(oButton);
			const oPromise2 = this.oDesignTime.createOverlay(oButton);

			assert.ok(oPromise1 === oPromise2, "then second promise is exactly the same");

			const oPromiseAll = Promise.all([oPromise1, oPromise2]).then(function(aElementOverlays) {
				assert.strictEqual(aElementOverlays[0].getId(), aElementOverlays[1].getId(), "then created element overlays are the same");
				oButton.destroy();
			});

			fnResolveLoadDesigntime({});
			return oPromiseAll;
		});

		QUnit.test("when called second time for the same control while the first creation is still in the progress", async function(assert) {
			const fnDone = assert.async(2);
			let oButton1;
			let oButton2;
			const oLayout = new VerticalLayout({
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
			const oButton = new Button();

			oButton.placeAt("qunit-fixture");
			await nextUIUpdate();

			return this.oDesignTime.createOverlay(oButton).then(function(oElementOverlay) {
				assert.ok(oElementOverlay, "then the overlay is created");
				assert.ok(oElementOverlay.getIsRoot(), "then  isRoot property automatically set to true");
				oButton.destroy();
			});
		});

		QUnit.test("when an overlay is created and event elementOverlayCreated is triggered", async function(assert) {
			const oButton = new Button();
			const fnElementOverlayCreatedSpy = sandbox.spy();

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
			const oButton = new Button();
			oButton.placeAt("qunit-fixture");
			await nextUIUpdate();

			return this.oDesignTime.createOverlay(oButton).then(function(oElementOverlay) {
				assert.ok(oElementOverlay, "then the overlay is created");
				assert.strictEqual(OverlayRegistry.getOverlay(oButton), oElementOverlay, "element overlay is registered and exactly the same as returned into the promise");
				oButton.destroy();
			});
		});

		QUnit.test("when an element is destroyed while creating its children", async function(assert) {
			const fnDone = assert.async();
			const oLayout = new VerticalLayout();
			const oButton = new Button();
			oLayout.addContent(oButton);

			sandbox.stub(DesignTime.prototype, "_createChildren").callsFake(function() {
				oLayout.destroy();
				return Promise.resolve();
			});

			const fnElementOverlayCreatedSpy = sandbox.spy();
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
			const fnDone = assert.async();

			const oLayout = new VerticalLayout();
			const oButton = new Button();
			oLayout.addContent(oButton);
			let oContentAggregtionOverlay;

			const fnElementOverlayCreatedSpy = sandbox.spy();
			this.oDesignTime.attachEventOnce("elementOverlayCreated", fnElementOverlayCreatedSpy);
			const fnElementOverlayDestroyedSpy = sandbox.spy();
			this.oDesignTime.attachEventOnce("elementOverlayDestroyed", fnElementOverlayDestroyedSpy);

			const fnRegisterOriginal = OverlayRegistry.register;
			sandbox.stub(OverlayRegistry, "register").callsFake(function(oOverlay) {
				if (oOverlay instanceof AggregationOverlay && oOverlay.getElement() === oLayout) {
					oContentAggregtionOverlay = oOverlay;
				}
				fnRegisterOriginal(oOverlay);
			});

			const fnCreateOverlayOriginal = this.oDesignTime.createOverlay;
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
			const fnDone = assert.async();

			sandbox.stub(ElementOverlay.prototype, "asyncInit").callsFake(function() {
				throw new Error("some unexpected error");
			});

			const oButton = new Button();

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
			const fnDone = assert.async();

			const oButton = new Button();
			const someError = new Error("some error occurred");
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
			const fnDone = assert.async();
			const oButton = new Button();

			// Simulate control is being destroyed
			sandbox.stub(ManagedObjectMetadata.prototype, "loadDesignTime").callsFake(function() {
				oButton.destroy();
				return Promise.resolve({});
			});

			const fnElementOverlayCreatedSpy = sinon.spy();
			const fnElementOverlayDestroyedSpy = sinon.spy();
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
			const oButton = new Button();
			const oPanel = new Panel({
				content: [oButton]
			});

			sandbox.stub(Log, "error");
			sandbox.stub(ManagedObjectMetadata.prototype, "loadDesignTime").callsFake(function() {
				this.oDesignTime.destroy();
				return Promise.resolve({});
			}.bind(this));

			const fnElementOverlayCreatedSpy = sandbox.spy();
			this.oDesignTime.attachEventOnce("elementOverlayCreated", fnElementOverlayCreatedSpy);
			const fnElementOverlayDestroyedSpy = sandbox.spy();
			this.oDesignTime.attachEventOnce("elementOverlayDestroyed", fnElementOverlayDestroyedSpy);

			oPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
			try {
				await this.oDesignTime.createOverlay(oPanel);
			} catch (oError) {
				assert.ok(Log.error.notCalled, "then the error must not be raised");
				assert.ok(true, "promise is rejected");
				assert.ok(oError instanceof Error, "proper rejection reason is provided");
				assert.ok(
					oError.toString().indexOf("while creating overlay, DesignTime instance has been destroyed") !== -1,
					"proper rejection reason is provided"
				);
				assert.notOk(OverlayRegistry.getOverlay(oButton), "no overlay for Button is registered");
				assert.notOk(fnElementOverlayCreatedSpy.called, "then event 'elementOverlayCreated' is not called");
				assert.notOk(fnElementOverlayDestroyedSpy.called, "then event 'elementOverlayDestroyed' is not called");
				oPanel.destroy();
			}
		});

		QUnit.test("when an overlay with actionsFromResponsibleElement is created", function(assert) {
			const oButton1 = new Button("button1");
			const oLayout = new VerticalLayout("layout1", {
				content: [
					oButton1
				]
			});
			const oButton2 = new Button("button2");
			const oLayout2 = new VerticalLayout("layout2", {
				content: [
					oButton2
				]
			});
			let oNewDesigntime = {};
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
			const fnDone = assert.async();
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
			const fnDone = assert.async();
			const oButton = new Button({ text: "New Button" });
			let fnMetadataResolve;

			sandbox.stub(ManagedObjectMetadata.prototype, "loadDesignTime").callsFake(function() {
				return new Promise(function(fnResolve) {
					fnMetadataResolve = fnResolve;
				});
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				const oElementOverlay = OverlayRegistry.getOverlay(oButton);
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
			const fnDone = assert.async();
			const oToolHooksPlugin = new ToolHooks();
			const oElementOverlayCreatedSpy = sandbox.spy();
			const oRegisterElementOverlaySpy = sandbox.stub(oToolHooksPlugin, "registerElementOverlay")
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
			const fnDone = assert.async();
			const oToolHooksPlugin = new ToolHooks();
			const oRegisterElementOverlaySpy = sandbox.spy(oToolHooksPlugin, "registerElementOverlay");
			const oElementOverlayCreatedSpy = sandbox.spy();
			const oElementOverlayDestroyedSpy = sandbox.spy();

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
			const oToolHooksPlugin = new ToolHooks();
			const oRegisterElementOverlaySpy = sandbox.spy(oToolHooksPlugin, "registerElementOverlay");
			const oElementOverlayCreatedSpy = sandbox.spy();
			const oElementOverlayDestroyedSpy = sandbox.spy();

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

	QUnit.module("Given a DesignTime with stale overlay detection", {
		async beforeEach() {
			this.oButton1 = new Button({ text: "Button1" });
			this.oButton2 = new Button({ text: "Button2" });
			this.oInnerLayout = new VerticalLayout("stale-inner", {
				content: [this.oButton1, this.oButton2]
			});
			this.oOuterLayout = new VerticalLayout("stale-outer", {
				content: [this.oInnerLayout]
			});
			this.oOuterLayout.placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oOuterLayout]
			});
			await DtUtil.waitForSynced(this.oDesignTime)();
		},
		afterEach() {
			this.oDesignTime.destroy();
			this.oOuterLayout.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when _addAggregation encounters a stale overlay (overlay empty, element has children)", async function(assert) {
			const oInnerOverlay = OverlayRegistry.getOverlay(this.oInnerLayout);

			const oContentAgg = oInnerOverlay.getAggregationOverlay("content");
			assert.strictEqual(oContentAgg.getChildren().length, 2, "initially the content agg overlay has 2 children");

			oContentAgg.getChildren().slice().forEach((oChild) => oChild.destroy());
			assert.strictEqual(oContentAgg.getChildren().length, 0, "after simulation, content agg overlay has 0 children");
			assert.strictEqual(
				ElementUtil.getAggregation(this.oInnerLayout, "content").length,
				2,
				"but element still has 2 content children"
			);

			const oOuterOverlay = OverlayRegistry.getOverlay(this.oOuterLayout);
			const oParentAggOverlay = oOuterOverlay.getAggregationOverlay("content");

			this.oDesignTime._addAggregation(this.oInnerLayout, oParentAggOverlay);
			await DtUtil.waitForSynced(this.oDesignTime)();

			const oNewOverlay = OverlayRegistry.getOverlay(this.oInnerLayout);
			assert.ok(oNewOverlay, "then the inner layout has a new overlay");
			assert.notStrictEqual(oNewOverlay, oInnerOverlay, "then it is a different overlay instance");
			const oNewContentAgg = oNewOverlay.getAggregationOverlay("content");
			assert.ok(oNewContentAgg, "then the new content aggregation overlay exists");
			assert.strictEqual(
				oNewContentAgg.getChildren().length,
				2,
				"then the recreated overlay has both button children"
			);
		});

		QUnit.test("when _addAggregation encounters a stale overlay (overlay has children, element is empty)", async function(assert) {
			const oInnerOverlay = OverlayRegistry.getOverlay(this.oInnerLayout);

			const oContentAgg = oInnerOverlay.getAggregationOverlay("content");
			assert.strictEqual(oContentAgg.getChildren().length, 2, "initially the content agg overlay has 2 children");

			this.oInnerLayout.removeAllContent();
			assert.strictEqual(
				ElementUtil.getAggregation(this.oInnerLayout, "content").length,
				0,
				"element has no content children"
			);
			assert.strictEqual(oContentAgg.getChildren().length, 2, "but overlay still has 2 children");

			const oOuterOverlay = OverlayRegistry.getOverlay(this.oOuterLayout);
			const oParentAggOverlay = oOuterOverlay.getAggregationOverlay("content");

			this.oDesignTime._addAggregation(this.oInnerLayout, oParentAggOverlay);
			await DtUtil.waitForSynced(this.oDesignTime)();

			const oNewOverlay = OverlayRegistry.getOverlay(this.oInnerLayout);
			assert.ok(oNewOverlay, "then the inner layout has a new overlay");
			assert.notStrictEqual(oNewOverlay, oInnerOverlay, "then it is a different overlay instance");
			const oNewContentAgg = oNewOverlay.getAggregationOverlay("content");
			assert.ok(oNewContentAgg, "then the new content aggregation overlay exists");
			assert.strictEqual(
				oNewContentAgg.getChildren().length,
				0,
				"then the recreated overlay has no children (matching the element)"
			);
		});

		QUnit.test("when _addAggregation encounters a healthy overlay it does not recreate it", async function(assert) {
			const oInnerOverlay = OverlayRegistry.getOverlay(this.oInnerLayout);
			const oOuterOverlay = OverlayRegistry.getOverlay(this.oOuterLayout);
			const oParentAggOverlay = oOuterOverlay.getAggregationOverlay("content");

			this.oDesignTime._addAggregation(this.oInnerLayout, oParentAggOverlay);
			await DtUtil.waitForSynced(this.oDesignTime)();

			const oCurrentOverlay = OverlayRegistry.getOverlay(this.oInnerLayout);
			assert.strictEqual(oCurrentOverlay, oInnerOverlay, "then the overlay was not recreated");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});