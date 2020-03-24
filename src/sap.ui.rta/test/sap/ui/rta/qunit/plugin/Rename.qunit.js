/* global QUnit */

sap.ui.define([
	"sap/ui/layout/VerticalLayout",
	"sap/ui/dt/DesignTime",
	"sap/ui/fl/Utils",
	"sap/ui/rta/Utils",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormLayout",
	"sap/ui/rta/plugin/Rename",
	"sap/ui/rta/plugin/RenameHandler",
	"sap/ui/core/Title",
	"sap/m/Button",
	"sap/m/Label",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/UIComponent",
	"sap/ui/thirdparty/sinon-4"
],
function(
	VerticalLayout,
	DesignTime,
	FlUtils,
	Utils,
	CommandFactory,
	OverlayRegistry,
	ChangeRegistry,
	FormContainer,
	Form,
	FormLayout,
	RenamePlugin,
	RenameHandler,
	Title,
	Button,
	Label,
	KeyCodes,
	UIComponent,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");

	function triggerAndWaitForStartEdit(oPlugin, oOverlay) {
		return new Promise(function(resolve) {
			sap.ui.getCore().getEventBus().subscribeOnce("sap.ui.rta", "plugin.Rename.startEdit", function() {
				resolve();
			});
			oPlugin.startEdit(oOverlay);
		});
	}

	function triggerAndWaitForStopEdit(oPlugin) {
		return new Promise(function(resolve) {
			sap.ui.getCore().getEventBus().subscribeOnce("sap.ui.rta", "plugin.Rename.stopEdit", function() {
				resolve();
			});
			triggerEventOnEditableField(oPlugin, KeyCodes.ENTER);
		});
	}

	function triggerEventOnEditableField(oPlugin, sKeyCode) {
		sKeyCode = sKeyCode || KeyCodes.ENTER;
		var $Event = jQuery.Event("keydown");
		$Event.keyCode = sKeyCode;
		oPlugin._$editableField.trigger($Event);
	}

	function addResponsibleElement(oDesignTimeMetadata, oTargetElement, oResponsibleElement) {
		Object.assign(oDesignTimeMetadata.getData().actions, {
			getResponsibleElement: function(oElement) {
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

	QUnit.module("Given a designTime and rename plugin are instantiated", {
		beforeEach: function(assert) {
			var done = assert.async();

			var oChangeRegistry = ChangeRegistry.getInstance();
			return oChangeRegistry.registerControlsForChanges({
				"sap.ui.layout.form.FormContainer": {
					renameGroup: {
						completeChangeContent: function() {},
						applyChange: function() {},
						revertChange: function() {}
					}
				}
			})
			.then(function() {
				this.oRenamePlugin = new RenamePlugin({
					commandFactory: new CommandFactory()
				});
				this.oFormContainer = new FormContainer("formContainer", {
					title: new Title("title", {
						text: "title"
					})
				});
				this.oForm = new Form("form", {
					formContainers: [this.oFormContainer],
					layout: new FormLayout({
					})
				});
				this.oVerticalLayout = new VerticalLayout({
					content: [this.oForm]
				}).placeAt("qunit-fixture");

				sap.ui.getCore().applyChanges();

				this.oDesignTime = new DesignTime({
					rootElements: [this.oForm],
					plugins: [this.oRenamePlugin]
				});

				this.oDesignTime.attachEventOnce("synced", function() {
					this.oFormOverlay = OverlayRegistry.getOverlay(this.oForm);
					this.oFormContainerOverlay = OverlayRegistry.getOverlay(this.oFormContainer);
					this.oFormContainerOverlay.setSelectable(true);
					done();
				}, this);
			}.bind(this));
		},
		afterEach: function() {
			sandbox.restore();
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("when _onDesignTimeSelectionChange is called", function(assert) {
			var aSelection = [this.oFormContainerOverlay];
			var oEvent = {
				getParameter: function() {
					return aSelection;
				}
			};

			RenameHandler._onDesignTimeSelectionChange.call(this.oRenamePlugin, oEvent);

			assert.strictEqual(aSelection, this.oRenamePlugin._aSelection, "then the arrays of selection are equal");
			assert.strictEqual(this.oRenamePlugin._aSelection.length, 1, "then the array of selection has only one selected overlay");
		});

		QUnit.test("when _isEditable is called", function(assert) {
			this.oFormContainerOverlay.setDesignTimeMetadata({
				actions: {
					rename: {
						changeType: "renameGroup",
						domRef: function(oFormContainer) {
							return jQuery(oFormContainer.getRenderedDomRef()).find(".sapUiFormTitle")[0];
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

		QUnit.test("when isAvailable and isEnabled are called", function(assert) {
			var done = assert.async();
			this.oFormContainerOverlay.setDesignTimeMetadata({
				actions: {
					rename: {
						changeType: "renameGroup",
						isEnabled: function(oFormContainer) {
							return !(oFormContainer.getToolbar() || !oFormContainer.getTitle());
						},
						domRef: function(oFormContainer) {
							return jQuery(oFormContainer.getRenderedDomRef()).find(".sapUiFormTitle")[0];
						}
					}
				}
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				assert.strictEqual(this.oRenamePlugin.isAvailable([this.oFormContainerOverlay]), true, "then rename is available for the overlay");
				assert.strictEqual(this.oRenamePlugin.isEnabled([this.oFormContainerOverlay]), true, "then rename is enabled for the overlay");
				this.oRenamePlugin._isEditable(this.oFormContainerOverlay)
					.then(function(bEditable) {
						assert.strictEqual(bEditable, true, "then rename is editable for the overlay");
						done();
					});
			}.bind(this));

			this.oRenamePlugin.deregisterElementOverlay(this.oFormContainerOverlay);
			this.oRenamePlugin.registerElementOverlay(this.oFormContainerOverlay);
		});

		QUnit.test("when retrieving the context menu item", function(assert) {
			var bIsAvailable = true;
			sandbox.stub(this.oRenamePlugin, "isAvailable").callsFake(function(aElementOverlays) {
				assert.equal(aElementOverlays[0], this.oFormContainerOverlay, "the 'available' function calls isAvailable with the correct overlay");
				return bIsAvailable;
			}.bind(this));
			sandbox.stub(this.oRenamePlugin, "startEdit").callsFake(function(oOverlay) {
				assert.deepEqual(oOverlay, this.oFormContainerOverlay, "the 'startEdit' method is called with the right overlay");
			}.bind(this));
			sandbox.stub(this.oRenamePlugin, "isEnabled").callsFake(function(aElementOverlays) {
				assert.equal(aElementOverlays[0], this.oFormContainerOverlay, "the 'enabled' function calls isEnabled with the correct overlay");
			}.bind(this));

			var aMenuItems = this.oRenamePlugin.getMenuItems([this.oFormContainerOverlay]);
			assert.equal(aMenuItems[0].id, "CTX_RENAME", "'getMenuItems' returns the context menu item for the plugin");

			this.oFormContainerOverlay.setSelected(true);
			aMenuItems[0].handler([this.oFormContainerOverlay]);
			aMenuItems[0].enabled([this.oFormContainerOverlay]);

			bIsAvailable = false;
			assert.equal(
				this.oRenamePlugin.getMenuItems([this.oFormContainerOverlay]).length,
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
	});

	QUnit.module("Given a designTime and rename plugin are instantiated", {
		beforeEach: function(assert) {
			var done = assert.async();

			this.oRenamePlugin = new RenamePlugin({
				commandFactory: new CommandFactory()
			});

			this.oShowMessageBoxStub = sandbox.stub(Utils, "_showMessageBox").resolves();

			this.oButton = new Button({text: "Button", id: "button"});
			this.oLabel = new Label({text: "Label", id: "label"});
			this.oVerticalLayout = new VerticalLayout({
				id: "layout",
				content: [this.oButton, this.oLabel],
				width: "200px"
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

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

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				this.oLabelOverlay = OverlayRegistry.getOverlay(this.oLabel);
				this.oLayoutOverlay.setSelectable(true);

				sap.ui.getCore().applyChanges();

				done();
			}.bind(this));
		},
		afterEach: function() {
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the Label gets renamed", function(assert) {
			return triggerAndWaitForStartEdit(this.oRenamePlugin, this.oLayoutOverlay).then(function() {
				assert.equal(this.oLayoutOverlay.getSelected(), true, "then the overlay is still selected");
				this.oRenamePlugin.stopEdit(this.oLayoutOverlay);
				assert.equal(this.oLayoutOverlay.getSelected(), true, "then the overlay is still selected");
			}.bind(this));
		});

		QUnit.test("when the Label gets renamed with a responsible element", function(assert) {
			var fnDone = assert.async();
			var oMockAppComponent = new UIComponent("mockAppComponent");
			sandbox.stub(FlUtils, "getAppComponentForControl").returns(oMockAppComponent);

			addResponsibleElement(this.oLayoutOverlay.getDesignTimeMetadata(), this.oVerticalLayout, this.oButton);

			triggerAndWaitForStartEdit(this.oRenamePlugin, this.oLayoutOverlay).then(function() {
				this.oRenamePlugin._$oEditableControlDomRef.text("New Value");
				this.oRenamePlugin._$editableField.text(this.oRenamePlugin._$oEditableControlDomRef.text());
				this.oRenamePlugin.attachEventOnce("elementModified", function(oEvent) {
					var oRenameCommand = oEvent.getParameter("command");
					assert.equal(this.oButton.getId(), oRenameCommand.getSelector().id, "then a command is created for the responsible element");
					assert.equal(oRenameCommand.getName(), "rename", "then a rename command was created");
					oMockAppComponent.destroy();
					fnDone();
				}, this);
				triggerEventOnEditableField(this.oRenamePlugin, KeyCodes.ENTER);
			}.bind(this));
		});

		QUnit.test("when retrieving the rename context menu item, with no action on the responsible element", function(assert) {
			addResponsibleElement(this.oLayoutOverlay.getDesignTimeMetadata(), this.oVerticalLayout, this.oButton);

			var aMenuItems = this.oRenamePlugin.getMenuItems([this.oLayoutOverlay]);
			assert.equal(aMenuItems[0].id, "CTX_RENAME", "then rename menu item was returned");

			// simulate actions on all overlays, except the responsible element
			sandbox.stub(this.oRenamePlugin, "getAction")
				.returns(true)
				.withArgs(this.oButtonOverlay)
				.returns(false);

			var bIsEnabled = aMenuItems[0].enabled([this.oLayoutOverlay]);
			assert.equal(bIsEnabled, false, "then the menu item was disabled");
		});

		QUnit.test("when retrieving an enabled action on target overlay, with an enabled action on the responsible element", function(assert) {
			var oLayoutDesignTimeMetadata = this.oLayoutOverlay.getDesignTimeMetadata();
			addResponsibleElement(oLayoutDesignTimeMetadata, this.oVerticalLayout, this.oButton);
			oLayoutDesignTimeMetadata.getData().actions.rename.isEnabled = function() {return true;};
			var oGetAssociatedDomRefSpy = sandbox.spy(oLayoutDesignTimeMetadata, "getAssociatedDomRef");

			var aMenuItems = this.oRenamePlugin.getMenuItems([this.oLayoutOverlay]);
			assert.equal(aMenuItems[0].id, "CTX_RENAME", "then rename menu item was returned");

			var bIsEnabled = aMenuItems[0].enabled([this.oLayoutOverlay]);
			assert.ok(oGetAssociatedDomRefSpy.calledWith(this.oVerticalLayout), "then the associated domRef was checked from the target overlay");
			assert.equal(oGetAssociatedDomRefSpy.callCount, 1, "then domRef check was only done for the target overlay");
			assert.equal(bIsEnabled, true, "then the menu item was enabled");
		});

		QUnit.test("when retrieving a disabled action on target overlay, with an enabled action on the responsible element", function(assert) {
			var oLayoutDesignTimeMetadata = this.oLayoutOverlay.getDesignTimeMetadata();
			addResponsibleElement(oLayoutDesignTimeMetadata, this.oVerticalLayout, this.oButton);
			oLayoutDesignTimeMetadata.getData().actions.rename.isEnabled = function() {return false;};

			var aMenuItems = this.oRenamePlugin.getMenuItems([this.oLayoutOverlay]);
			assert.equal(aMenuItems[0].id, "CTX_RENAME", "then rename menu item was returned");

			var bIsEnabled = aMenuItems[0].enabled([this.oLayoutOverlay]);
			assert.equal(bIsEnabled, false, "then the menu item was disabled");
		});

		QUnit.test("when retrieving an action on target overlay with an invalid dom ref, with an enabled action on the responsible element", function(assert) {
			var oLayoutDesignTimeMetadata = this.oLayoutOverlay.getDesignTimeMetadata();
			addResponsibleElement(oLayoutDesignTimeMetadata, this.oVerticalLayout, this.oButton);
			oLayoutDesignTimeMetadata.getData().actions.rename.domRef = undefined;

			var aMenuItems = this.oRenamePlugin.getMenuItems([this.oLayoutOverlay]);
			assert.equal(aMenuItems[0].id, "CTX_RENAME", "then rename menu item was returned");

			var bIsEnabled = aMenuItems[0].enabled([this.oLayoutOverlay]);
			assert.equal(bIsEnabled, false, "then the menu item was disabled");
		});

		QUnit.test("when the Label gets renamed and the new value is extremely long", function(assert) {
			sandbox.stub(CommandFactory.prototype, "getCommandFor").resolves();
			return triggerAndWaitForStartEdit(this.oRenamePlugin, this.oLayoutOverlay).then(function() {
				this.oRenamePlugin._$oEditableControlDomRef.text("123456789012345678901234567890123456789012345678901234567890");
				this.oRenamePlugin._$editableField.text(this.oRenamePlugin._$oEditableControlDomRef.text());
				return triggerAndWaitForStopEdit(this.oRenamePlugin);
			}.bind(this))
			.then(function() {
				assert.ok(this.oLabelOverlay.getParent().$()[0].className.indexOf("sapUiDtOverlayWithScrollBarHorizontal") === -1, "then the ScrollBar Horizontal Style Class was not set");
			}.bind(this));
		});

		QUnit.test("when the title is not on the currently visible viewport and gets renamed", function(assert) {
			var $Button = this.oButton.$();
			var $Label = this.oLabel.$();
			$Button.css("margin-bottom", document.documentElement.clientHeight);
			var oScrollSpy = sinon.spy($Label.get(0), "scrollIntoView");

			return triggerAndWaitForStartEdit(this.oRenamePlugin, this.oLayoutOverlay).then(function() {
				assert.equal(oScrollSpy.callCount, 1, "then the Label got scrolled");
				$Label.get(0).scrollIntoView.restore();
			});
		});

		QUnit.test("when the Label gets renamed and the new value is empty and invalid", function(assert) {
			addValidators(this.oLayoutOverlay.getDesignTimeMetadata(), [
				"noEmptyText"
			]);
			return triggerAndWaitForStartEdit(this.oRenamePlugin, this.oLayoutOverlay).then(function() {
				this.oRenamePlugin._$oEditableControlDomRef.text("");
				this.oRenamePlugin._$editableField.text(this.oRenamePlugin._$oEditableControlDomRef.text());
				return triggerAndWaitForStopEdit(this.oRenamePlugin);
			}.bind(this))
			.then(function() {
				assert.equal(this.oShowMessageBoxStub.callCount, 1, "the error was shown");
				assert.equal(this.oShowMessageBoxStub.lastCall.args[1], "RENAME_ERROR_TITLE", "the correct error text was passed");
				assert.equal(this.oShowMessageBoxStub.lastCall.args[2], oResourceBundle.getText("RENAME_EMPTY_ERROR_TEXT"), "the correct error text was passed");
				assert.ok(this.oLayoutOverlay.hasStyleClass(RenameHandler.errorStyleClass), "the error style class is set");
			}.bind(this));
		});

		QUnit.test("when the Label gets renamed on a responsible element and the new value is empty and invalid", function(assert) {
			addValidators(this.oLayoutOverlay.getDesignTimeMetadata(), [
				"noEmptyText"
			]);
			addResponsibleElement(this.oButtonOverlay.getDesignTimeMetadata(), this.oButton, this.oVerticalLayout);

			return triggerAndWaitForStartEdit(this.oRenamePlugin, this.oButtonOverlay).then(function() {
				this.oRenamePlugin._$oEditableControlDomRef.text("");
				this.oRenamePlugin._$editableField.text(this.oRenamePlugin._$oEditableControlDomRef.text());
				return triggerAndWaitForStopEdit(this.oRenamePlugin);
			}.bind(this))
			.then(function() {
				assert.equal(this.oShowMessageBoxStub.callCount, 1, "the error was shown");
				assert.equal(this.oShowMessageBoxStub.lastCall.args[1], "RENAME_ERROR_TITLE", "the correct error text was passed");
				assert.equal(this.oShowMessageBoxStub.lastCall.args[2], oResourceBundle.getText("RENAME_EMPTY_ERROR_TEXT"), "the correct error text was passed");
				assert.ok(this.oButtonOverlay.hasStyleClass(RenameHandler.errorStyleClass), "the error style class is set");
			}.bind(this));
		});

		QUnit.test("when the Label gets renamed and the new value is invalid and multiple validators are available", function(assert) {
			addValidators(this.oLayoutOverlay.getDesignTimeMetadata(), [
				{
					validatorFunction: function() {
						return false;
					},
					errorMessage: "invalid"
				},
				"noEmptyText"
			]);
			return triggerAndWaitForStartEdit(this.oRenamePlugin, this.oLayoutOverlay).then(function() {
				this.oRenamePlugin._$oEditableControlDomRef.text("");
				this.oRenamePlugin._$editableField.text(this.oRenamePlugin._$oEditableControlDomRef.text());
				return triggerAndWaitForStopEdit(this.oRenamePlugin);
			}.bind(this))
			.then(function() {
				assert.equal(this.oShowMessageBoxStub.callCount, 1, "the error was shown");
				assert.equal(this.oShowMessageBoxStub.lastCall.args[1], "RENAME_ERROR_TITLE", "the correct error text was passed");
				assert.equal(this.oShowMessageBoxStub.lastCall.args[2], "invalid", "the correct error text was passed");
				assert.ok(this.oLayoutOverlay.hasStyleClass(RenameHandler.errorStyleClass), "the error style class is set");
			}.bind(this));
		});

		QUnit.test("when the Label gets modified with DELETE key", function(assert) {
			var fnDone = assert.async();
			triggerAndWaitForStartEdit(this.oRenamePlugin, this.oLayoutOverlay).then(function() {
				var oSpy = sandbox.spy();
				this.oLayoutOverlay.attachBrowserEvent("keydown", oSpy);

				triggerEventOnEditableField(this.oRenamePlugin, KeyCodes.DELETE);

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
				this.oRenamePlugin._$oEditableControlDomRef.text("foo");
				this.oRenamePlugin._$editableField.text(this.oRenamePlugin._$oEditableControlDomRef.text());

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
	});

	QUnit.module("Given a Rename plugin...", {
		beforeEach: function() {
			this.oRenamePlugin = new RenamePlugin({
				commandFactory: new CommandFactory()
			});
		},
		afterEach: function() {
			this.oRenamePlugin.destroy();
		}
	}, function() {
		QUnit.test('when the user tries to rename a field to empty string ("")', function(assert) {
			this.oRenamePlugin._$editableField = {
				text: function() {
					return "";
				}
			};
			assert.strictEqual(RenameHandler._getCurrentEditableFieldText.call(this.oRenamePlugin), "\xa0", "then the empty string is replaced by a non-breaking space");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
