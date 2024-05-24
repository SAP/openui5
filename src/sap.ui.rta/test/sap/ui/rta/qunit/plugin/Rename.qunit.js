/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/ScrollContainer",
	"sap/ui/core/EventBus",
	"sap/ui/core/Lib",
	"sap/ui/core/Title",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/OverlayUtil",
	"sap/ui/dt/DOMUtil",
	"sap/ui/events/KeyCodes",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormLayout",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/plugin/RenameHandler",
	"sap/ui/rta/plugin/Rename",
	"sap/ui/rta/plugin/Selection",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/qunit/QUnitUtils",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	Button,
	Label,
	ScrollContainer,
	EventBus,
	Lib,
	Title,
	DesignTime,
	OverlayRegistry,
	OverlayUtil,
	DOMUtil,
	KeyCodes,
	ChangesWriteAPI,
	FormContainer,
	FormLayout,
	Form,
	VerticalLayout,
	nextUIUpdate,
	CommandFactory,
	Plugin,
	RenameHandler,
	RenamePlugin,
	SelectionPlugin,
	Utils,
	jQuery,
	sinon,
	QUnitUtils,
	RtaQunitUtils
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	var oResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");

	function triggerAndWaitForStartEdit(oPlugin, oOverlay) {
		return new Promise(function(resolve) {
			EventBus.getInstance().subscribeOnce("sap.ui.rta", "plugin.Rename.startEdit", function() {
				resolve();
			});
			oPlugin.startEdit(oOverlay);
		});
	}

	function triggerAndWaitForStopEdit(oPlugin) {
		return new Promise(function(resolve) {
			EventBus.getInstance().subscribeOnce("sap.ui.rta", "plugin.Rename.stopEdit", function() {
				resolve();
			});
			triggerEventOnEditableField(oPlugin, KeyCodes.ENTER);
		});
	}

	function triggerEventOnEditableField(oPlugin, sKeyCode) {
		sKeyCode ||= KeyCodes.ENTER;
		var oEvent = new Event("keydown");
		oEvent.keyCode = sKeyCode;
		oPlugin._oEditableField.dispatchEvent(oEvent);
	}

	function addResponsibleElement(oDesignTimeMetadata, oTargetElement, oResponsibleElement) {
		Object.assign(oDesignTimeMetadata.getData().actions, {
			getResponsibleElement(oElement) {
				if (oElement === oTargetElement) {
					return oResponsibleElement;
				}
			},
			actionsFromResponsibleElement: ["rename"]
		});
	}

	function addValidators(oDesignTimeMetadata, aValidator) {
		Object.assign(oDesignTimeMetadata.getData().actions.rename, {
			validators: aValidator
		});
	}

	QUnit.module("Given a designTime and rename plugin are instantiated using a form", {
		async beforeEach(assert) {
			var done = assert.async();

			sandbox.stub(ChangesWriteAPI, "getChangeHandler").resolves();
			const oCommandFactory = new CommandFactory();
			this.oRenamePlugin = new RenamePlugin({
				commandFactory: oCommandFactory
			});
			const oSelectionPlugin = new SelectionPlugin({
				commandFactory: oCommandFactory
			});
			this.oFormContainer0 = new FormContainer("formContainer0", {});
			this.oFormContainer = new FormContainer("formContainer", {
				title: new Title("title", {
					text: "title"
				})
			});
			this.oForm = new Form("form", {
				formContainers: [this.oFormContainer0, this.oFormContainer],
				layout: new FormLayout({
				})
			});
			this.oVerticalLayout = new VerticalLayout({
				content: [this.oForm]
			}).placeAt("qunit-fixture");

			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oForm],
				plugins: [this.oRenamePlugin, oSelectionPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oFormOverlay = OverlayRegistry.getOverlay(this.oForm);
				this.oFormContainerOverlay0 = OverlayRegistry.getOverlay(this.oFormContainer0);
				this.oFormContainerOverlay0.setSelectable(true);
				this.oFormContainerOverlay = OverlayRegistry.getOverlay(this.oFormContainer);
				this.oFormContainerOverlay.setSelectable(true);
				done();
			}, this);
		},
		afterEach() {
			sandbox.restore();
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("when _onDesignTimeSelectionChange is called", function(assert) {
			var aSelection = [this.oFormContainerOverlay];
			var oEvent = {
				getParameter() {
					return aSelection;
				}
			};

			RenameHandler._onDesignTimeSelectionChange.call(this.oRenamePlugin, oEvent);

			assert.strictEqual(aSelection, this.oRenamePlugin._aSelection, "then the arrays of selection are equal");
			assert.strictEqual(this.oRenamePlugin._aSelection.length, 1, "then the array of selection has only one selected overlay");
		});

		QUnit.test("when the rename is triggered via double click", function(assert) {
			const fnDone = assert.async();

			// Simulate that editableByPlugin was not evaluated yet
			const oEditableByPluginStub = sandbox.stub(this.oRenamePlugin, "_isEditableByPlugin").returns(undefined);
			sandbox.stub(this.oRenamePlugin, "evaluateEditable").callsFake(() => {
				assert.ok(true, "then the evaluateEditable function is called");
				oEditableByPluginStub.restore();
				return Promise.resolve();
			});

			sandbox.stub(this.oRenamePlugin, "startEdit").callsFake((oOverlay) => {
				assert.strictEqual(
					oOverlay,
					this.oFormContainerOverlay,
					"then the startEdit function is called with the correct overlay"
				);
				fnDone();
			});

			// Simulate a realistic human-user double click
			QUnitUtils.triggerEvent("click", this.oFormContainerOverlay.getDomRef());
			setTimeout(() => {
				QUnitUtils.triggerEvent("click", this.oFormContainerOverlay.getDomRef());
			}, 50);
		});

		QUnit.test("when the renamed element is destroyed", function(assert) {
			sandbox.stub(this.oRenamePlugin, "getResponsibleElementOverlay").callsFake((oElementOverlay) => {
				// If the element of the overlay doesn't exist anymore
				// control-specific logic in the designtime might break
				assert.ok(
					oElementOverlay.getElement(),
					"then responsible element checks must not be executed for overlays of destroyed elements"
				);
			});
			QUnitUtils.triggerEvent("click", this.oFormContainerOverlay.getDomRef());
			this.oFormContainer.destroy();
		});

		QUnit.test("when _isEditable is called", function(assert) {
			this.oFormContainerOverlay.setDesignTimeMetadata({
				actions: {
					rename: {
						changeType: "renameGroup",
						domRef(oFormContainer) {
							return oFormContainer.getRenderedDomRef().querySelector(".sapUiFormTitle");
						}
					}
				}
			});
			this.oRenamePlugin.deregisterElementOverlay(this.oFormContainerOverlay);
			this.oRenamePlugin.registerElementOverlay(this.oFormContainerOverlay);

			return this.oRenamePlugin._isEditable(this.oFormContainerOverlay)
			.then(function(bEditable) {
				assert.strictEqual(bEditable, true, "then the overlay is editable");
				assert.strictEqual(this.oRenamePlugin.isAvailable([this.oFormContainerOverlay]), true, "then rename is available for the overlay");
			}.bind(this));
		});

		QUnit.test("when _isEditable is called, rename has changeOnRelevantContainer true and the Form does not have a stable id", function(assert) {
			this.oFormContainerOverlay.setDesignTimeMetadata({
				actions: {
					rename: {
						changeType: "renameGroup",
						changeOnRelevantContainer: true
					}
				}
			});
			this.oRenamePlugin.deregisterElementOverlay(this.oFormContainerOverlay);
			this.oRenamePlugin.registerElementOverlay(this.oFormContainerOverlay);

			sandbox.stub(this.oRenamePlugin, "hasStableId").callsFake(function(oOverlay) {
				if (oOverlay === this.oFormOverlay) {
					return false;
				}
				return true;
			}.bind(this));

			sandbox.stub(this.oFormContainerOverlay, "getRelevantContainer").returns(this.oForm);

			return this.oRenamePlugin._isEditable(this.oFormContainerOverlay)
			.then(function(bEditable) {
				assert.strictEqual(bEditable, false, "then the overlay is not editable");
			});
		});

		QUnit.test("when isAvailable and isEnabled (returning function) are called", function(assert) {
			var done = assert.async();
			var oDesignTimeMetadata = {
				actions: {
					rename: {
						changeType: "renameGroup",
						isEnabled(oFormContainer) {
							return !(oFormContainer.getToolbar() || !oFormContainer.getTitle());
						},
						domRef(oFormContainer) {
							return oFormContainer.getRenderedDomRef().querySelector(".sapUiFormTitle");
						}
					}
				}
			};
			this.oFormContainerOverlay.setDesignTimeMetadata(oDesignTimeMetadata);
			this.oFormContainerOverlay0.setDesignTimeMetadata(oDesignTimeMetadata);

			this.oDesignTime.attachEventOnce("synced", function() {
				assert.strictEqual(this.oRenamePlugin.isAvailable([this.oFormContainerOverlay0]), true, "then rename is available for the overlay");
				assert.strictEqual(this.oRenamePlugin.isEnabled([this.oFormContainerOverlay0]), false, "then rename is not enabled for the overlay");
				assert.strictEqual(this.oRenamePlugin.isAvailable([this.oFormContainerOverlay]), true, "then rename is available for the overlay");
				assert.strictEqual(this.oRenamePlugin.isEnabled([this.oFormContainerOverlay]), true, "then rename is enabled for the overlay");
				this.oRenamePlugin._isEditable(this.oFormContainerOverlay)
				.then(function(bEditable) {
					assert.strictEqual(bEditable, true, "then rename is editable for the overlay");
					done();
				});
			}.bind(this));

			this.oRenamePlugin.deregisterElementOverlay(this.oFormContainerOverlay0);
			this.oRenamePlugin.deregisterElementOverlay(this.oFormContainerOverlay);
			this.oRenamePlugin.registerElementOverlay(this.oFormContainerOverlay0);
			this.oRenamePlugin.registerElementOverlay(this.oFormContainerOverlay);
		});

		QUnit.test("when isAvailable and isEnabled (returning boolean) are called", function(assert) {
			var done = assert.async();
			var oDesignTimeMetadata = {
				actions: {
					rename(oFormContainer) {
						return {
							changeType: "renameGroup",
							isEnabled: !(oFormContainer.getToolbar() || !oFormContainer.getTitle()),
							domRef(oFormContainer) {
								return oFormContainer.getRenderedDomRef().querySelector(".sapUiFormTitle");
							}
						};
					}
				}
			};
			this.oFormContainerOverlay.setDesignTimeMetadata(oDesignTimeMetadata);
			this.oFormContainerOverlay0.setDesignTimeMetadata(oDesignTimeMetadata);

			this.oDesignTime.attachEventOnce("synced", function() {
				assert.strictEqual(this.oRenamePlugin.isAvailable([this.oFormContainerOverlay0]), true, "then rename is available for the overlay");
				assert.strictEqual(this.oRenamePlugin.isEnabled([this.oFormContainerOverlay0]), false, "then rename is not enabled for the overlay");
				assert.strictEqual(this.oRenamePlugin.isAvailable([this.oFormContainerOverlay]), true, "then rename is available for the overlay");
				assert.strictEqual(this.oRenamePlugin.isEnabled([this.oFormContainerOverlay]), true, "then rename is enabled for the overlay");
				this.oRenamePlugin._isEditable(this.oFormContainerOverlay)
				.then(function(bEditable) {
					assert.strictEqual(bEditable, true, "then rename is editable for the overlay");
					done();
				});
			}.bind(this));

			this.oRenamePlugin.deregisterElementOverlay(this.oFormContainerOverlay0);
			this.oRenamePlugin.deregisterElementOverlay(this.oFormContainerOverlay);
			this.oRenamePlugin.registerElementOverlay(this.oFormContainerOverlay0);
			this.oRenamePlugin.registerElementOverlay(this.oFormContainerOverlay);
		});

		QUnit.test("when retrieving the context menu item", async function(assert) {
			let bIsAvailable = true;
			sandbox.stub(this.oRenamePlugin, "isAvailable").callsFake(function(aElementOverlays) {
				assert.equal(
					aElementOverlays[0],
					this.oFormContainerOverlay,
					"the 'available' function calls isAvailable with the correct overlay"
				);
				return bIsAvailable;
			}.bind(this));
			sandbox.stub(this.oRenamePlugin, "startEdit").callsFake(function(oOverlay) {
				assert.deepEqual(oOverlay, this.oFormContainerOverlay, "the 'startEdit' method is called with the right overlay");
			}.bind(this));
			sandbox.stub(this.oRenamePlugin, "isEnabled").callsFake(function(aElementOverlays) {
				assert.equal(
					aElementOverlays[0],
					this.oFormContainerOverlay,
					"the 'enabled' function calls isEnabled with the correct overlay"
				);
			}.bind(this));

			const aMenuItems = await this.oRenamePlugin.getMenuItems([this.oFormContainerOverlay]);
			assert.equal(aMenuItems[0].id, "CTX_RENAME", "'getMenuItems' returns the context menu item for the plugin");

			this.oFormContainerOverlay.setSelected(true);
			aMenuItems[0].handler([this.oFormContainerOverlay]);
			aMenuItems[0].enabled([this.oFormContainerOverlay]);

			bIsAvailable = false;
			assert.equal(
				(await this.oRenamePlugin.getMenuItems([this.oFormContainerOverlay])).length,
				0,
				"and if plugin is not available for the overlay, no menu items are returned"
			);
		});

		QUnit.test("when isAvailable and isEnabled are called without designTime", function(assert) {
			this.oFormContainerOverlay.setDesignTimeMetadata({});
			this.oRenamePlugin.deregisterElementOverlay(this.oFormContainerOverlay);
			this.oRenamePlugin.registerElementOverlay(this.oFormContainerOverlay);

			assert.strictEqual(this.oRenamePlugin.isAvailable([this.oFormContainerOverlay]), false, "then rename is not available for the overlay");
			assert.strictEqual(this.oRenamePlugin.isEnabled([this.oFormContainerOverlay]), false, "then rename is not enabled for the overlay");

			return Promise.resolve()
			.then(this.oRenamePlugin._isEditable.bind(this.oRenamePlugin, this.oFormContainerOverlay))
			.then(function(bEditable) {
				assert.strictEqual(bEditable, false, "then rename is not editable for the overlay");
			});
		});

		QUnit.test("when isEnabled are called with designTime with a domRef function pointing to nothing", function(assert) {
			sandbox.stub(this.oFormContainerOverlay.getDesignTimeMetadata(), "getAssociatedDomRef").callsFake(function() {
				return jQuery();
			});
			this.oRenamePlugin.deregisterElementOverlay(this.oFormContainerOverlay);
			this.oRenamePlugin.registerElementOverlay(this.oFormContainerOverlay);

			assert.strictEqual(this.oRenamePlugin.isEnabled([this.oFormContainerOverlay]), false, "then rename is not enabled for the overlay");
		});

		QUnit.test("when deregister is called", function(assert) {
			var oSuperDeregisterSpy = sandbox.spy(Plugin.prototype, "deregisterElementOverlay");
			this.oRenamePlugin.deregisterElementOverlay(this.oFormContainerOverlay);
			assert.strictEqual(oSuperDeregisterSpy.callCount, 1, "the super class was called");
		});
	});

	QUnit.module("Given a designTime and rename plugin are instantiated using a VerticalLayout", {
		async beforeEach(assert) {
			var done = assert.async();

			this.oRenamePlugin = new RenamePlugin({
				commandFactory: new CommandFactory()
			});

			this.oShowMessageBoxStub = sandbox.stub(Utils, "showMessageBox").resolves();

			this.oButton = new Button({text: "Button", id: "button"});
			this.oLabel = new Label({text: "Label", id: "label"});
			this.oInnerButton = new Button({text: "innerButton", id: "innerButton"});
			this.oInnerVerticalLayout = new VerticalLayout({
				id: "innerLayout",
				content: [this.oInnerButton],
				width: "400px"
			});
			this.oScrollContainer = new ScrollContainer({
				id: "scrollContainer",
				width: "100px",
				content: [this.oInnerVerticalLayout]
			});
			this.oVerticalLayout = new VerticalLayout({
				id: "layout",
				content: [this.oButton, this.oLabel, this.oScrollContainer],
				width: "200px"
			}).placeAt("qunit-fixture");
			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVerticalLayout],
				plugins: [this.oRenamePlugin],
				designTimeMetadata: {
					"sap.ui.layout.VerticalLayout": {
						actions: {
							rename: {
								changeType: "renameField",
								domRef: function() {
									return this.oLabel.getDomRef();
								}.bind(this)
							}
						}
					}
				}
			});

			this.oDesignTime.attachEventOnce("synced", async function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				this.oLabelOverlay = OverlayRegistry.getOverlay(this.oLabel);
				this.oInnerButtonOverlay = OverlayRegistry.getOverlay(this.oInnerButton);
				this.oScrollContainerOverlay = OverlayRegistry.getOverlay(this.oScrollContainer);
				this.oLayoutOverlay.setSelectable(true);

				await nextUIUpdate();

				done();
			}.bind(this));
		},
		afterEach() {
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the Label gets renamed", function(assert) {
			return triggerAndWaitForStartEdit(this.oRenamePlugin, this.oLayoutOverlay).then(function() {
				assert.ok(this.oLayoutOverlay.getSelected(), "then the overlay is still selected");
				assert.deepEqual(
					DOMUtil.getOffset(this.oRenamePlugin._oEditableField),
					DOMUtil.getOffset(this.oRenamePlugin._oEditableControlDomRef),
					"then the editable field for rename is positioned correctly"
				);
				this.oRenamePlugin.stopEdit(this.oLayoutOverlay);
				assert.ok(this.oLayoutOverlay.getSelected(), "then the overlay is still selected");
			}.bind(this));
		});

		QUnit.test("when the Label gets renamed but the Plugin is busy", function(assert) {
			var oSetFistParentMovableStub = sinon.stub(OverlayUtil, "setFirstParentMovable");
			this.oRenamePlugin.setBusy(true);
			this.oRenamePlugin.startEdit(this.oLayoutOverlay);
			assert.deepEqual(oSetFistParentMovableStub.callCount, 0, "edit wasn't started because plugin is busy");
		});

		QUnit.test("when the designtime provides custom text mutators", function(assert) {
			sandbox.stub(CommandFactory.prototype, "getCommandFor").resolves();
			var oDesignTimeMetadata = this.oLayoutOverlay.getDesignTimeMetadata();
			var oGetTextStub = sinon.stub();
			var oSetTextStub = sinon.stub();
			sandbox.stub(oDesignTimeMetadata, "getAction")
			.callThrough()
			.withArgs("rename")
			.callsFake(function(...aArgs) {
				return Object.assign(
					{},
					oDesignTimeMetadata.getAction.wrappedMethod.apply(this, aArgs),
					{
						getTextMutators() {
							return {
								getText: oGetTextStub,
								setText: oSetTextStub
							};
						}
					}
				);
			});
			return triggerAndWaitForStartEdit(this.oRenamePlugin, this.oLayoutOverlay)
			.then(function() {
				this.oRenamePlugin._oEditableField.textContent = "New text";
				return triggerAndWaitForStopEdit(this.oRenamePlugin);
			}.bind(this))
			.then(function() {
				assert.ok(oGetTextStub.called, "then the custom getter is called");
				assert.ok(oSetTextStub.called, "then the custom setter is called");
			});
		});

		QUnit.test("when the Label gets renamed with a responsible element", function(assert) {
			var fnDone = assert.async();
			var oMockAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);

			addResponsibleElement(this.oLayoutOverlay.getDesignTimeMetadata(), this.oVerticalLayout, this.oButton);

			triggerAndWaitForStartEdit(this.oRenamePlugin, this.oLayoutOverlay).then(function() {
				this.oRenamePlugin._oEditableControlDomRef.textContent = "New Value";
				this.oRenamePlugin._oEditableField.textContent = this.oRenamePlugin._oEditableControlDomRef.textContent;
				this.oRenamePlugin.attachEventOnce("elementModified", function(oEvent) {
					var oRenameCommand = oEvent.getParameter("command");
					assert.equal(this.oButton.getId(), oRenameCommand.getSelector().id, "then a command is created for the responsible element");
					assert.equal(oRenameCommand.getName(), "rename", "then a rename command was created");
					assert.ok(this.oLayoutOverlay.getIgnoreEnterKeyUpOnce(), "the overlay is marked as just renamed (to prevent opening of context menu when pressing ENTER)");
					oMockAppComponent.destroy();
					fnDone();
				}, this);
				triggerEventOnEditableField(this.oRenamePlugin, KeyCodes.ENTER);
			}.bind(this));
		});

		QUnit.test("when retrieving the rename context menu item, with no action on the responsible element", async function(assert) {
			addResponsibleElement(this.oLayoutOverlay.getDesignTimeMetadata(), this.oButton, this.oInnerButton);

			const aMenuItems = await this.oRenamePlugin.getMenuItems([this.oButtonOverlay]);
			assert.equal(aMenuItems[0].id, "CTX_RENAME", "then rename menu item was returned");

			// simulate actions on all overlays, except the responsible element
			sandbox.stub(this.oRenamePlugin, "getAction")
			.returns(true)
			.withArgs(this.oInnerButtonOverlay)
			.returns(false);

			const bIsEnabled = aMenuItems[0].enabled([this.oButtonOverlay]);
			assert.equal(bIsEnabled, false, "then the menu item was disabled");
		});

		QUnit.test("when retrieving an enabled action on target overlay, with an enabled action on the responsible element", async function(assert) {
			var oButtonDesignTimeMetadata = this.oButtonOverlay.getDesignTimeMetadata();
			addResponsibleElement(oButtonDesignTimeMetadata, this.oButton, this.oInnerButton);
			oButtonDesignTimeMetadata.getData().actions.rename.isEnabled = function() {return true;};
			var oGetAssociatedDomRefSpy = sandbox.spy(oButtonDesignTimeMetadata, "getAssociatedDomRef");

			var aMenuItems = await this.oRenamePlugin.getMenuItems([this.oButtonOverlay]);
			assert.equal(aMenuItems[0].id, "CTX_RENAME", "then rename menu item was returned");

			var bIsEnabled = aMenuItems[0].enabled([this.oButtonOverlay]);
			assert.ok(oGetAssociatedDomRefSpy.calledWith(this.oButton), "then the associated domRef was checked from the target overlay");
			assert.equal(oGetAssociatedDomRefSpy.callCount, 1, "then domRef check was only done for the target overlay");
			assert.equal(bIsEnabled, true, "then the menu item was enabled");
		});

		QUnit.test("when retrieving a disabled action on target overlay, with an enabled action on the responsible element", async function(assert) {
			const oButtonDesignTimeMetadata = this.oButtonOverlay.getDesignTimeMetadata();
			addResponsibleElement(oButtonDesignTimeMetadata, this.oButton, this.oInnerButton);
			oButtonDesignTimeMetadata.getData().actions.rename.isEnabled = function() {return false;};

			const aMenuItems = await this.oRenamePlugin.getMenuItems([this.oButtonOverlay]);
			assert.equal(aMenuItems[0].id, "CTX_RENAME", "then rename menu item was returned");

			const bIsEnabled = aMenuItems[0].enabled([this.oButtonOverlay]);
			assert.equal(bIsEnabled, false, "then the menu item was disabled");
		});

		QUnit.test("when retrieving an action on target overlay with no dom ref in DT, with an enabled action on the responsible element", async function(assert) {
			const oButtonDesignTimeMetadata = this.oButtonOverlay.getDesignTimeMetadata();
			addResponsibleElement(oButtonDesignTimeMetadata, this.oButton, this.oInnerButton);
			oButtonDesignTimeMetadata.getData().actions.rename.domRef = undefined;

			const aMenuItems = await this.oRenamePlugin.getMenuItems([this.oButtonOverlay]);
			assert.equal(aMenuItems[0].id, "CTX_RENAME", "then rename menu item was returned");

			const bIsEnabled = aMenuItems[0].enabled([this.oButtonOverlay]);
			assert.equal(bIsEnabled, false, "then the menu item was disabled");
		});

		QUnit.test("when the Label gets renamed and the new value is extremely long", function(assert) {
			sandbox.stub(CommandFactory.prototype, "getCommandFor").resolves();
			return triggerAndWaitForStartEdit(this.oRenamePlugin, this.oLayoutOverlay).then(function() {
				this.oRenamePlugin._oEditableControlDomRef.textContent = "123456789012345678901234567890123456789012345678901234567890";
				this.oRenamePlugin._oEditableField.textContent = this.oRenamePlugin._oEditableControlDomRef.textContent;
				return triggerAndWaitForStopEdit(this.oRenamePlugin);
			}.bind(this))
			.then(function() {
				assert.ok(this.oLabelOverlay.getParent().getDomRef().className.indexOf("sapUiDtOverlayWithScrollBarHorizontal") === -1, "then the ScrollBar Horizontal Style Class was not set");
			}.bind(this));
		});

		QUnit.test("when the title is not on the currently visible viewport and gets renamed", function(assert) {
			var oButtonDom = this.oButton.getDomRef();
			var oLabelDom = this.oLabel.getDomRef();
			oButtonDom.style.marginBottom = `${document.documentElement.clientHeight}px`;
			var oScrollSpy = sinon.spy(oLabelDom, "scrollIntoView");

			return triggerAndWaitForStartEdit(this.oRenamePlugin, this.oLayoutOverlay).then(function() {
				assert.equal(oScrollSpy.callCount, 1, "then the Label got scrolled");
				oLabelDom.scrollIntoView.restore();
				this.oRenamePlugin.stopEdit(this.oLayoutOverlay);
			}.bind(this));
		});

		QUnit.test("when the Label gets renamed and the new value is interpreted as a binding", function(assert) {
			return triggerAndWaitForStartEdit(this.oRenamePlugin, this.oLayoutOverlay).then(function() {
				this.oRenamePlugin._oEditableControlDomRef.textContent = "{testText}";
				this.oRenamePlugin._oEditableField.textContent = this.oRenamePlugin._oEditableControlDomRef.textContent;
				return triggerAndWaitForStopEdit(this.oRenamePlugin);
			}.bind(this))
			.then(function() {
				assert.equal(this.oShowMessageBoxStub.callCount, 1, "the error was shown");
				assert.equal(this.oShowMessageBoxStub.lastCall.args[1], oResourceBundle.getText("RENAME_BINDING_ERROR_TEXT"), "the correct error text was passed");
				assert.equal(this.oShowMessageBoxStub.lastCall.args[2].titleKey, "RENAME_ERROR_TITLE", "the correct error text was passed");
				assert.ok(this.oLayoutOverlay.hasStyleClass(RenameHandler.errorStyleClass), "the error style class is set");
				this.oRenamePlugin.stopEdit(this.oLayoutOverlay);
			}.bind(this));
		});

		QUnit.test("when the Label gets renamed to }{", function(assert) {
			return triggerAndWaitForStartEdit(this.oRenamePlugin, this.oLayoutOverlay).then(function() {
				this.oRenamePlugin._oEditableControlDomRef.textContent = "}{";
				this.oRenamePlugin._oEditableField.textContent = this.oRenamePlugin._oEditableControlDomRef.textContent;
				return triggerAndWaitForStopEdit(this.oRenamePlugin);
			}.bind(this))
			.then(function() {
				assert.equal(this.oShowMessageBoxStub.callCount, 1, "the error was shown");
				assert.equal(this.oShowMessageBoxStub.lastCall.args[1], oResourceBundle.getText("RENAME_BINDING_ERROR_TEXT"), "the correct error text was passed");
				assert.equal(this.oShowMessageBoxStub.lastCall.args[2].titleKey, "RENAME_ERROR_TITLE", "the correct error text was passed");
				assert.ok(this.oLayoutOverlay.hasStyleClass(RenameHandler.errorStyleClass), "the error style class is set");
				this.oRenamePlugin.stopEdit(this.oLayoutOverlay);
			}.bind(this));
		});

		QUnit.test("when the Label gets renamed and the new value is empty and invalid", function(assert) {
			addValidators(this.oLayoutOverlay.getDesignTimeMetadata(), [
				"noEmptyText"
			]);
			return triggerAndWaitForStartEdit(this.oRenamePlugin, this.oLayoutOverlay).then(function() {
				this.oRenamePlugin._oEditableControlDomRef.textContent = "";
				this.oRenamePlugin._oEditableField.textContent = this.oRenamePlugin._oEditableControlDomRef.textContent;
				return triggerAndWaitForStopEdit(this.oRenamePlugin);
			}.bind(this))
			.then(function() {
				assert.equal(this.oShowMessageBoxStub.callCount, 1, "the error was shown");
				assert.equal(this.oShowMessageBoxStub.lastCall.args[1], oResourceBundle.getText("RENAME_EMPTY_ERROR_TEXT"), "the correct error text was passed");
				assert.equal(this.oShowMessageBoxStub.lastCall.args[2].titleKey, "RENAME_ERROR_TITLE", "the correct error text was passed");
				assert.ok(this.oLayoutOverlay.hasStyleClass(RenameHandler.errorStyleClass), "the error style class is set");
				this.oRenamePlugin.stopEdit(this.oLayoutOverlay);
			}.bind(this));
		});

		QUnit.test("when the Label gets renamed on a responsible element and the new value is empty and invalid", function(assert) {
			addValidators(this.oLayoutOverlay.getDesignTimeMetadata(), [
				"noEmptyText"
			]);
			addResponsibleElement(this.oButtonOverlay.getDesignTimeMetadata(), this.oButton, this.oVerticalLayout);

			return triggerAndWaitForStartEdit(this.oRenamePlugin, this.oButtonOverlay).then(function() {
				this.oRenamePlugin._oEditableControlDomRef.textContent = "";
				this.oRenamePlugin._oEditableField.textContent = this.oRenamePlugin._oEditableControlDomRef.textContent;
				return triggerAndWaitForStopEdit(this.oRenamePlugin);
			}.bind(this))
			.then(function() {
				assert.equal(this.oShowMessageBoxStub.callCount, 1, "the error was shown");
				assert.equal(this.oShowMessageBoxStub.lastCall.args[1], oResourceBundle.getText("RENAME_EMPTY_ERROR_TEXT"), "the correct error text was passed");
				assert.equal(this.oShowMessageBoxStub.lastCall.args[2].titleKey, "RENAME_ERROR_TITLE", "the correct error text was passed");
				assert.ok(this.oButtonOverlay.hasStyleClass(RenameHandler.errorStyleClass), "the error style class is set");
				this.oRenamePlugin.stopEdit(this.oLayoutOverlay);
			}.bind(this));
		});

		QUnit.test("when the Label gets renamed and the new value is invalid and multiple validators are available", function(assert) {
			addValidators(this.oLayoutOverlay.getDesignTimeMetadata(), [
				{
					validatorFunction() {
						return false;
					},
					errorMessage: "invalid"
				},
				"noEmptyText"
			]);
			return triggerAndWaitForStartEdit(this.oRenamePlugin, this.oLayoutOverlay).then(function() {
				this.oRenamePlugin._oEditableControlDomRef.textContent = "";
				this.oRenamePlugin._oEditableField.textContent = this.oRenamePlugin._oEditableControlDomRef.textContent;
				return triggerAndWaitForStopEdit(this.oRenamePlugin);
			}.bind(this))
			.then(function() {
				assert.equal(this.oShowMessageBoxStub.callCount, 1, "the error was shown");
				assert.equal(this.oShowMessageBoxStub.lastCall.args[1], "invalid", "the correct error text was passed");
				assert.equal(this.oShowMessageBoxStub.lastCall.args[2].titleKey, "RENAME_ERROR_TITLE", "the correct error text was passed");
				assert.ok(this.oLayoutOverlay.hasStyleClass(RenameHandler.errorStyleClass), "the error style class is set");
				this.oRenamePlugin.stopEdit(this.oLayoutOverlay);
			}.bind(this));
		});

		QUnit.test("when the Label gets renamed to the same text", function(assert) {
			var oEmitLabelChangeSpy = sandbox.spy(this.oRenamePlugin, "_emitLabelChangeEvent");
			return triggerAndWaitForStartEdit(this.oRenamePlugin, this.oLayoutOverlay).then(function() {
				this.oRenamePlugin._oEditableControlDomRef.textContent = "Label";
				this.oRenamePlugin._oEditableField.textContent = this.oRenamePlugin._oEditableControlDomRef.textContent;
				return triggerAndWaitForStopEdit(this.oRenamePlugin);
			}.bind(this))
			.then(function() {
				assert.equal(this.oShowMessageBoxStub.callCount, 0, "no error was shown");
				assert.notOk(this.oLayoutOverlay.hasStyleClass(RenameHandler.errorStyleClass), "the error style class is not set");
				assert.equal(oEmitLabelChangeSpy.callCount, 0, "the label change was not processed");
			}.bind(this));
		});

		QUnit.test('when the user tries to rename a field to empty string ("")', function(assert) {
			return triggerAndWaitForStartEdit(this.oRenamePlugin, this.oLayoutOverlay).then(function() {
				this.oRenamePlugin._oEditableControlDomRef.textContent = "";
				this.oRenamePlugin._oEditableField.textContent = this.oRenamePlugin._oEditableControlDomRef.textContent;
				return triggerAndWaitForStopEdit(this.oRenamePlugin);
			}.bind(this))
			.then(function() {
				assert.strictEqual(RenameHandler._getCurrentEditableFieldText.call(this.oRenamePlugin), "\xa0", "then the empty string is replaced by a non-breaking space");
			}.bind(this));
		});

		QUnit.test("when the Label gets modified with DELETE or BACKSPACE key", function(assert) {
			var fnDone = assert.async();
			triggerAndWaitForStartEdit(this.oRenamePlugin, this.oLayoutOverlay).then(function() {
				var oSpy = sandbox.spy();
				this.oLayoutOverlay.attachBrowserEvent("keydown", oSpy);

				triggerEventOnEditableField(this.oRenamePlugin, KeyCodes.DELETE);
				triggerEventOnEditableField(this.oRenamePlugin, KeyCodes.BACKSPACE);

				// Wait a bit if any of other listeners are being called
				setTimeout(function() {
					assert.ok(oSpy.notCalled);
					fnDone();
				});

				this.oRenamePlugin.stopEdit();
			}.bind(this));
		});

		QUnit.test("when ESCAPE has been pressed after renaming", function(assert) {
			var fnDone = assert.async();
			var oRemoveStyleClassSpy = sandbox.spy(this.oLayoutOverlay, "removeStyleClass");
			var oStopEditSpy = sandbox.spy(this.oRenamePlugin, "stopEdit");
			triggerAndWaitForStartEdit(this.oRenamePlugin, this.oLayoutOverlay).then(function() {
				this.oRenamePlugin._oEditableControlDomRef.textContent = "foo";
				this.oRenamePlugin._oEditableField.textContent = this.oRenamePlugin._oEditableControlDomRef.textContent;

				triggerEventOnEditableField(this.oRenamePlugin, KeyCodes.ESCAPE);
				// Wait a bit if any of other listeners are being called
				setTimeout(function() {
					assert.equal(oRemoveStyleClassSpy.callCount, 1, "a style class was removed");
					assert.equal(oRemoveStyleClassSpy.lastCall.args[0], RenameHandler.errorStyleClass, "the correct class was removed");
					assert.equal(oStopEditSpy.callCount, 1, "stop was called");
					fnDone();
				});
			}.bind(this));
		});

		QUnit.test("when scrolling happens right before renaming starts", function(assert) {
			var fnDone = assert.async();

			this.oInnerButtonOverlay.setSelectable(true);
			this.oScrollContainer.getDomRef().scrollTo(100, 0);
			triggerAndWaitForStartEdit(this.oRenamePlugin, this.oInnerButtonOverlay).then(function() {
				this.oScrollContainerOverlay.getChildren()[0].attachEventOnce("scrollSynced", function() {
					assert.equal(
						Math.floor(DOMUtil.getOffset(this.oRenamePlugin._oEditableControlDomRef).left),
						Math.floor(DOMUtil.getOffset(this.oRenamePlugin._oEditableField).left),
						"then the left position of the editable control is still correct"
					);
					assert.equal(
						Math.floor(DOMUtil.getOffset(this.oRenamePlugin._oEditableControlDomRef).top),
						Math.floor(DOMUtil.getOffset(this.oRenamePlugin._oEditableField).top),
						"then the top position of the editable control is still correct"
					);
					assert.deepEqual(
						this.oRenamePlugin._oEditableField,
						document.activeElement,
						"then the editable control has focus"
					);
					assert.ok(
						this.oRenamePlugin._oEditedOverlay.getSelected(),
						"then the overlay being edited is still selected"
					);
					this.oRenamePlugin.stopEdit(this.oLayoutOverlay);
					fnDone();
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});