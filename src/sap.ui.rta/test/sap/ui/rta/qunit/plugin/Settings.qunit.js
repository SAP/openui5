/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/base/Log",
	"sap/m/Button",
	"sap/ui/base/ManagedObject",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/changeHandler/PropertyChange",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/rta/command/Annotation",
	"sap/ui/rta/command/AppDescriptorCommand",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/command/Settings",
	"sap/ui/rta/command/Stack",
	"sap/ui/rta/plugin/Settings",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	sinon,
	BaseLog,
	Button,
	ManagedObject,
	DesignTime,
	ElementOverlay,
	ElementDesignTimeMetadata,
	OverlayRegistry,
	ChangesWriteAPI,
	PropertyChange,
	VerticalLayout,
	AnnotationCommand,
	AppDescriptorCommand,
	CommandFactory,
	SettingsCommand,
	Stack,
	SettingsPlugin,
	RtaQunitUtils,
	nextUIUpdate
) {
	"use strict";

	const sDefaultSettingsIcon = "sap-icon://key-user-settings";
	const oCompleteChangeContentStub = sinon.stub(PropertyChange, "completeChangeContent");
	const oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon);

	const sandbox = sinon.createSandbox();

	function createOverlayWithSettingsAction(oElement, vSettingsAction, bNoFunction) {
		const oSettingsAction = bNoFunction ? vSettingsAction : function() {
			return vSettingsAction;
		};
		return new ElementOverlay({
			element: oElement,
			designTimeMetadata: new ElementDesignTimeMetadata({
				data: {
					actions: {
						settings: oSettingsAction
					}
				}
			})
		});
	}

	QUnit.module("Given a designTime and settings plugin are instantiated", {
		async beforeEach() {
			sandbox.stub(ChangesWriteAPI, "getChangeHandler").resolves();
			sandbox.stub(ChangesWriteAPI, "create").resolves({
				getSupportInformation() {
					return {};
				},
				setSupportInformation() {}
			});
			sandbox.stub(ChangesWriteAPI, "apply").resolves({success: true});

			this.oCommandStack = new Stack();
			this.oSettingsPlugin = new SettingsPlugin({
				commandFactory: new CommandFactory(),
				commandStack: this.oCommandStack
			});
			this.oButton = new Button("button", {text: "Button"});
			this.oVerticalLayout = new VerticalLayout({
				content: [this.oButton]
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach() {
			sandbox.restore();
			this.oVerticalLayout.destroy();
		}
	}, function() {
		QUnit.test("when an overlay has no settings action designTime metadata", function(assert) {
			const fnDone = assert.async();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVerticalLayout],
				plugins: [this.oSettingsPlugin],
				designTimeMetadata: {
					"sap.m.Button": {
						actions: {}
					}
				}
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				const oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				this.oSettingsPlugin.deregisterElementOverlay(oButtonOverlay);
				this.oSettingsPlugin.registerElementOverlay(oButtonOverlay);

				assert.strictEqual(
					this.oSettingsPlugin.isAvailable([oButtonOverlay]), false, "... then isAvailable is called, then it returns false"
				);
				assert.strictEqual(
					this.oSettingsPlugin.isEnabled([oButtonOverlay]), false, "... then isEnabled is called, then it returns false"
				);
				assert.strictEqual(
					this.oSettingsPlugin._isEditable(oButtonOverlay), false, "then the overlay is not editable"
				);

				this.oDesignTime.destroy();
				fnDone();
			}.bind(this));
		});

		QUnit.test("when an overlay has settings action designTime metadata, but has no isEnabled property defined", function(assert) {
			const fnDone = assert.async();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVerticalLayout],
				plugins: [this.oSettingsPlugin],
				designTimeMetadata: {
					"sap.m.Button": {
						actions: {
							settings() {
								return {
									handler() {}
								};
							}
						}
					}
				}
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				const oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				this.oSettingsPlugin.deregisterElementOverlay(oButtonOverlay);
				this.oSettingsPlugin.registerElementOverlay(oButtonOverlay);

				assert.strictEqual(
					this.oSettingsPlugin.isAvailable([oButtonOverlay]), true, "... then isAvailable is called, then it returns true"
				);
				assert.strictEqual(
					this.oSettingsPlugin.isEnabled([oButtonOverlay]), true, "... then isEnabled is called, then it returns true"
				);
				assert.strictEqual(this.oSettingsPlugin._isEditable(oButtonOverlay), true, "then the overlay is editable");

				this.oDesignTime.destroy();
				fnDone();
			}.bind(this));
		});

		QUnit.test("when an overlay has settings action designTime metadata, and isEnabled property is boolean", function(assert) {
			const fnDone = assert.async();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVerticalLayout],
				plugins: [this.oSettingsPlugin],
				designTimeMetadata: {
					"sap.m.Button": {
						actions: {
							settings() {
								return {
									isEnabled: false,
									handler() {}
								};
							}
						}
					}
				}
			});

			this.oDesignTime.attachEventOnce("synced", async function() {
				const oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				this.oSettingsPlugin.deregisterElementOverlay(oButtonOverlay);
				this.oSettingsPlugin.registerElementOverlay(oButtonOverlay);

				assert.strictEqual(
					this.oSettingsPlugin.isAvailable([oButtonOverlay]), true, "... then isAvailable is called, then it returns true"
				);
				assert.strictEqual(
					this.oSettingsPlugin.isEnabled([oButtonOverlay]), false, "... then isEnabled is called, then it returns correct value"
				);
				assert.strictEqual(this.oSettingsPlugin._isEditable(oButtonOverlay), true, "then the overlay is editable");
				const oMenuItems = await this.oSettingsPlugin.getMenuItems([oButtonOverlay]);
				assert.strictEqual(oMenuItems[0].icon, sDefaultSettingsIcon, "then the correct icon parameter is set");
				this.oDesignTime.destroy();
				fnDone();
			}.bind(this));
		});

		QUnit.test("when an overlay has settings action designTime metadata, and isEnabled is function", function(assert) {
			const fnDone = assert.async();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVerticalLayout],
				plugins: [this.oSettingsPlugin],
				designTimeMetadata: {
					"sap.m.Button": {
						actions: {
							settings() {
								return {
									isEnabled(oElementInstance) {
										return oElementInstance.getMetadata().getName() !== "sap.m.Button";
									}
								};
							}
						}
					}
				}
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				const oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				this.oSettingsPlugin.deregisterElementOverlay(oButtonOverlay);
				this.oSettingsPlugin.registerElementOverlay(oButtonOverlay);

				assert.strictEqual(
					this.oSettingsPlugin.isAvailable([oButtonOverlay]), false, "... then isAvailable is called, then it returns false"
				);
				assert.strictEqual(
					this.oSettingsPlugin.isEnabled([oButtonOverlay]),
					false,
					"... then isEnabled is called, then it returns correct value from function call"
				);
				assert.strictEqual(
					this.oSettingsPlugin._isEditable(oButtonOverlay),
					false,
					"then the overlay is not editable because the handler is missing"
				);

				this.oDesignTime.destroy();
				fnDone();
			}.bind(this));
		});

		QUnit.test("when an overlay has settings action designTime metadata, and icon property is string", function(assert) {
			const fnDone = assert.async();
			const sIcon = "sap-icon://myIcon";

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVerticalLayout],
				plugins: [this.oSettingsPlugin],
				designTimeMetadata: {
					"sap.m.Button": {
						actions: {
							settings() {
								return {
									isEnabled: true,
									icon: sIcon,
									handler() {}
								};
							}
						}
					}
				}
			});

			this.oDesignTime.attachEventOnce("synced", async function() {
				const oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				this.oSettingsPlugin.deregisterElementOverlay(oButtonOverlay);
				this.oSettingsPlugin.registerElementOverlay(oButtonOverlay);

				assert.strictEqual(
					this.oSettingsPlugin.isAvailable([oButtonOverlay]), true, "... then isAvailable is called, then it returns true"
				);
				assert.strictEqual(
					this.oSettingsPlugin.isEnabled([oButtonOverlay]), true, "... then isEnabled is called, then it returns correct value"
				);
				assert.strictEqual(this.oSettingsPlugin._isEditable(oButtonOverlay), true, "then the overlay is editable");
				const oMenuItems = await this.oSettingsPlugin.getMenuItems([oButtonOverlay]);
				assert.strictEqual(oMenuItems[0].icon, sIcon, "then the correct icon parameter is set");

				this.oDesignTime.destroy();
				fnDone();
			}.bind(this));
		});

		QUnit.test("when the handle settings function is called and the handler returns a change object,", function(assert) {
			const done = assert.async();
			const oSettingsChange = {
				selectorElement: this.oButton,
				changeSpecificData: {
					changeType: "changeSettings",
					content: "testchange"
				}
			};

			const oButtonOverlay = createOverlayWithSettingsAction(this.oButton, {
				isEnabled: true,
				handler() {
					return new Promise(function(resolve) {
						resolve([oSettingsChange]);
					});
				}
			});
			const aSelectedOverlays = [oButtonOverlay];

			const fnAssertSpy = sandbox.spy(ManagedObject.prototype, "applySettings");

			this.oSettingsPlugin.attachEventOnce("elementModified", function(oEvent) {
				const mPassedSettings = fnAssertSpy.getCall(1).args[0];
				const bHasSelector = Object.keys(mPassedSettings).some(function(sKey) {
					return sKey === "selector";
				});
				assert.notOk(bHasSelector, "the selector is not part of the passed settings");
				const oCompositeCommand = oEvent.getParameter("command");
				assert.ok(oCompositeCommand, "Composite command is created");
				const oSettingsCommand = oCompositeCommand.getCommands()[0];
				assert.ok(oSettingsCommand, "... which contains a settings command");
				done();
			});
			return this.oSettingsPlugin.handler(aSelectedOverlays, { eventItem: {}, contextElement: this.oButton }, {});
		});

		QUnit.test("when the handle settings function is called and the handler returns a an empty change object,", function(assert) {
			const oButtonOverlay = createOverlayWithSettingsAction(this.oButton, {
				isEnabled: true,
				handler() {
					return new Promise(function(resolve) {
						resolve([]);
					});
				}
			});

			const oCommandFactory = this.oSettingsPlugin.getCommandFactory();
			const oGetCommandForSpy = sinon.spy(oCommandFactory, "getCommandFor");
			const oFireEventSpy = sinon.spy(this.oSettingsPlugin, "fireElementModified");
			const aSelectedOverlays = [oButtonOverlay];

			return this.oSettingsPlugin.handler(aSelectedOverlays, { eventItem: {}, contextElement: this.oButton })

			.then(function() {
				assert.strictEqual(oGetCommandForSpy.callCount, 0, "then commandFactory.getCommandFor function is not called");
				assert.strictEqual(oFireEventSpy.callCount, 0, "then commandFactory.fireElementModified function is not called");
				assert.ok(true, "CompositeCommand is not created");
			});
		});

		QUnit.test("when the handle settings function is called and no handler is present in Designtime Metadata,", function(assert) {
			const oButtonOverlay = createOverlayWithSettingsAction(this.oButton, {
				isEnabled: true
			});

			const aSelectedOverlays = [oButtonOverlay];

			assert.throws(
				function() {
					this.oSettingsPlugin.handler(aSelectedOverlays, { eventItem: {}, contextElement: this.oButton });
				},
				/Handler not found/,
				"an error message is raised referring to the missing handler"
			);
		});

		QUnit.test("when the handle settings function is called and the handler returns a rejected promise with error object,", function(assert) {
			const oButtonOverlay = createOverlayWithSettingsAction(this.oButton, {
				isEnabled: true,
				handler() {
					return new Promise(function(resolve, reject) {
						reject(Error("Test"));
					});
				}
			});

			const aSelectedOverlays = [oButtonOverlay];

			return this.oSettingsPlugin.handler(aSelectedOverlays, { eventItem: {}, contextElement: this.oButton })

			.catch(function() {
				assert.notOk(this.oSettingsCommand, "... command is not created");
			}.bind(this));
		});

		[true, false].forEach(function(bVariantIndependent) {
			let sMessage = "when the handle settings function is called and a variantManagementReference is present";
			if (bVariantIndependent) {
				sMessage += " and variantIndependent is set";
			}
			QUnit.test(sMessage, function(assert) {
				const done = assert.async();
				const oSettingsChange = {
					selectorElement: this.oButton,
					changeSpecificData: {
						changeType: "changeSettings",
						content: "testchange"
					}
				};

				const oButtonOverlay = createOverlayWithSettingsAction(this.oButton, {
					isEnabled: true,
					handler() {
						return new Promise(function(resolve) {
							resolve([oSettingsChange]);
						});
					}
				});
				// this mix-in would normally be done by the ControlVariant plugin
				oButtonOverlay.getVariantManagement = function() {
					return "myVMR";
				};
				sandbox.stub(oMockedAppComponent, "getModel").returns({
					getCurrentVariantReference() {
						return "currentVR";
					}
				});
				const aSelectedOverlays = [oButtonOverlay];

				this.oSettingsPlugin.attachEventOnce("elementModified", function() {
					const oChangeSpecificData = ChangesWriteAPI.create.firstCall.args[0].changeSpecificData;
					if (bVariantIndependent) {
						assert.notOk(
							oChangeSpecificData.variantManagementReference,
							"the variantManagementReference is not part of the changeSpecificData"
						);
						assert.notOk(oChangeSpecificData.variantReference, "the variantReference is not part of the changeSpecificData");
					} else {
						assert.deepEqual(
							oChangeSpecificData.variantManagementReference,
							"myVMR",
							"the variantManagementReference is part of the changeSpecificData"
						);
						assert.deepEqual(
							oChangeSpecificData.variantReference,
							"currentVR",
							"the variantReference is part of the changeSpecificData"
						);
					}
					done();
				});
				return this.oSettingsPlugin.handler(
					aSelectedOverlays,
					{ eventItem: {}, contextElement: this.oButton },
					// eslint-disable-next-line camelcase
					{CAUTION_variantIndependent: bVariantIndependent}
				);
			});
		});

		QUnit.test("when two changes are on the command stack,", function(assert) {
			return this.oSettingsPlugin.getCommandFactory().getCommandFor(
				{
					id: "stableNavPopoverId",
					controlType: "sap.m.Button",
					appComponent: oMockedAppComponent
				},
				"settings",
				{
					changeType: "changeSettings",
					content: "testchange1"
				},
				new ElementDesignTimeMetadata({
					data: {
						actions: {
							settings() {}
						}
					}
				})
			)

			.then(function(oSettingsCommand) {
				return this.oCommandStack.pushAndExecute(oSettingsCommand);
			}.bind(this))

			.then(function() {
				return this.oSettingsPlugin.getCommandFactory().getCommandFor(
					{
						id: "stableNavPopoverId",
						controlType: "sap.m.Button",
						appComponent: oMockedAppComponent
					},
					"settings",
					{
						changeType: "changeSettings",
						content: "testchange2"
					},
					new ElementDesignTimeMetadata({
						data: {
							actions: {
								settings() {}
							}
						}
					})
				);
			}.bind(this))

			.then(function(oSettingsCommand) {
				return this.oCommandStack.pushAndExecute(oSettingsCommand);
			}.bind(this))

			.then(function() {
				const aUnsavedChanges = this.oSettingsPlugin._getUnsavedChanges("stableNavPopoverId", ["changeSettings"]);
				assert.strictEqual(aUnsavedChanges.length, 2, "these commands are returned by _getUnsavedChanges");
			}.bind(this));
		});

		QUnit.test("when the handle settings function is called and the handler returns a change object with an app descriptor change,", function(assert) {
			const done = assert.async();
			const mAppDescriptorChange = {
				appComponent: oMockedAppComponent,
				changeSpecificData: {
					appDescriptorChangeType: "appDescriptorChangeType",
					content: {
						parameters: {
							param1: "param1"
						},
						texts: {
							text1: "text1"
						}
					}
				}
			};

			const oButtonOverlay = createOverlayWithSettingsAction(this.oButton, {
				isEnabled: true,
				handler() {
					return new Promise(function(resolve) {
						resolve([mAppDescriptorChange]);
					});
				}
			});

			this.oSettingsPlugin.attachEventOnce("elementModified", function(oEvent) {
				const oCompositeCommand = oEvent.getParameter("command");
				assert.ok(oCompositeCommand, "Composite command is created");
				const oAppDescriptorCommand = oCompositeCommand.getCommands()[0];
				assert.ok(oAppDescriptorCommand instanceof AppDescriptorCommand, "... which contains an App Descriptor command...");
				assert.strictEqual(oAppDescriptorCommand.getAppComponent(), oMockedAppComponent, "with the correct app component");
				assert.strictEqual(oAppDescriptorCommand.getReference(), "someName", "with the correct reference");
				assert.strictEqual(
					oAppDescriptorCommand.getChangeType(),
					mAppDescriptorChange.changeSpecificData.appDescriptorChangeType,
					"with the correct change type"
				);
				assert.strictEqual(
					oAppDescriptorCommand.getParameters(),
					mAppDescriptorChange.changeSpecificData.content.parameters,
					"with the correct parameters"
				);
				assert.strictEqual(
					oAppDescriptorCommand.getTexts(),
					mAppDescriptorChange.changeSpecificData.content.texts,
					"with the correct texts"
				);

				done();
			});
			return this.oSettingsPlugin.handler([oButtonOverlay], { eventItem: {}, contextElement: this.oButton });
		});

		QUnit.test("when the handle settings function is called and the handler returns a change object with an annotation change,", function(assert) {
			const done = assert.async();
			const mAnnotationChange = {
				changeSpecificData: {
					annotationChangeType: "annotationChangeType",
					content: {
						dummyContent: "dummyContent"
					}
				}
			};

			const oButtonOverlay = createOverlayWithSettingsAction(this.oButton, {
				isEnabled: true,
				handler() {
					return new Promise(function(resolve) {
						resolve([mAnnotationChange]);
					});
				}
			});

			this.oSettingsPlugin.attachEventOnce("elementModified", function(oEvent) {
				const oCompositeCommand = oEvent.getParameter("command");
				assert.ok(oCompositeCommand, "Composite command is created");
				const oAnnotationCommand = oCompositeCommand.getCommands()[0];
				assert.ok(oAnnotationCommand instanceof AnnotationCommand, "... which contains an AnnotationCommand...");
				assert.strictEqual(
					oAnnotationCommand.getChangeType(),
					mAnnotationChange.changeSpecificData.annotationChangeType,
					"with the correct change type"
				);
				assert.strictEqual(
					oAnnotationCommand.getContent(),
					mAnnotationChange.changeSpecificData.content,
					"with the correct content"
				);

				done();
			});
			return this.oSettingsPlugin.handler([oButtonOverlay], { eventItem: {}, contextElement: this.oButton });
		});

		QUnit.test("when the handle settings function is called and the handler returns a change object with an app descriptor change and a flex change,", function(assert) {
			const done = assert.async();
			const mAppDescriptorChange = {
				appComponent: oMockedAppComponent,
				changeSpecificData: {
					appDescriptorChangeType: "appDescriptorChangeType",
					content: {
						parameters: {
							param1: "param1"
						},
						texts: {
							text1: "text1"
						}
					}
				}
			};
			const mSettingsChange = {
				selectorElement: {
					id: "stableNavPopoverId",
					controlType: "sap.m.Button",
					appComponent: oMockedAppComponent
				},
				changeSpecificData: {
					changeType: "changeSettings",
					content: "testchange"
				}
			};

			const oButtonOverlay = createOverlayWithSettingsAction(this.oButton, {
				isEnabled: true,
				handler() {
					return new Promise(function(resolve) {
						resolve([mAppDescriptorChange, mSettingsChange]);
					});
				}
			});

			this.oSettingsPlugin.attachEventOnce("elementModified", function(oEvent) {
				const oCompositeCommand = oEvent.getParameter("command");
				assert.ok(oCompositeCommand, "Composite command is created");
				const oAppDescriptorCommand = oCompositeCommand.getCommands()[0];
				const oFlexCommand = oCompositeCommand.getCommands()[1];
				assert.ok(oAppDescriptorCommand instanceof AppDescriptorCommand, "... containing an AnnotationCommand");
				assert.strictEqual(oAppDescriptorCommand.getAppComponent(), oMockedAppComponent, "with the correct app component");
				assert.strictEqual(oAppDescriptorCommand.getReference(), "someName", "with the correct reference");
				assert.strictEqual(
					oAppDescriptorCommand.getChangeType(),
					mAppDescriptorChange.changeSpecificData.appDescriptorChangeType,
					"with the correct change type"
				);
				assert.strictEqual(
					oAppDescriptorCommand.getParameters(),
					mAppDescriptorChange.changeSpecificData.content.parameters,
					"with the correct parameters"
				);
				assert.strictEqual(
					oAppDescriptorCommand.getTexts(),
					mAppDescriptorChange.changeSpecificData.content.texts,
					"with the correct texts"
				);
				assert.ok(oFlexCommand instanceof SettingsCommand, "... and a (flex) SettingsCommand");
				assert.strictEqual(oFlexCommand.getSelector().appComponent, oMockedAppComponent, "with the correct app component");
				assert.strictEqual(
					oFlexCommand.getChangeType(), mSettingsChange.changeSpecificData.changeType, "with the correct change type"
				);
				assert.strictEqual(oFlexCommand.getContent(), mSettingsChange.changeSpecificData.content, "with the correct parameters");
				done();
			});
			return this.oSettingsPlugin.handler([oButtonOverlay], { eventItem: {}, contextElement: this.oButton }, {});
		});

		QUnit.test("when the handle settings function is called and the handler returns a change object with an annotation change and a flex change,", function(assert) {
			const done = assert.async();
			const mAnnotationChange = {
				changeSpecificData: {
					annotationChangeType: "annotationChangeType",
					content: {
						dummyContent: "dummyContent"
					}
				}
			};
			const mSettingsChange = {
				selectorElement: {
					id: "stableNavPopoverId",
					controlType: "sap.m.Button",
					appComponent: oMockedAppComponent
				},
				changeSpecificData: {
					changeType: "changeSettings",
					content: "testchange"
				}
			};

			const oButtonOverlay = createOverlayWithSettingsAction(this.oButton, {
				isEnabled: true,
				handler() {
					return new Promise(function(resolve) {
						resolve([mAnnotationChange, mSettingsChange]);
					});
				}
			});

			this.oSettingsPlugin.attachEventOnce("elementModified", function(oEvent) {
				const oCompositeCommand = oEvent.getParameter("command");
				assert.ok(oCompositeCommand, "Composite command is created");
				const oAnnotationCommand = oCompositeCommand.getCommands()[0];
				const oFlexCommand = oCompositeCommand.getCommands()[1];
				assert.ok(oAnnotationCommand instanceof AnnotationCommand, "... containing an AnnotationCommand");
				assert.strictEqual(
					oAnnotationCommand.getChangeType(),
					mAnnotationChange.changeSpecificData.annotationChangeType,
					"with the correct change type"
				);
				assert.strictEqual(
					oAnnotationCommand.getContent(),
					mAnnotationChange.changeSpecificData.content,
					"with the correct content"
				);
				assert.ok(oFlexCommand instanceof SettingsCommand, "... and a (flex) SettingsCommand");
				assert.strictEqual(oFlexCommand.getSelector().appComponent, oMockedAppComponent, "with the correct app component");
				assert.strictEqual(
					oFlexCommand.getChangeType(), mSettingsChange.changeSpecificData.changeType, "with the correct change type"
				);
				assert.strictEqual(oFlexCommand.getContent(), mSettingsChange.changeSpecificData.content, "with the correct parameters");
				done();
			});
			return this.oSettingsPlugin.handler([oButtonOverlay], { eventItem: {}, contextElement: this.oButton }, {});
		});

		QUnit.test("when the handle settings function is called and the handler returns a change object with annotation, app descriptor and flex changes,", function(assert) {
			const done = assert.async();
			const mAnnotationChange = {
				changeSpecificData: {
					annotationChangeType: "annotationChangeType",
					content: {
						dummyContent: "dummyContent"
					}
				}
			};
			const mAppDescriptorChange = {
				appComponent: oMockedAppComponent,
				changeSpecificData: {
					appDescriptorChangeType: "appDescriptorChangeType",
					content: {
						parameters: {
							param1: "param1"
						},
						texts: {
							text1: "text1"
						}
					}
				}
			};
			const mSettingsChange = {
				selectorElement: {
					id: "stableNavPopoverId",
					controlType: "sap.m.Button",
					appComponent: oMockedAppComponent
				},
				changeSpecificData: {
					changeType: "changeSettings",
					content: "testchange"
				}
			};

			const oButtonOverlay = createOverlayWithSettingsAction(this.oButton, {
				isEnabled: true,
				handler() {
					return new Promise(function(resolve) {
						resolve([mAnnotationChange, mAppDescriptorChange, mSettingsChange]);
					});
				}
			});

			this.oSettingsPlugin.attachEventOnce("elementModified", function(oEvent) {
				const oCompositeCommand = oEvent.getParameter("command");
				assert.ok(oCompositeCommand, "Composite command is created");
				const oAnnotationCommand = oCompositeCommand.getCommands()[0];
				const oAppDescriptorCommand = oCompositeCommand.getCommands()[1];
				const oFlexCommand = oCompositeCommand.getCommands()[2];
				assert.ok(oAnnotationCommand instanceof AnnotationCommand, "... containing an AnnotationCommand");
				assert.strictEqual(
					oAnnotationCommand.getChangeType(),
					mAnnotationChange.changeSpecificData.annotationChangeType,
					"with the correct change type"
				);
				assert.strictEqual(
					oAnnotationCommand.getContent(),
					mAnnotationChange.changeSpecificData.content,
					"with the correct content"
				);
				assert.ok(oAppDescriptorCommand instanceof AppDescriptorCommand, "... and an AppDescriptorCommand");
				assert.strictEqual(oAppDescriptorCommand.getAppComponent(), oMockedAppComponent, "with the correct app component");
				assert.strictEqual(oAppDescriptorCommand.getReference(), "someName", "with the correct reference");
				assert.strictEqual(
					oAppDescriptorCommand.getChangeType(),
					mAppDescriptorChange.changeSpecificData.appDescriptorChangeType,
					"with the correct change type"
				);
				assert.strictEqual(
					oAppDescriptorCommand.getParameters(),
					mAppDescriptorChange.changeSpecificData.content.parameters,
					"with the correct parameters"
				);
				assert.strictEqual(
					oAppDescriptorCommand.getTexts(),
					mAppDescriptorChange.changeSpecificData.content.texts,
					"with the correct texts"
				);
				assert.ok(oFlexCommand instanceof SettingsCommand, "... and a (flex) SettingsCommand");
				assert.strictEqual(oFlexCommand.getSelector().appComponent, oMockedAppComponent, "with the correct app component");
				assert.strictEqual(
					oFlexCommand.getChangeType(), mSettingsChange.changeSpecificData.changeType, "with the correct change type"
				);
				assert.strictEqual(oFlexCommand.getContent(), mSettingsChange.changeSpecificData.content, "with the correct parameters");
				done();
			});
			return this.oSettingsPlugin.handler([oButtonOverlay], { eventItem: {}, contextElement: this.oButton }, {});
		});

		QUnit.test("when retrieving the context menu item for single 'settings' action", async function(assert) {
			const oButtonOverlay = createOverlayWithSettingsAction(this.oButton, {
				handler() {}
			});

			// Simulate that editableByPlugin was not evaluated yet
			const oEditableByPluginStub = sandbox.stub(this.oSettingsPlugin, "_isEditableByPlugin").returns(undefined);
			sandbox.stub(this.oSettingsPlugin, "evaluateEditable").callsFake(() => {
				assert.ok(true, "then the evaluateEditable function is called");
				oEditableByPluginStub.restore();
				return Promise.resolve();
			});

			let bIsAvailable = true;
			sandbox.stub(this.oSettingsPlugin, "isAvailable").callsFake(function(aElementOverlays) {
				assert.strictEqual(
					aElementOverlays[0].getId(),
					oButtonOverlay.getId(),
					"the 'available' function calls isAvailable with the correct overlay"
				);
				return bIsAvailable;
			});
			sandbox.stub(this.oSettingsPlugin, "handler").callsFake(function(aOverlays) {
				assert.deepEqual(aOverlays, [oButtonOverlay], "the 'handler' method is called with the right overlays");
			});
			sandbox.stub(this.oSettingsPlugin, "isEnabled").callsFake(function(aElementOverlays) {
				assert.strictEqual(
					aElementOverlays[0].getId(), oButtonOverlay.getId(), "the 'enabled' function calls isEnabled with the correct overlay"
				);
			});

			const aMenuItems = await this.oSettingsPlugin.getMenuItems([oButtonOverlay]);
			assert.strictEqual(aMenuItems[0].id, "CTX_SETTINGS", "'getMenuItems' returns the context menu item for the plugin");

			aMenuItems[0].handler([oButtonOverlay]);

			bIsAvailable = false;
			assert.strictEqual(
				(await this.oSettingsPlugin.getMenuItems([oButtonOverlay])).length,
				0,
				"and if plugin is not available for the overlay, no menu items are returned"
			);
		});

		QUnit.test("when retrieving the context menu item for single 'settings' action with a submenu", async function(assert) {
			const oButtonOverlay = createOverlayWithSettingsAction(this.oButton, {
				handler() {},
				submenu: [
					{
						name: "subEntry0",
						icon: "sap-icon://accept",
						enabled: true,
						key: "foo"
					},
					{
						enabled: false
					},
					{
						name: "subEntry2",
						key: "bar"
					}
				]
			});

			const bIsAvailable = true;
			sandbox.stub(this.oSettingsPlugin, "isAvailable").callsFake(function(aElementOverlays) {
				assert.strictEqual(
					aElementOverlays[0].getId(),
					oButtonOverlay.getId(),
					"the 'available' function calls isAvailable with the correct overlay"
				);
				return bIsAvailable;
			});

			const oMenuItem = (await this.oSettingsPlugin.getMenuItems([oButtonOverlay]))[0];
			assert.strictEqual(oMenuItem.id, "CTX_SETTINGS", "'getMenuItems' returns the context menu item for the plugin");
			assert.deepEqual(oMenuItem.submenu[0], {
				id: "foo",
				text: "subEntry0",
				icon: "sap-icon://accept",
				enabled: true
			}, "the submennu entry 0 is correct");
			assert.deepEqual(oMenuItem.submenu[1], {
				id: "CTX_SETTINGS_SUB_1",
				text: "",
				icon: "blank",
				enabled: false
			}, "the submennu entry 1 is correct");
			assert.deepEqual(oMenuItem.submenu[2], {
				id: "bar",
				text: "subEntry2",
				icon: "blank",
				enabled: true
			}, "the submennu entry 2 is correct");
		});

		QUnit.test("when retrieving the context menu items and executing two 'settings' actions", async function(assert) {
			const done1 = assert.async();
			const done2 = assert.async();

			const mAction1Change = {
				selectorElement: this.oButton,
				changeSpecificData: {
					changeType: "changeSettings",
					content: "testchange1"
				}
			};

			const mAction2Change = {
				selectorElement: this.oButton,
				changeSpecificData: {
					changeType: "changeSettings",
					content: "testchange2"
				}
			};

			const oButtonOverlay = createOverlayWithSettingsAction(this.oButton, [
				{
					name: "CTX_ACTION1",
					handler() {
						return new Promise(function(resolve) {
							resolve([mAction1Change]);
						});
					},
					runtimeOnly: true
				},
				{
					name() {
						return "Action 2 Name";
					},
					handler() {
						return new Promise(function(resolve) {
							resolve([mAction2Change]);
						});
					}
				}
			]);

			sandbox.stub(this.oSettingsPlugin, "isAvailable").returns(true);

			let bFirstChange = true;

			this.oSettingsPlugin.attachEvent("elementModified", function(oEvent) {
				if (bFirstChange) {
					const oCompositeCommand1 = oEvent.getParameter("command");
					const oFlexCommand1 = oCompositeCommand1.getCommands()[0];
					assert.strictEqual(oFlexCommand1.getSelector().appComponent, oMockedAppComponent, "with the correct app component");
					assert.strictEqual(
						oFlexCommand1.getChangeType(), mAction1Change.changeSpecificData.changeType, "with the correct change type"
					);
					assert.strictEqual(
						oFlexCommand1.getContent(), mAction1Change.changeSpecificData.content, "with the correct parameters"
					);
					assert.strictEqual(oFlexCommand1.getRuntimeOnly(), true, "the runtimeOnly property is set");
					bFirstChange = false;
					done1();
				} else {
					const oCompositeCommand2 = oEvent.getParameter("command");
					const oFlexCommand2 = oCompositeCommand2.getCommands()[0];
					assert.strictEqual(oFlexCommand2.getSelector().appComponent, oMockedAppComponent, "with the correct app component");
					assert.strictEqual(
						oFlexCommand2.getChangeType(), mAction2Change.changeSpecificData.changeType, "with the correct change type"
					);
					assert.strictEqual(
						oFlexCommand2.getContent(), mAction2Change.changeSpecificData.content, "with the correct parameters"
					);
					assert.notOk(oFlexCommand2.getRuntimeOnly(), "the runtimeOnly property is not set");
					done2();
				}
			});

			const aMenuItems = await this.oSettingsPlugin.getMenuItems([oButtonOverlay]);
			assert.strictEqual(aMenuItems[0].id, "CTX_SETTINGS0", "'getMenuItems' returns the context menu item for action 1");
			assert.strictEqual(aMenuItems[0].rank, 110, "'getMenuItems' returns the correct item rank for action 1");
			assert.strictEqual(aMenuItems[0].icon, sDefaultSettingsIcon, "'getMenuItems' returns the default item icon for action 1");
			aMenuItems[0].handler([oButtonOverlay]);
			assert.strictEqual(aMenuItems[1].id, "CTX_SETTINGS1", "'getMenuItems' returns the context menu item for action 2");
			assert.strictEqual(aMenuItems[1].text, "Action 2 Name", "'getMenuItems' returns the correct item text for action 2");
			assert.strictEqual(aMenuItems[1].rank, 111, "'getMenuItems' returns the correct item rank for action 2");
			assert.strictEqual(aMenuItems[1].icon, sDefaultSettingsIcon, "'getMenuItems' returns the default item icon for action 2");
			aMenuItems[1].handler([oButtonOverlay]);
		});

		QUnit.test("when retrieving the context menu items for two 'settings' actions, but one does not have a handler", async function(assert) {
			const done = assert.async();

			const mAction1Change = {
				selectorElement: this.oButton,
				changeSpecificData: {
					changeType: "changeSettings",
					content: "testchange1"
				}
			};

			const oButtonOverlay = createOverlayWithSettingsAction(this.oButton, {
				CTX_ACTION1: {
					name: "CTX_ACTION1",
					handler() {
						return new Promise(function(resolve) {
							resolve([mAction1Change]);
						});
					}
				},
				AnotherId: {
					name: "CTX_ACTION2"
				}
			});

			sandbox.stub(this.oSettingsPlugin, "isAvailable").returns(true);

			this.oSettingsPlugin.attachEvent("elementModified", function(oEvent) {
				const oCompositeCommand = oEvent.getParameter("command");
				assert.strictEqual(oCompositeCommand.getCommands().length, 1, "but the action with the handler can still be executed");
				done();
			});

			const spyLog = sinon.spy(BaseLog, "warning");

			const aMenuItems = await this.oSettingsPlugin.getMenuItems([oButtonOverlay]);
			assert.strictEqual(aMenuItems[0].id, "CTX_SETTINGS0", "'getMenuItems' returns the context menu item for action 1");
			assert.strictEqual(aMenuItems[0].rank, 110, "'getMenuItems' returns the correct item rank for action 1");
			aMenuItems[0].handler([oButtonOverlay]);
			assert.strictEqual(aMenuItems.length, 1, "'getMenuItems' only returns menu item for actions with handlers");
			assert.strictEqual(spyLog.callCount, 1, "then there is a warning in the log saying the handler was not found for action 2");
		});

		QUnit.test("when retrieving the menu items for two 'settings', one has changeOnRelevantContainer true and the relevant container doesn't have a stable id", async function(assert) {
			const oButtonOverlay = createOverlayWithSettingsAction(this.oButton, {
				Action1: {
					name: "CTX_ACTION1",
					handler() {}
				},
				Action2: {
					name: "CTX_ACTION2",
					changeOnRelevantContainer: true,
					handler() {}
				}
			});

			const oVerticalLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);

			sandbox.stub(this.oSettingsPlugin, "hasStableId").callsFake(function(oOverlay) {
				if (oOverlay === oVerticalLayoutOverlay) {
					return false;
				}
				return true;
			});

			sandbox.stub(oButtonOverlay, "getRelevantContainer").returns(oVerticalLayoutOverlay);
			sandbox.stub(this.oSettingsPlugin, "isAvailable").returns(true);

			const aMenuItems = await this.oSettingsPlugin.getMenuItems([oButtonOverlay]);
			assert.strictEqual(aMenuItems[0].id, "CTX_SETTINGS0", "'getMenuItems' returns the context menu item for action 1");
			assert.strictEqual(aMenuItems[0].rank, 110, "'getMenuItems' returns the correct item rank for action 1");
			assert.strictEqual(aMenuItems.length, 1, "'getMenuItems' doesn't return the action where the relevant container has no stable id");
			assert.strictEqual(
				this.oSettingsPlugin._isEditable(oButtonOverlay), true, "and _isEditable() returns true because one action is valid"
			);
		});

		QUnit.test("when retrieving the menu items for two 'settings', but both have changeOnRelevantContainer true and the relevant container doesn't have a stable id", async function(assert) {
			const oButtonOverlay = createOverlayWithSettingsAction(this.oButton, {
				Action1: {
					name: "CTX_ACTION1",
					changeOnRelevantContainer: true,
					handler() {}
				},
				Action2: {
					name: "CTX_ACTION2",
					changeOnRelevantContainer: true,
					handler() {}
				}
			});

			const oVerticalLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);

			sandbox.stub(this.oSettingsPlugin, "hasStableId").callsFake(function(oOverlay) {
				if (oOverlay === oVerticalLayoutOverlay) {
					return false;
				}
				return true;
			});

			sandbox.stub(oButtonOverlay, "getRelevantContainer").returns(oVerticalLayoutOverlay);
			sandbox.stub(this.oSettingsPlugin, "isAvailable").returns(true);

			const aMenuItems = await this.oSettingsPlugin.getMenuItems([oButtonOverlay]);
			assert.strictEqual(aMenuItems.length, 0, "then no menu items are returned");
			assert.strictEqual(
				this.oSettingsPlugin._isEditable(oButtonOverlay), false, "and _isEditable() returns false because no actions are valid"
			);
		});

		QUnit.test("when retrieving the context menu items for two 'settings' actions, but one is disabled", async function(assert) {
			const {oButton} = this;

			const oButtonOverlay = createOverlayWithSettingsAction(this.oButton, {
				"Button Settings 1": {
					name() { return "CTX_ACTION1"; },
					handler() {
						return new Promise(function(resolve) {
							resolve([]);
						});
					}
				},
				"Another Button Settings Action": {
					name() { return "CTX_ACTION2"; },
					handler() {
						return new Promise(function(resolve) {
							resolve([]);
						});
					},
					isEnabled(oElement) {
						assert.strictEqual(oElement, oButton, "isEnabled is called with the correct element");
						return false;
					}
				}
			}, true);

			sandbox.stub(this.oSettingsPlugin, "isAvailable").returns(true);

			const aMenuItems = await this.oSettingsPlugin.getMenuItems([oButtonOverlay]);
			assert.strictEqual(aMenuItems[0].text, "CTX_ACTION1", "'getMenuItems' returns the context menu item for action 1");
			assert.strictEqual(aMenuItems[0].enabled, true, "and it is enabled");
			assert.strictEqual(aMenuItems[1].text, "CTX_ACTION2", "'getMenuItems' returns the context menu item for action 2");
			assert.strictEqual(aMenuItems[1].enabled([oButtonOverlay]), false, "and it is disabled");
		});

		QUnit.test("when retrieving the context menu items and executing two 'settings' actions with diffrent icon settings", async function(assert) {
			const sIconAction1 = "sap-icon://myIconAction1";

			const oButtonOverlay = createOverlayWithSettingsAction(this.oButton, [
				{
					name: "CTX_ACTION1",
					icon: sIconAction1,
					handler() {
						return new Promise(function(resolve) {
							resolve([]);
						});
					}
				},
				{
					name() {
						return "Action 2 Name";
					},
					handler() {
						return new Promise(function(resolve) {
							resolve([]);
						});
					}
				},
				{
					name() {
						return "Action 3 Name";
					},
					icon: { name: "icon should be a STRING not an Object" },
					handler() {
						return new Promise(function(resolve) {
							resolve([]);
						});
					}
				}
			]);

			const oLogErrorStub = sandbox.stub(BaseLog, "error");
			sandbox.stub(this.oSettingsPlugin, "isAvailable").returns(true);

			const aMenuItems = await this.oSettingsPlugin.getMenuItems([oButtonOverlay]);
			assert.strictEqual(aMenuItems[0].id, "CTX_SETTINGS0", "'getMenuItems' returns the context menu item for action 1");
			assert.strictEqual(aMenuItems[0].rank, 110, "'getMenuItems' returns the correct item rank for action 1");
			assert.strictEqual(aMenuItems[0].icon, sIconAction1, "'getMenuItems' returns the correct item icon for action 1");
			aMenuItems[0].handler([oButtonOverlay]);
			assert.strictEqual(aMenuItems[1].id, "CTX_SETTINGS1", "'getMenuItems' returns the context menu item for action 2");
			assert.strictEqual(aMenuItems[1].text, "Action 2 Name", "'getMenuItems' returns the correct item text for action 2");
			assert.strictEqual(aMenuItems[1].rank, 111, "'getMenuItems' returns the correct item rank for action 2");
			assert.strictEqual(aMenuItems[1].icon, sDefaultSettingsIcon, "'getMenuItems' returns the default item icon for action 2");
			aMenuItems[1].handler([oButtonOverlay]);
			assert.strictEqual(aMenuItems[2].id, "CTX_SETTINGS2", "'getMenuItems' returns the context menu item for action 3");
			assert.strictEqual(aMenuItems[2].text, "Action 3 Name", "'getMenuItems' returns the correct item text for action 3");
			assert.strictEqual(aMenuItems[2].rank, 112, "'getMenuItems' returns the correct item rank for action 3");
			assert.strictEqual(aMenuItems[2].icon, sDefaultSettingsIcon, "'getMenuItems' returns the default item icon for action 3");
			assert.strictEqual(
				oLogErrorStub.getCall(0).args[0],
				"Icon setting for settingsAction should be a string",
				"'getMenuItems' cause the correct error message for action 3"
			);
			aMenuItems[2].handler([oButtonOverlay]);
		});
	});

	QUnit.done(function() {
		oCompleteChangeContentStub.restore();
		oMockedAppComponent._restoreGetAppComponentStub();
		oMockedAppComponent.destroy();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
