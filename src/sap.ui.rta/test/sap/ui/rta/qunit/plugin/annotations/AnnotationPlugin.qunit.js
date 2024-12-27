/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/m/Button",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/annotations/AnnotationPlugin",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils",
	"sap/ui/thirdparty/sinon-4"
], function(
	Log,
	Button,
	DesignTime,
	OverlayRegistry,
	VerticalLayout,
	CommandFactory,
	AnnotationPlugin,
	RtaQunitUtils,
	sinon
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
	});

	QUnit.test("When an overlay has no annotation action in the designtime metadata", function(assert) {
		this.oButtonOverlay.setDesignTimeMetadata({});
		this.oAnnotationPlugin.deregisterElementOverlay(this.oButtonOverlay);
		this.oAnnotationPlugin.registerElementOverlay(this.oButtonOverlay);

		assert.strictEqual(this.oAnnotationPlugin.isAvailable([this.oButtonOverlay]), false, "then isAvailable returns false");
		assert.strictEqual(this.oAnnotationPlugin.isEnabled([this.oButtonOverlay]), false, "then isEnabled returns false");
		assert.strictEqual(this.oAnnotationPlugin._isEditable(this.oButtonOverlay), false, "then _isEditable returns false");
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
		assert.strictEqual(aMenuItems[0].id, "CTX_ANNOTATION0", "then the menu item id is correct");
		assert.strictEqual(aMenuItems[0].text, "My Action Title", "then the menu item text is correct");
		assert.strictEqual(aMenuItems[0].icon, "sap-icon://request", "then the menu item icon is correct");
		assert.strictEqual(aMenuItems[0].enabled, true, "then the menu item is enabled");
		assert.strictEqual(aMenuItems[0].rank, 140, "then the menu item rank is correct");
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
						icon: "pathToAnnonationChange1Icon"
					},
					annotationChange2: {
						changeType: "myChangeType2",
						title: "TITLE_I18N_KEY",
						isEnabled: () => true,
						icon: "pathToAnnonationChange2Icon"
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
		assert.strictEqual(aMenuItems.length, 2, "then two menu items are returned");
		assert.strictEqual(aMenuItems[0].id, "CTX_ANNOTATION0", "then the first menu item id is correct");
		assert.strictEqual(aMenuItems[0].text, sActionTitle1, "then the first menu item text is correct");
		assert.strictEqual(aMenuItems[0].icon, "pathToAnnonationChange1Icon", "then the first menu item icon is correct");
		assert.strictEqual(aMenuItems[0].enabled, false, "then the first menu item is disabled");
		assert.strictEqual(aMenuItems[0].rank, 140, "then the first menu item rank is correct");

		assert.strictEqual(aMenuItems[1].id, "CTX_ANNOTATION1", "then the second menu item id is correct");
		assert.strictEqual(aMenuItems[1].text, sActionTitle2, "then the second menu item text is correct");
		assert.strictEqual(aMenuItems[1].icon, "pathToAnnonationChange2Icon", "then the second menu item icon is correct");
		assert.strictEqual(aMenuItems[1].enabled, true, "then the second menu item is enabled");
		assert.strictEqual(aMenuItems[1].rank, 141, "then the second menu item rank is correct");
	});

	QUnit.test("When an overlay has an annotation action in the designtime metadata but the control has no stable ID", function(assert) {
		configureDefaultActionAndUpdateOverlay.call(this);

		assert.strictEqual(this.oAnnotationPlugin.isAvailable([this.oButtonNoStableIDOverlay]), false, "then isAvailable returns false");
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
		assert.strictEqual(aMenuItems[0].id, "CTX_ANNOTATION0", "then the menu item id is correct");
		assert.strictEqual(aMenuItems[0].text, "My Action Title", "then the menu item text is correct");
		assert.strictEqual(aMenuItems[0].icon, "sap-icon://request", "then the menu item icon is set to the default value");
		assert.strictEqual(aMenuItems[0].enabled, true, "then the menu item is enabled");
		assert.strictEqual(aMenuItems[0].rank, 140, "then the menu item rank is correct");
	});

	QUnit.test("When the dialog returns changes", async function(assert) {
		const fnDone = assert.async();
		configureDefaultActionAndUpdateOverlay.call(this);

		const aChanges = [
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

		sandbox.stub(this.oAnnotationPlugin._oDialog, "openDialogAndHandleChanges").resolves(aChanges);

		this.oAnnotationPlugin.attachEventOnce("elementModified", function(oEvent) {
			const bHasAnnotationCommand = oEvent.getParameter("hasAnnotationCommand");
			assert.strictEqual(bHasAnnotationCommand, true, "then the event is fired with the hasAnnotationCommand flag");
			const oCompositeCommand = oEvent.getParameter("command");
			const aCommands = oCompositeCommand.getCommands();
			assert.strictEqual(aCommands.length, 2, "then the composite command contains two annotation commands");
			const oAnnotationChange = aCommands[0].getPreparedChange();
			const oAnnotationChange2 = aCommands[1].getPreparedChange();
			assert.strictEqual(oAnnotationChange.getChangeType(), "myChangeType", "then the first change has the correct change type");
			assert.strictEqual(oAnnotationChange.getServiceUrl(), "testServiceUrl", "then the first change has the correct service URL");
			assert.strictEqual(oAnnotationChange.getContent().annotationPath, "Path1", "then the first change has the correct content");
			assert.strictEqual(oAnnotationChange.getChangeType(), "myChangeType", "then the second change has the correct change type");
			assert.strictEqual(oAnnotationChange2.getContent().annotationPath, "Path2", "then the second change has the correct content");
			assert.strictEqual(oAnnotationChange2.getServiceUrl(), "testServiceUrl2", "then the first change has the correct service URL");
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

	QUnit.done(function() {
		oMockedAppComponent.destroy();
		jQuery("#qunit-fixture").hide();
	});
});