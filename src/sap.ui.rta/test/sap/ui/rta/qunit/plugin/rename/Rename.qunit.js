/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/ScrollContainer",
	"sap/ui/core/Lib",
	"sap/ui/core/Title",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormLayout",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/plugin/rename/Rename",
	"sap/ui/rta/plugin/Selection",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	Button,
	Label,
	ScrollContainer,
	Lib,
	Title,
	DesignTime,
	OverlayRegistry,
	ChangesWriteAPI,
	FormContainer,
	FormLayout,
	Form,
	VerticalLayout,
	nextUIUpdate,
	CommandFactory,
	Plugin,
	RenamePlugin,
	SelectionPlugin,
	Utils,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	var oResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");

	function addResponsibleElement(oDesignTimeMetadata, oTargetElement, oResponsibleElement) {
		Object.assign(oDesignTimeMetadata.getData().actions, {
			getResponsibleElement(oElement) {
				if (oElement === oTargetElement) {
					return oResponsibleElement;
				}
				return undefined;
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
				assert.strictEqual(
					this.oRenamePlugin.isAvailable([this.oFormContainerOverlay]),
					true,
					"then rename is available for the overlay"
				);
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
				assert.strictEqual(
					this.oRenamePlugin.isAvailable([this.oFormContainerOverlay0]),
					true,
					"then rename is available for the overlay"
				);
				assert.strictEqual(
					this.oRenamePlugin.isEnabled([this.oFormContainerOverlay0]),
					false,
					"then rename is not enabled for the overlay"
				);
				assert.strictEqual(
					this.oRenamePlugin.isAvailable([this.oFormContainerOverlay]),
					true,
					"then rename is available for the overlay"
				);
				assert.strictEqual(
					this.oRenamePlugin.isEnabled([this.oFormContainerOverlay]),
					true,
					"then rename is enabled for the overlay"
				);
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
				assert.strictEqual(
					this.oRenamePlugin.isAvailable([this.oFormContainerOverlay0]),
					true,
					"then rename is available for the overlay"
				);
				assert.strictEqual(
					this.oRenamePlugin.isEnabled([this.oFormContainerOverlay0]),
					false,
					"then rename is not enabled for the overlay"
				);
				assert.strictEqual(
					this.oRenamePlugin.isAvailable([this.oFormContainerOverlay]),
					true,
					"then rename is available for the overlay"
				);
				assert.strictEqual(
					this.oRenamePlugin.isEnabled([this.oFormContainerOverlay]),
					true,
					"then rename is enabled for the overlay"
				);
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

			assert.strictEqual(
				this.oRenamePlugin.isAvailable([this.oFormContainerOverlay]),
				false,
				"then rename is not available for the overlay"
			);
			assert.strictEqual(
				this.oRenamePlugin.isEnabled([this.oFormContainerOverlay]),
				false,
				"then rename is not enabled for the overlay"
			);

			return Promise.resolve()
			.then(this.oRenamePlugin._isEditable.bind(this.oRenamePlugin, this.oFormContainerOverlay))
			.then(function(bEditable) {
				assert.strictEqual(bEditable, false, "then rename is not editable for the overlay");
			});
		});

		QUnit.test("when isEnabled are called with designTime with a domRef function pointing to nothing", function(assert) {
			sandbox.stub(this.oFormContainerOverlay.getDesignTimeMetadata(), "getAssociatedDomRef").callsFake(function() {
				return undefined;
			});
			this.oRenamePlugin.deregisterElementOverlay(this.oFormContainerOverlay);
			this.oRenamePlugin.registerElementOverlay(this.oFormContainerOverlay);

			assert.strictEqual(
				this.oRenamePlugin.isEnabled([this.oFormContainerOverlay]),
				false,
				"then rename is not enabled for the overlay"
			);
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
				this.oLayoutOverlay.setSelected(true);

				await nextUIUpdate();

				done();
			}.bind(this));
		},
		afterEach() {
			sandbox.restore();
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("when the Label was selected and gets renamed", async function(assert) {
			assert.ok(this.oLayoutOverlay.getSelected(), "then the overlay is initially selected");
			await RtaQunitUtils.simulateRename(sandbox, "New Text", () => {
				this.oRenamePlugin.handler([this.oLayoutOverlay]);
			});
			assert.ok(this.oLayoutOverlay.getSelected(), "then the overlay is still selected after the rename");
		});

		QUnit.test("when the designtime provides a custom text mutator", async function(assert) {
			sandbox.stub(CommandFactory.prototype, "getCommandFor").resolves();
			const oDesignTimeMetadata = this.oLayoutOverlay.getDesignTimeMetadata();
			const oGetTextStub = sinon.stub();
			sandbox.stub(oDesignTimeMetadata, "getAction")
			.callThrough()
			.withArgs("rename")
			.callsFake(function(...aArgs) {
				return {
					...oDesignTimeMetadata.getAction.wrappedMethod.apply(this, aArgs),
					getTextMutators() {
						return {
							getText: oGetTextStub
						};
					}
				};
			});

			await RtaQunitUtils.simulateRename(sandbox, "New Text", () => {
				this.oRenamePlugin.handler([this.oLayoutOverlay]);
			});

			assert.strictEqual(oGetTextStub.callCount, 1, "then the custom getter is called");
		});

		QUnit.test("when the Label gets renamed with a responsible element", function(assert) {
			const fnDone = assert.async();
			const oMockAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);

			addResponsibleElement(this.oLayoutOverlay.getDesignTimeMetadata(), this.oVerticalLayout, this.oButton);

			this.oRenamePlugin.attachEventOnce("elementModified", (oEvent) => {
				const oRenameCommand = oEvent.getParameter("command");
				assert.strictEqual(
					this.oButton.getId(),
					oRenameCommand.getSelector().id,
					"then a command is created for the responsible element"
				);
				assert.strictEqual(
					oRenameCommand.getNewValue(),
					"New Text",
					"then the new text is set correctly"
				);
				assert.strictEqual(oRenameCommand.getName(), "rename", "then a rename command was created");
				oMockAppComponent.destroy();
				fnDone();
			});

			RtaQunitUtils.simulateRename(sandbox, "New Text", () => {
				this.oRenamePlugin.handler([this.oLayoutOverlay]);
			});
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

		QUnit.test("when the Label gets renamed and the new value is interpreted as a binding", async function(assert) {
			const oCreateCommandSpy = sandbox.spy(this.oRenamePlugin, "createRenameCommand");
			await RtaQunitUtils.simulateRename(
				sandbox,
				"{testText}",
				() => {
					this.oRenamePlugin.handler([this.oLayoutOverlay]);
				},
				(sErrorMessage) => {
					assert.strictEqual(
						sErrorMessage,
						oResourceBundle.getText("RENAME_BINDING_ERROR_TEXT"),
						"then the correct error message was shown"
					);
				}
			);
			assert.strictEqual(oCreateCommandSpy.callCount, 0, "then no command was created");
		});

		QUnit.test("when the Label gets renamed to }{", async function(assert) {
			const oCreateCommandSpy = sandbox.spy(this.oRenamePlugin, "createRenameCommand");
			await RtaQunitUtils.simulateRename(
				sandbox,
				"}{",
				() => {
					this.oRenamePlugin.handler([this.oLayoutOverlay]);
				},
				(sErrorMessage) => {
					assert.strictEqual(
						sErrorMessage,
						oResourceBundle.getText("RENAME_BINDING_ERROR_TEXT"),
						"then the correct error message was shown"
					);
				}
			);
			assert.strictEqual(oCreateCommandSpy.callCount, 0, "then no command was created");
		});

		QUnit.test("when the Label gets renamed and the new value is empty and invalid", async function(assert) {
			addValidators(this.oLayoutOverlay.getDesignTimeMetadata(), [
				"noEmptyText"
			]);
			const oCreateCommandSpy = sandbox.spy(this.oRenamePlugin, "createRenameCommand");
			await RtaQunitUtils.simulateRename(
				sandbox,
				"",
				() => {
					this.oRenamePlugin.handler([this.oLayoutOverlay]);
				},
				(sErrorMessage) => {
					assert.strictEqual(
						sErrorMessage,
						oResourceBundle.getText("RENAME_EMPTY_ERROR_TEXT"),
						"then the correct error message was shown"
					);
				}
			);
			assert.strictEqual(oCreateCommandSpy.callCount, 0, "then no command was created");
		});

		QUnit.test("when the label of an element with a responsible element gets renamed and the new value is empty and invalid", async function(assert) {
			addValidators(this.oLayoutOverlay.getDesignTimeMetadata(), [
				"noEmptyText"
			]);
			addResponsibleElement(this.oButtonOverlay.getDesignTimeMetadata(), this.oButton, this.oVerticalLayout);
			this.oButtonOverlay.setSelectable(true);
			this.oButtonOverlay.setSelected(true);

			const oCreateCommandSpy = sandbox.spy(this.oRenamePlugin, "createRenameCommand");
			await RtaQunitUtils.simulateRename(
				sandbox,
				"",
				() => {
					this.oRenamePlugin.handler([this.oButtonOverlay]);
				},
				(sErrorMessage) => {
					assert.strictEqual(
						sErrorMessage,
						oResourceBundle.getText("RENAME_EMPTY_ERROR_TEXT"),
						"then the correct error message was shown"
					);
				}
			);
			assert.strictEqual(oCreateCommandSpy.callCount, 0, "then no command was created");
		});

		QUnit.test("when the Label gets renamed and the new value is invalid and multiple validators are available", async function(assert) {
			addValidators(this.oLayoutOverlay.getDesignTimeMetadata(), [
				{
					validatorFunction() {
						return false;
					},
					errorMessage: "invalid"
				},
				"noEmptyText"
			]);

			const oCreateCommandSpy = sandbox.spy(this.oRenamePlugin, "createRenameCommand");
			await RtaQunitUtils.simulateRename(
				sandbox,
				"",
				() => {
					this.oRenamePlugin.handler([this.oLayoutOverlay]);
				},
				(sErrorMessage) => {
					assert.strictEqual(
						sErrorMessage,
						"invalid",
						"then the correct error message was shown"
					);
				}
			);
			assert.strictEqual(oCreateCommandSpy.callCount, 0, "then no command was created");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});