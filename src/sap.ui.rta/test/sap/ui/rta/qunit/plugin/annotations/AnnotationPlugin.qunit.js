/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/m/Button",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/annotations/AnnotationPlugin",
	"sap/ui/rta/plugin/annotations/AnnotationTypes",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils",
	"sap/ui/thirdparty/jquery"
], function(
	Log,
	Button,
	DesignTime,
	OverlayRegistry,
	FlexObjectFactory,
	PersistenceWriteAPI,
	VerticalLayout,
	CommandFactory,
	AnnotationPlugin,
	AnnotationTypes,
	sinon,
	RtaQunitUtils,
	jQuery
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon);

	function configureDefaultActionAndUpdateOverlay() {
		this.oButtonOverlay.setDesignTimeMetadata({
			actions: {
				annotation: {
					annotationChange1: {
						changeType: "myChangeType",
						title: "My Action Title"
					}
				}
			}
		});
		this.oAnnotationPlugin.deregisterElementOverlay(this.oButtonOverlay);
		this.oAnnotationPlugin.registerElementOverlay(this.oButtonOverlay);
	}

	QUnit.module("Given a design time and annotation plugin are instantiated", {
		beforeEach(assert) {
			const fnDone = assert.async();
			this.oAnnotationPlugin = new AnnotationPlugin({
				commandFactory: new CommandFactory()
			});

			this.oButton = new Button("button", {text: "Button"});
			this.oButtonNoStableID = new Button({text: "Button without stable id"});
			this.oVerticalLayout = new VerticalLayout({
				content: [this.oButton, this.oButtonNoStableID]
			}).placeAt("qunit-fixture");

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVerticalLayout],
				plugins: [this.oAnnotationPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", () => {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				this.oButtonNoStableIDOverlay = OverlayRegistry.getOverlay(this.oButtonNoStableID);
				fnDone();
			});
		},
		afterEach() {
			sandbox.restore();
			this.oDesignTime.destroy();
			this.oVerticalLayout.destroy();
		}
	}, function() {
		QUnit.test("When an overlay has no annotation action in the designtime metadata", function(assert) {
			this.oButtonOverlay.setDesignTimeMetadata({});
			this.oAnnotationPlugin.deregisterElementOverlay(this.oButtonOverlay);
			this.oAnnotationPlugin.registerElementOverlay(this.oButtonOverlay);

			assert.strictEqual(this.oAnnotationPlugin.isAvailable([this.oButtonOverlay]), false, "then isAvailable returns false");
			assert.strictEqual(this.oAnnotationPlugin.isEnabled([this.oButtonOverlay]), false, "then isEnabled returns false");
			assert.strictEqual(this.oAnnotationPlugin._isEditable(this.oButtonOverlay), false, "then _isEditable returns false");
		});

		QUnit.test("when an overlay has singleRename without controlBasedRenameChangeType in the action", async function(assert) {
			this.oButtonOverlay.setDesignTimeMetadata({
				actions: {
					annotation: {
						annotationChange1: {
							changeType: "myChangeType",
							title: "My Action Title",
							singleRename: true
						},
						annotationChange2: {
							changeType: "myChangeType",
							title: "My Action Title",
							controlBasedRenameChangeType: "myRename"
						}
					}
				}
			});
			this.oAnnotationPlugin.deregisterElementOverlay(this.oButtonOverlay);
			this.oAnnotationPlugin.registerElementOverlay(this.oButtonOverlay);

			sandbox.stub(Log, "error");
			const aMenuItems = await this.oAnnotationPlugin.getMenuItems([this.oButtonOverlay]);
			assert.strictEqual(aMenuItems.length, 1, "only 1 menu item is returned");
			assert.ok(
				Log.error.calledWith("When using singleRename, controlBasedRenameChangeType must also be defined"),
				"the proper error is logged"
			);
		});

		QUnit.test("When an overlay has an annotation action in the designtime metadata", async function(assert) {
			configureDefaultActionAndUpdateOverlay.call(this);

			// Simulate that editableByPlugin was not evaluated yet
			const oEditableByPluginStub = sandbox.stub(this.oAnnotationPlugin, "_isEditableByPlugin").returns(undefined);
			sandbox.stub(this.oAnnotationPlugin, "evaluateEditable").callsFake(() => {
				assert.ok(true, "then the evaluateEditable function is called");
				oEditableByPluginStub.restore();
				return Promise.resolve();
			});

			const aMenuItems = await this.oAnnotationPlugin.getMenuItems([this.oButtonOverlay]);
			assert.strictEqual(this.oAnnotationPlugin.isAvailable([this.oButtonOverlay]), true, "then isAvailable returns true");
			assert.strictEqual(this.oAnnotationPlugin.isEnabled([this.oButtonOverlay]), true, "then isEnabled returns true");
			assert.strictEqual(this.oAnnotationPlugin._isEditable(this.oButtonOverlay), true, "then _isEditable returns true");
			assert.strictEqual(aMenuItems[0].id, "CTX_ANNOTATION_annotationChange1", "then the menu item id is correct");
			assert.strictEqual(aMenuItems[0].text, "My Action Title", "then the menu item text is correct");
			assert.strictEqual(aMenuItems[0].icon, "sap-icon://request", "then the menu item icon is correct");
			assert.strictEqual(aMenuItems[0].enabled, true, "then the menu item is enabled");
			assert.strictEqual(aMenuItems[0].rank, 300, "then the menu item rank is correct");
		});

		QUnit.test("When an overlay has propagated annotation actions in the designtime metadata", async function(assert) {
			this.oButtonOverlay.setDesignTimeMetadata({
				actions: {
					annotation: {
						annotationChange1: {
							changeType: "myChangeType",
							title: "My Action Title",
							additionalInfoKey: "ADDITIONALINFO_I18N_KEY"
						}
					}
				},
				propagatedActions: [{
					name: "annotation",
					action: {
						annotationPropagatedChange1: {
							changeType: "myPropagatedChangeType",
							title: "My Propagated Action Title",
							additionalInfoKey: "ADDITIONALINFO_I18N_KEY"
						},
						annotationPropagatedChange2: {
							changeType: "myPropagatedChangeType2",
							title: "My Propagated Action Title 2"
						}
					},
					propagatingControl: this.oVerticalLayout,
					propagatingControlName: "Layout"
				}]
			});
			this.oAnnotationPlugin.deregisterElementOverlay(this.oButtonOverlay);
			this.oAnnotationPlugin.registerElementOverlay(this.oButtonOverlay);

			sandbox.stub(this.oButtonOverlay.getDesignTimeMetadata(), "getLibraryText")
			.callThrough()
			.withArgs(this.oButton, "ADDITIONALINFO_I18N_KEY")
			.returns("Additional Info");
			sandbox.stub(this.oAnnotationPlugin, "isAvailable").withArgs([this.oButtonOverlay]).returns(true)
			.withArgs([this.oLayoutOverlay]).returns(true);
			sandbox.stub(this.oAnnotationPlugin, "isEnabled").withArgs([this.oButtonOverlay]).returns(true)
			.withArgs([this.oLayoutOverlay]).returns(true);

			const aMenuItems = await this.oAnnotationPlugin.getMenuItems([this.oButtonOverlay]);
			assert.strictEqual(aMenuItems[0].id, "CTX_ANNOTATION_annotationChange1", "then the menu item id is correct");
			assert.strictEqual(aMenuItems[0].text, "My Action Title", "then the menu item text is correct");
			assert.strictEqual(aMenuItems[0].icon, "sap-icon://request", "then the menu item icon is correct");
			assert.strictEqual(aMenuItems[0].enabled, true, "then the menu item is enabled");
			assert.strictEqual(aMenuItems[0].rank, 300, "then the menu item rank is correct");
			assert.strictEqual(aMenuItems[0].additionalInfo, "Additional Info", "then the menu item additional info is correct");
			assert.strictEqual(aMenuItems[1].id, "CTX_ANNOTATION_annotationPropagatedChange1", "then the menu item id is correct");
			assert.strictEqual(aMenuItems[1].text, "My Propagated Action Title", "then the menu item text is correct");
			assert.strictEqual(aMenuItems[1].icon, "sap-icon://request", "then the menu item icon is correct");
			assert.strictEqual(aMenuItems[1].enabled, true, "then the menu item is enabled");
			assert.strictEqual(aMenuItems[1].rank, 300, "then the menu item rank is correct");
			assert.strictEqual(aMenuItems[1].additionalInfo, "Additional Info", "then the menu item additional info is correct");
			assert.strictEqual(
				aMenuItems[1].propagatingControl.getId(),
				this.oVerticalLayout.getId(),
				"then the menu item propagating control is correct"
			);
			assert.strictEqual(aMenuItems[1].propagatingControlName, "Layout", "then the menu item propagating control name is correct");
			assert.strictEqual(aMenuItems[2].id, "CTX_ANNOTATION_annotationPropagatedChange2", "then the menu item id is correct");
			assert.strictEqual(aMenuItems[2].text, "My Propagated Action Title 2", "then the menu item text is correct");
			assert.strictEqual(aMenuItems[2].icon, "sap-icon://request", "then the menu item icon is correct");
			assert.strictEqual(aMenuItems[2].enabled, true, "then the menu item is enabled");
			assert.strictEqual(aMenuItems[2].rank, 301, "then the menu item rank is correct");
			assert.strictEqual(
				aMenuItems[2].propagatingControl.getId(),
				this.oVerticalLayout.getId(),
				"then the menu item propagating control is correct"
			);
			assert.strictEqual(aMenuItems[2].propagatingControlName, "Layout", "then the menu item propagating control name is correct");
			assert.strictEqual(aMenuItems[2].additionalInfo, undefined, "then the menu item additional info is not provided as expected");
		});

		QUnit.test("When multiple editable overlays are selected", function(assert) {
			sandbox.stub(this.oAnnotationPlugin, "_isEditableByPlugin").returns(true);
			assert.strictEqual(
				this.oAnnotationPlugin.isAvailable([this.oButtonOverlay, this.oLayoutOverlay]),
				true, "then isAvailable returns true"
			);
			assert.strictEqual(
				this.oAnnotationPlugin.isEnabled([this.oButtonOverlay, this.oLayoutOverlay]),
				false, "then isEnabled returns false"
			);
		});

		QUnit.test("When an overlay has multiple annotation actions in the designtime metadata", async function(assert) {
			const sActionTitle1 = "My Action Title 1";
			const sActionTitle2 = "My Action Title 2";
			this.oButtonOverlay.setDesignTimeMetadata({
				actions: {
					annotation: {
						annotationChange1: {
							changeType: "myChangeType",
							title: () => sActionTitle1,
							isEnabled: false,
							icon: "pathToAnnotationChange1Icon"
						},
						annotationChange2: {
							changeType: "myChangeType2",
							title: "TITLE_I18N_KEY",
							isEnabled: () => true,
							icon: "pathToAnnotationChange2Icon"
						},
						annotationChange3: {
							changeType: "myChangeType3",
							title: "TITLE_I18N_KEY",
							isEnabled: () => true,
							type: AnnotationTypes.StringType
						},
						annotationChange4: {
							changeType: "myChangeType4",
							title: "TITLE_I18N_KEY",
							isEnabled: () => true,
							type: AnnotationTypes.StringType,
							singleRename: true,
							controlBasedRenameChangeType: "rename"
						}
					}
				}
			});

			sandbox.stub(this.oButtonOverlay.getDesignTimeMetadata(), "getLibraryText")
			.withArgs(this.oButton, "TITLE_I18N_KEY")
			.returns(sActionTitle2);

			this.oAnnotationPlugin.deregisterElementOverlay(this.oButtonOverlay);
			this.oAnnotationPlugin.registerElementOverlay(this.oButtonOverlay);

			assert.strictEqual(this.oAnnotationPlugin.isAvailable([this.oButtonOverlay]), true, "then isAvailable returns true");
			assert.strictEqual(this.oAnnotationPlugin.isEnabled([this.oButtonOverlay]), true, "then isEnabled returns true");
			assert.strictEqual(this.oAnnotationPlugin._isEditable(this.oButtonOverlay), true, "then _isEditable returns true");

			const aMenuItems = await this.oAnnotationPlugin.getMenuItems([this.oButtonOverlay]);
			assert.strictEqual(aMenuItems.length, 4, "then two menu items are returned");
			assert.strictEqual(aMenuItems[0].id, "CTX_ANNOTATION_annotationChange1", "then the first menu item id is correct");
			assert.strictEqual(aMenuItems[0].text, sActionTitle1, "then the first menu item text is correct");
			assert.strictEqual(aMenuItems[0].icon, "pathToAnnotationChange1Icon", "then the first menu item icon is correct");
			assert.strictEqual(aMenuItems[0].enabled, false, "then the first menu item is disabled");
			assert.strictEqual(aMenuItems[0].rank, 300, "then the first menu item rank is correct");

			assert.strictEqual(aMenuItems[1].id, "CTX_ANNOTATION_annotationChange2", "then the second menu item id is correct");
			assert.strictEqual(aMenuItems[1].text, sActionTitle2, "then the second menu item text is correct");
			assert.strictEqual(aMenuItems[1].icon, "pathToAnnotationChange2Icon", "then the second menu item icon is correct");
			assert.strictEqual(aMenuItems[1].enabled, true, "then the second menu item is enabled");
			assert.strictEqual(aMenuItems[1].rank, 301, "then the second menu item rank is correct");

			assert.strictEqual(aMenuItems[2].id, "CTX_ANNOTATION_annotationChange3", "then the third menu item id is correct");
			assert.strictEqual(aMenuItems[2].text, sActionTitle2, "then the third menu item text is correct");
			assert.strictEqual(aMenuItems[2].icon, "sap-icon://edit", "then the third menu item icon is correct");
			assert.strictEqual(aMenuItems[2].enabled, true, "then the third menu item is enabled");
			assert.strictEqual(aMenuItems[2].rank, 302, "then the third menu item rank is correct");

			assert.strictEqual(
				aMenuItems[3].id,
				"CTX_ANNOTATION_CHANGE_SINGLE_LABEL_annotationChange4",
				"then the fourth menu item id is correct"
			);
			assert.strictEqual(aMenuItems[3].text, sActionTitle2, "then the third menu item text is correct");
			assert.strictEqual(aMenuItems[3].icon, "sap-icon://edit", "then the third menu item icon is correct");
			assert.strictEqual(aMenuItems[3].enabled, true, "then the third menu item is enabled");
			assert.strictEqual(aMenuItems[3].rank, 15, "then the third menu item rank is correct");
		});

		QUnit.test("When an overlay has an annotation action in the designtime metadata but the control has no stable ID", function(assert) {
			configureDefaultActionAndUpdateOverlay.call(this);

			assert.strictEqual(
				this.oAnnotationPlugin.isAvailable([this.oButtonNoStableIDOverlay]),
				false,
				"then isAvailable returns false"
			);
			assert.strictEqual(this.oAnnotationPlugin.isEnabled([this.oButtonNoStableIDOverlay]), false, "then isEnabled returns false");
			assert.strictEqual(this.oAnnotationPlugin._isEditable(this.oButtonNoStableIDOverlay), false, "then _isEditable returns false");
		});

		QUnit.test("When the designtime metadata has an invalid value for icon", async function(assert) {
			this.oButtonOverlay.setDesignTimeMetadata({
				actions: {
					annotation: {
						annotationChange1: {
							changeType: "myChangeType",
							title: "My Action Title",
							icon: 123
						}
					}
				}
			});
			sandbox.stub(Log, "error");
			this.oAnnotationPlugin.deregisterElementOverlay(this.oButtonOverlay);
			this.oAnnotationPlugin.registerElementOverlay(this.oButtonOverlay);
			const aMenuItems = await this.oAnnotationPlugin.getMenuItems([this.oButtonOverlay]);
			assert.strictEqual(aMenuItems[0].icon, "sap-icon://request", "then the menu item icon is set to the default value");
			assert.ok(
				Log.error.lastCall.args[0].includes("Icon setting for annotation action should be a string"),
				"then the proper error is logged"
			);
		});

		QUnit.test("When the annotation action has no title", async function(assert) {
			this.oButtonOverlay.setDesignTimeMetadata({
				actions: {
					annotation: {
						annotationChange1: {
							changeType: "myChangeType"
						}
					}
				}
			});
			this.oAnnotationPlugin.deregisterElementOverlay(this.oButtonOverlay);
			this.oAnnotationPlugin.registerElementOverlay(this.oButtonOverlay);
			const oLogStub = sandbox.stub(Log, "error");
			const aMenuItems = await this.oAnnotationPlugin.getMenuItems([this.oButtonOverlay]);
			assert.strictEqual(aMenuItems.length, 0, "then no menu items are returned");
			assert.strictEqual(oLogStub.callCount, 1, "and an error is logged");
		});

		QUnit.test("When the annotation action has an invalid entry for icon", async function(assert) {
			configureDefaultActionAndUpdateOverlay.call(this);

			assert.strictEqual(this.oAnnotationPlugin.isAvailable([this.oButtonOverlay]), true, "then isAvailable returns true");
			assert.strictEqual(this.oAnnotationPlugin.isEnabled([this.oButtonOverlay]), true, "then isEnabled returns true");
			assert.strictEqual(this.oAnnotationPlugin._isEditable(this.oButtonOverlay), true, "then _isEditable returns true");

			const aMenuItems = await this.oAnnotationPlugin.getMenuItems([this.oButtonOverlay]);
			assert.strictEqual(aMenuItems[0].id, "CTX_ANNOTATION_annotationChange1", "then the menu item id is correct");
			assert.strictEqual(aMenuItems[0].text, "My Action Title", "then the menu item text is correct");
			assert.strictEqual(aMenuItems[0].icon, "sap-icon://request", "then the menu item icon is set to the default value");
			assert.strictEqual(aMenuItems[0].enabled, true, "then the menu item is enabled");
			assert.strictEqual(aMenuItems[0].rank, 300, "then the menu item rank is correct");
		});

		QUnit.test("When the dialog returns changes", async function(assert) {
			const fnDone = assert.async();
			configureDefaultActionAndUpdateOverlay.call(this);

			const aAnnotationChanges = [
				{
					serviceUrl: "testServiceUrl",
					content: {
						annotationPath: "Path1",
						value: "Value1"
					}
				},
				{
					serviceUrl: "testServiceUrl2",
					content: {
						annotationPath: "Path2",
						value: "Value2"
					}
				}
			];

			sandbox.stub(this.oAnnotationPlugin._oDialog, "openDialogAndHandleChanges").resolves(aAnnotationChanges);

			this.oAnnotationPlugin.attachEventOnce("elementModified", function(oEvent) {
				const oCompositeCommand = oEvent.getParameter("command");
				const aCommands = oCompositeCommand.getCommands();
				assert.strictEqual(aCommands.length, 2, "then the composite command contains two annotation commands");
				const oAnnotationChange = aCommands[0].getPreparedChange();
				const oAnnotationChange2 = aCommands[1].getPreparedChange();
				assert.strictEqual(oAnnotationChange.getChangeType(), "myChangeType", "then the first change has the correct change type");
				assert.strictEqual(
					oAnnotationChange.getServiceUrl(),
					"testServiceUrl",
					"then the first change has the correct service URL"
				);
				assert.strictEqual(oAnnotationChange.getContent().annotationPath, "Path1", "then the first change has the correct content");
				assert.strictEqual(
					oAnnotationChange2.getChangeType(),
					"myChangeType",
					"then the second change has the correct change type"
				);
				assert.strictEqual(
					oAnnotationChange2.getContent().annotationPath,
					"Path2",
					"then the second change has the correct content"
				);
				assert.strictEqual(
					oAnnotationChange2.getServiceUrl(),
					"testServiceUrl2",
					"then the first change has the correct service URL"
				);
				fnDone();
			});

			const aMenuItems = await this.oAnnotationPlugin.getMenuItems([this.oButtonOverlay]);
			const oMenuItem = aMenuItems[0];
			await oMenuItem.handler([this.oButtonOverlay]);
		});

		QUnit.test("When the dialog returns a change and singleRename set to true", async function(assert) {
			const fnDone = assert.async();
			this.oButtonOverlay.setDesignTimeMetadata({
				actions: {
					annotation: {
						annotationChange1: {
							changeType: "myChangeType",
							title: "My Action Title",
							singleRename: true,
							controlBasedRenameChangeType: "myRename"
						}
					}
				}
			});
			this.oAnnotationPlugin.deregisterElementOverlay(this.oButtonOverlay);
			this.oAnnotationPlugin.registerElementOverlay(this.oButtonOverlay);

			sandbox.stub(this.oAnnotationPlugin._oDialog, "openDialogAndHandleChanges").resolves([
				{
					serviceUrl: "testServiceUrl",
					content: {
						annotationPath: "Path1",
						value: "Value1"
					}
				}
			]);
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").resolves([
				FlexObjectFactory.createFromFileContent({
					fileName: "change1",
					selector: { id: "button" },
					changeType: "myRename"
				}),
				FlexObjectFactory.createFromFileContent({
					fileName: "change2",
					selector: { id: "anotherControl" },
					changeType: "myRename"
				}),
				FlexObjectFactory.createFromFileContent({
					fileName: "change3",
					selector: { id: "button" },
					changeType: "anotherChangeType"
				}),
				FlexObjectFactory.createFromFileContent({
					fileName: "change4",
					selector: { id: "button" },
					changeType: "myRename"
				})
			]);

			this.oAnnotationPlugin.attachEventOnce("elementModified", function(oEvent) {
				const oCompositeCommand = oEvent.getParameter("command");
				const aCommands = oCompositeCommand.getCommands();
				assert.strictEqual(aCommands.length, 1, "then the composite command contains one annotation commands");
				const oAnnotationCommand = aCommands[0];
				assert.strictEqual(oAnnotationCommand.getChangesToDelete().length, 2, "then the command contains two changes to delete");
				fnDone();
			});

			const aMenuItems = await this.oAnnotationPlugin.getMenuItems([this.oButtonOverlay]);
			const oMenuItem = aMenuItems[0];
			await oMenuItem.handler([this.oButtonOverlay]);
		});

		QUnit.test("When the dialog returns no changes", async function(assert) {
			configureDefaultActionAndUpdateOverlay.call(this);

			sandbox.stub(this.oAnnotationPlugin._oDialog, "openDialogAndHandleChanges").resolves([]);

			const aMenuItems = await this.oAnnotationPlugin.getMenuItems([this.oButtonOverlay]);
			const oMenuItem = aMenuItems[0];
			const oCommand = await oMenuItem.handler([this.oButtonOverlay]);
			assert.strictEqual(oCommand, undefined, "then no command is created");
		});

		QUnit.test("When the dialog is opened and the command creation fails", async function(assert) {
			const fnDone = assert.async();
			configureDefaultActionAndUpdateOverlay.call(this);

			sandbox.stub(this.oAnnotationPlugin._oDialog, "openDialogAndHandleChanges").resolves([
				{
					serviceUrl: "testServiceUrl",
					content: {
						annotationPath: "Path1",
						value: "Value1"
					}
				}
			]);

			sandbox.stub(this.oAnnotationPlugin.getCommandFactory(), "getCommandFor").rejects(new Error("Error"));

			const aMenuItems = await this.oAnnotationPlugin.getMenuItems([this.oButtonOverlay]);
			const oMenuItem = aMenuItems[0];
			try {
				await oMenuItem.handler([this.oButtonOverlay]);
			} catch (oError) {
				assert.ok(oError, "then an error is thrown");
				fnDone();
			}
		});

		QUnit.test("When an error happens when opening the dialog (handler)", async function(assert) {
			const fnDone = assert.async();
			configureDefaultActionAndUpdateOverlay.call(this);

			sandbox.stub(this.oAnnotationPlugin._oDialog, "openDialogAndHandleChanges").rejects("Error when opening the dialog");

			const aMenuItems = await this.oAnnotationPlugin.getMenuItems([this.oButtonOverlay]);
			const oMenuItem = aMenuItems[0];
			try {
				await oMenuItem.handler([this.oButtonOverlay]);
			} catch (oError) {
				assert.ok(oError, "then an error is thrown");
				fnDone();
			}
		});

		QUnit.test("When the plugin is destroyed", async function(assert) {
			configureDefaultActionAndUpdateOverlay.call(this);
			const oDialog = this.oAnnotationPlugin._oDialog;
			sandbox.stub(oDialog, "openDialogAndHandleChanges").resolves([]);

			const aMenuItems = await this.oAnnotationPlugin.getMenuItems([this.oButtonOverlay]);
			const oMenuItem = aMenuItems[0];
			await oMenuItem.handler([this.oButtonOverlay]);
			this.oAnnotationPlugin.destroy();
			assert.ok(
				oDialog.bIsDestroyed,
				"then the dialog is destroyed"
			);
			assert.strictEqual(
				this.oAnnotationPlugin._oDialog,
				undefined,
				"then the dialog reference is removed"
			);
		});

		QUnit.test("when the designtime action has objectTemplateInfo", async function(assert) {
			const fnDone = assert.async();
			this.oButtonOverlay.setDesignTimeMetadata({
				actions: {
					annotation: {
						annotationChange: {
							changeType: "myChangeType",
							title: "TITLE_I18N_KEY",
							isEnabled: () => true,
							type: AnnotationTypes.StringType,
							objectTemplateInfo: {
								templateAsString: "templateAsStringplaceholderfoo",
								placeholder: "placeholder"
							}
						}
					}
				}
			});

			this.oAnnotationPlugin.deregisterElementOverlay(this.oButtonOverlay);
			this.oAnnotationPlugin.registerElementOverlay(this.oButtonOverlay);
			const aChanges = [
				{
					serviceUrl: "testServiceUrl",
					content: {
						annotationPath: "Path1",
						value: "Value1"
					}
				}
			];

			sandbox.stub(this.oAnnotationPlugin._oDialog, "openDialogAndHandleChanges").resolves(aChanges);

			this.oAnnotationPlugin.attachEventOnce("elementModified", function(oEvent) {
				const oCompositeCommand = oEvent.getParameter("command");
				const aCommands = oCompositeCommand.getCommands();
				assert.strictEqual(aCommands.length, 1, "then the composite command contains one annotation commands");
				const oAnnotationChange = aCommands[0].getPreparedChange();
				assert.strictEqual(oAnnotationChange.getChangeType(), "myChangeType", "then the change has the correct change type");
				assert.strictEqual(oAnnotationChange.getServiceUrl(), "testServiceUrl", "then the change has the correct service URL");
				assert.strictEqual(oAnnotationChange.getContent().annotationPath, "Path1", "then the change has the correct content");
				assert.deepEqual(oAnnotationChange.getContent().objectTemplateInfo, {
					templateAsString: "templateAsStringplaceholderfoo",
					placeholder: "placeholder"
				}, "then the change has the correct objectTemplateInfo");
				fnDone();
			});
			const aMenuItems = await this.oAnnotationPlugin.getMenuItems([this.oButtonOverlay]);
			const oMenuItem = aMenuItems[0];
			await oMenuItem.handler([this.oButtonOverlay]);
		});
	});

	QUnit.done(function() {
		oMockedAppComponent.destroy();
		jQuery("#qunit-fixture").hide();
	});
});