/* global QUnit */

sap.ui.define([
	"sap/base/util/uid",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/Lib",
	"sap/ui/core/Title",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/Utils",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormLayout",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/CreateContainer",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	uid,
	XMLView,
	Lib,
	Title,
	DesignTime,
	OverlayRegistry,
	DtUtil,
	ChangesWriteAPI,
	Utils,
	Form,
	FormContainer,
	FormLayout,
	SimpleForm,
	VerticalLayout,
	nextUIUpdate,
	CommandFactory,
	CreateContainerPlugin,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	var viewContent = '<mvc:View xmlns:mvc="sap.ui.core.mvc">' + "</mvc:View>";

	var oMockedViewWithStableId;
	XMLView.create({
		id: "mockview",
		definition: viewContent
	}).then(function(oView) {
		oMockedViewWithStableId = oView;
		QUnit.start();
	});

	const sandbox = sinon.createSandbox();
	const oResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");

	QUnit.module("Given a designTime and createContainer plugin are instantiated for a Form", {
		async beforeEach(assert) {
			this.oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);
			sandbox.stub(Utils, "getViewForControl").returns(oMockedViewWithStableId);
			sandbox.stub(ChangesWriteAPI, "getChangeHandler").resolves();

			this.oCreateContainer = new CreateContainerPlugin({
				commandFactory: new CommandFactory()
			});
			this.oFormContainer = new FormContainer(oMockedViewWithStableId.createId("formContainer"), {
				title: new Title({
					text: "title"
				})
			});
			this.oForm = new Form(oMockedViewWithStableId.createId("form"), {
				formContainers: [this.oFormContainer],
				layout: new FormLayout({
				})
			});
			this.oVerticalLayout = new VerticalLayout(oMockedViewWithStableId.createId("verticalLayout"), {
				content: [this.oForm]
			}).placeAt("qunit-fixture");

			await nextUIUpdate();

			this.sNewControlID = oMockedViewWithStableId.createId(uid());
			this.oNewFormContainerStub = new FormContainer(this.sNewControlID);
			this.oForm.addFormContainer(this.oNewFormContainerStub);

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVerticalLayout],
				plugins: [this.oCreateContainer]
			});

			var done = assert.async();

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
				this.oFormOverlay = OverlayRegistry.getOverlay(this.oForm);
				this.oFormContainerOverlay = OverlayRegistry.getOverlay(this.oFormContainer);
				this.oNewFormContainerOverlay = OverlayRegistry.getOverlay(this.oNewFormContainerStub);

				done();
			}.bind(this));
		},
		afterEach() {
			sandbox.restore();
			this.oMockedAppComponent.destroy();
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}

	}, function() {
		QUnit.test("when the designTimeMetadata has childNames for the container name", function(assert) {
			assert.deepEqual(this.oCreateContainer.getCreateContainerText(false, this.oFormOverlay), "Create: Group", "then the correct message key is returned");
		});

		QUnit.test("when an overlay has no createContainer action designTime metadata", function(assert) {
			this.oFormOverlay.setDesignTimeMetadata({});
			this.oCreateContainer.deregisterElementOverlay(this.oFormOverlay);
			this.oCreateContainer.registerElementOverlay(this.oFormOverlay);

			return DtUtil.waitForSynced(this.oDesignTime)()
			.then(function() {
				assert.strictEqual(this.oCreateContainer.isAvailable([this.oFormOverlay], false), false, "then isAvailable is called and it returns false");
				assert.strictEqual(this.oCreateContainer.isEnabled([this.oFormOverlay], false), false, "then isEnabled is called and it returns false");
				return this.oCreateContainer._isEditableCheck(this.oFormOverlay, false);
			}.bind(this))
			.then(function(bIsEditable) {
				assert.notOk(bIsEditable, "then the overlay is not editable");
			});
		});

		QUnit.test("when an overlay has createContainer action designTime metadata, but has no isEnabled property defined", function(assert) {
			this.oFormOverlay.setDesignTimeMetadata({
				aggregations: {
					formContainers: {
						actions: {
							createContainer: {
								changeType: "addGroup"
							}
						}
					}
				}
			});
			this.oCreateContainer.deregisterElementOverlay(this.oFormOverlay);
			this.oCreateContainer.registerElementOverlay(this.oFormOverlay);

			return DtUtil.waitForSynced(this.oDesignTime)()
			.then(function() {
				assert.strictEqual(this.oCreateContainer.isAvailable([this.oFormOverlay], false), true, "then isAvailable is called and it returns true");
				assert.strictEqual(this.oCreateContainer.isEnabled([this.oFormOverlay], false), true, "then isEnabled is called and it returns true");
				return this.oCreateContainer._isEditableCheck(this.oFormOverlay, false);
			}.bind(this))
			.then(function(bIsEditable) {
				assert.ok(bIsEditable, "then the overlay is editable");
			});
		});

		QUnit.test("when an overlay has createContainer action designTime metadata, has no changeType and isEnabled property is true", function(assert) {
			this.oFormOverlay.setDesignTimeMetadata({
				aggregations: {
					formContainers: {
						actions: {
							createContainer: {
								isEnabled: true
							}
						}
					}
				}
			});
			this.oCreateContainer.deregisterElementOverlay(this.oFormOverlay);
			this.oCreateContainer.registerElementOverlay(this.oFormOverlay);

			return DtUtil.waitForSynced(this.oDesignTime)()
			.then(function() {
				assert.strictEqual(this.oCreateContainer.isAvailable([this.oFormOverlay], false), false, "then isAvailable is called and then it returns false");
				assert.strictEqual(this.oCreateContainer.isEnabled([this.oFormOverlay], false), true, "then isEnabled is called and then it returns correct value");
				return this.oCreateContainer._isEditableCheck(this.oFormOverlay, false);
			}.bind(this))
			.then(function(bIsEditable) {
				assert.notOk(bIsEditable, "then the overlay is not editable");
			});
		});

		QUnit.test("when an overlay has createContainer action designTime metadata, and isEnabled property is function", function(assert) {
			assert.expect(22);
			this.oFormOverlay.setDesignTimeMetadata({
				aggregations: {
					formContainers: {
						actions: {
							createContainer: {
								changeType: "addGroup",
								isEnabled(oElement) {
									return oElement.getMetadata().getName() === "sap.ui.layout.form.Form";
								}
							}
						}
					}
				}
			});
			this.oCreateContainer.deregisterElementOverlay(this.oFormOverlay);
			this.oCreateContainer.registerElementOverlay(this.oFormOverlay);

			return DtUtil.waitForSynced(this.oDesignTime)()
			.then(function() {
				assert.strictEqual(this.oCreateContainer.isAvailable([this.oFormOverlay], false), true, "then isAvailable is called and it returns true");
				assert.strictEqual(this.oCreateContainer.isEnabled([this.oFormOverlay], false), true, "then isEnabled is called and it returns correct value from function call");
				return this.oCreateContainer._isEditableCheck(this.oFormOverlay, false);
			}.bind(this))
			.then(function(bIsEditable) {
				assert.ok(bIsEditable, "then the overlay is editable");

				var bCheckValue = true;
				var bFirstCall = true;
				var bIsAvailable = true;
				sandbox.stub(this.oCreateContainer, "isAvailable").callsFake(function(aElementOverlays, bOverlayIsSibling) {
					assert.equal(bOverlayIsSibling, bFirstCall, `the 'available' function calls isAvailable with bOverlayIsSibling = ${bFirstCall}`);
					assert.deepEqual(aElementOverlays[0].getId(), this.oFormOverlay.getId(), "the 'available' function calls isAvailable with the correct overlay");
					bFirstCall = false;
					return bIsAvailable;
				}.bind(this));
				sandbox.stub(this.oCreateContainer, "handleCreate").callsFake(function(bOverlayIsSibling, oElementOverlay) {
					assert.equal(bOverlayIsSibling, bCheckValue, `the 'handleCreate' function is called with bOverlayIsSibling = ${bCheckValue}`);
					assert.deepEqual(oElementOverlay.getId(), this.oFormOverlay.getId(), "the 'handleCreate' function is called with the correct overlay");
				}.bind(this));
				sandbox.stub(this.oCreateContainer, "isEnabled").callsFake(function(aElementOverlays, bOverlayIsSibling) {
					assert.equal(bOverlayIsSibling, bCheckValue, `the 'enabled' function calls isEnabled with bOverlayIsSibling = ${bCheckValue}`);
					assert.deepEqual(aElementOverlays[0].getId(), this.oFormOverlay.getId(), "the 'enabled' function calls isEnabled with the correct overlay");
				}.bind(this));

				var aMenuItems = this.oCreateContainer.getMenuItems([this.oFormOverlay]);

				assert.equal(aMenuItems[0].id, "CTX_CREATE_SIBLING_CONTAINER", "there is an entry for create sibling container");
				aMenuItems[0].handler([this.oFormOverlay]);
				aMenuItems[0].enabled([this.oFormOverlay]);
				bCheckValue = false;
				assert.equal(aMenuItems[1].id, "CTX_CREATE_CHILD_CONTAINER", "there is an entry for create child container");
				aMenuItems[1].handler([this.oFormOverlay]);
				aMenuItems[1].enabled([this.oFormOverlay]);

				bIsAvailable = false;
				bFirstCall = true;
				assert.equal(this.oCreateContainer.getMenuItems([this.oFormOverlay]).length, 0, "and if plugin is not available for the overlay, no menu items are returned");
			}.bind(this));
		});

		QUnit.test("when an overlay has createContainer action with changeOnRelevantContainer true, but its relevant container has no stable id", function(assert) {
			this.oFormOverlay.setDesignTimeMetadata({
				aggregations: {
					formContainers: {
						actions: {
							createContainer: {
								changeType: "addGroup",
								changeOnRelevantContainer: true
							}
						}
					}
				}
			});
			sandbox.stub(this.oCreateContainer, "hasStableId").callsFake(function(oOverlay) {
				if (oOverlay === this.oLayoutOverlay) {
					return false;
				}
				return true;
			}.bind(this));
			sandbox.stub(this.oFormContainerOverlay, "getRelevantContainer").returns(this.oForm);

			this.oCreateContainer.deregisterElementOverlay(this.oFormOverlay);
			this.oCreateContainer.registerElementOverlay(this.oFormOverlay);
			return DtUtil.waitForSynced(this.oDesignTime)()
			.then(function() {
				return this.oCreateContainer._isEditableCheck(this.oFormContainerOverlay, true);
			}.bind(this))
			.then(function(bIsEditable) {
				assert.notOk(bIsEditable, "then the overlay is not editable");
			});
		});

		QUnit.test("when a sibling overlay has createContainer action designTime metadata, but for another aggregation", function(assert) {
			this.oFormOverlay.setDesignTimeMetadata({
				aggregations: {
					toolBar: {
						actions: {
							createContainer: {
								changeType: "addToolbarContainer"
							}
						}
					}
				}
			});
			this.oCreateContainer.deregisterElementOverlay(this.oFormOverlay);
			this.oCreateContainer.registerElementOverlay(this.oFormOverlay);

			return this.oCreateContainer._isEditableCheck(this.oFormOverlay, true)
			.then(function(bIsEditable) {
				assert.notOk(bIsEditable, "then the overlay is not editable");
			});
		});

		QUnit.test("when the designTimeMetadata has a getContainerIndex property and a function _determineIndex() is called", function(assert) {
			var vAction = {
				aggregationName: "formContainers",
				getIndex(oForm, oFormContainer) {
					var sAggregationName = vAction.aggregationName;
					var oMetadata = oForm.getMetadata();
					var oAggregation = oMetadata.getAggregation(sAggregationName);
					var sGetter = oAggregation._sGetter;
					var aContainers = oForm[sGetter]();
					var iIndex;
					if (oFormContainer) {
						iIndex = aContainers.indexOf(oFormContainer) + 1;
					} else {
						iIndex = aContainers.length;
					}
					return iIndex;
				}
			};

			assert.deepEqual(this.oCreateContainer._determineIndex(this.oForm, undefined, vAction.aggregationName, vAction.getIndex), 2, "then the correct index of the new added group is returned from the function call");
		});

		QUnit.test("when the designTimeMetadata has no getContainerIndex property given and a function _determineIndex() is called", function(assert) {
			var vAction = {
				aggregationName: "formContainers",
				changeType: "addGroup"
			};

			assert.deepEqual(this.oCreateContainer._determineIndex(this.oForm, undefined, vAction.aggregationName, undefined), 0, "then the default index calculation would start and returns the right index");
		});

		QUnit.test("when the designTimeMetadata has a getCreatedContainerId property and a function getCreatedContainerId() is called", function(assert) {
			var vAction = {
				getCreatedContainerId(sNewControlID) {
					return sNewControlID;
				}
			};

			assert.deepEqual(this.oCreateContainer.getCreatedContainerId(vAction, this.sNewControlID),
				this.oNewFormContainerOverlay.getElement().getId(),
				"then the correct id is returned");
		});

		QUnit.test("when the designTimeMetadata has no getCreatedContainerId property and a function getCreatedContainerId() is called", function(assert) {
			var vAction = {
				changeType: "addGroup"
			};

			assert.deepEqual(this.oCreateContainer.getCreatedContainerId(vAction, this.sNewControlID),
				this.oNewFormContainerOverlay.getElement().getId(),
				"then the correct id is returned");
		});

		QUnit.test("when a child overlay has createContainer action designTime metadata and handleCreate() is called, ", async function(assert) {
			var fnDone = assert.async();

			this.oFormOverlay.setDesignTimeMetadata({
				aggregations: {
					formContainers: {
						childNames: {
							singular: "GROUP_CONTROL_NAME",
							plural: "GROUP_CONTROL_NAME_PLURAL"
						},
						actions: {
							createContainer: {
								changeType: "addGroup",
								isEnabled: true
							}
						}
					}
				}
			});
			this.oCreateContainer.deregisterElementOverlay(this.oFormOverlay);
			this.oCreateContainer.registerElementOverlay(this.oFormOverlay);

			this.oCreateContainer.attachEventOnce("elementModified", function(oEvent) {
				var oCommand = oEvent.getParameter("command");
				assert.strictEqual(oCommand.getLabel(), "My New Group", "then the container is correctly labeled");
				assert.ok(oCommand, "then command is available");
				assert.strictEqual(oCommand.getMetadata().getName(), "sap.ui.rta.command.CreateContainer", "and command is of the correct type");
				assert.strictEqual(oEvent.getParameter("action").changeType, "addGroup", "then the correct action is passed to the event");
				fnDone();
			});
			assert.ok(true, "then plugin createContainer is called with this overlay");

			await RtaQunitUtils.simulateRename(sandbox, "My New Group", () => {
				this.oCreateContainer.handleCreate(false, this.oFormOverlay);
			});
		});

		QUnit.test("when the rename during the creation flow is invalid", function(assert) {
			const fnDone = assert.async();

			this.oFormOverlay.setDesignTimeMetadata({
				aggregations: {
					formContainers: {
						childNames: {
							singular: "GROUP_CONTROL_NAME",
							plural: "GROUP_CONTROL_NAME_PLURAL"
						},
						actions: {
							createContainer: {
								changeType: "addGroup",
								isEnabled: true,
								validators: ["noEmptyText"]
							}
						}
					}
				}
			});
			this.oCreateContainer.deregisterElementOverlay(this.oFormOverlay);
			this.oCreateContainer.registerElementOverlay(this.oFormOverlay);

			const oCreateCommandSpy = sandbox.spy(CommandFactory, "getCommandFor");
			RtaQunitUtils.simulateRename(
				sandbox,
				"",
				() => {
					this.oCreateContainer.handleCreate(false, this.oFormOverlay);
				},
				(sError) => {
					assert.ok(oCreateCommandSpy.notCalled, "then no command is created");
					assert.strictEqual(
						sError,
						oResourceBundle.getText("RENAME_EMPTY_ERROR_TEXT"),
						"then the error message is correct"
					);
					fnDone();
				}
			);
		});

		QUnit.test("when a sibling overlay has createContainer action designTime metadata and handleCreate() is called, ", async function(assert) {
			var fnDone = assert.async();

			this.oCreateContainer.attachEventOnce("elementModified", function(oEvent) {
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then command is available");
				assert.strictEqual(oCommand.getMetadata().getName(), "sap.ui.rta.command.CreateContainer", "and command is of the correct type");
				assert.strictEqual(oEvent.getParameter("action").changeType, "addGroup", "then the correct action is passed to the event");
				assert.ok(oCommand.getLabel(), "then the label is in the command");
				assert.deepEqual(oCommand.getIndex(), 1, "then the correct index is in the command");
				assert.deepEqual(oCommand.getParentId(), this.oForm.getId(), "then the correct parentId is in the command");

				fnDone();
			}.bind(this));

			this.oFormOverlay.setDesignTimeMetadata({
				aggregations: {
					formContainers: {
						childNames: {
							singular: "GROUP_CONTROL_NAME",
							plural: "GROUP_CONTROL_NAME_PLURAL"
						},
						actions: {
							createContainer: {
								changeType: "addGroup"
							}
						}
					}
				}
			});

			await RtaQunitUtils.simulateRename(sandbox, "My New Group", () => {
				this.oCreateContainer.handleCreate(true, this.oFormContainerOverlay);
			});
		});
	});

	QUnit.module("Given a designTime and createContainer plugin are instantiated for a SimpleForm", {
		async beforeEach(assert) {
			var done = assert.async();
			this.oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);
			sandbox.stub(Utils, "getViewForControl").returns(oMockedViewWithStableId);
			sandbox.stub(ChangesWriteAPI, "getChangeHandler").resolves();

			this.oCreateContainer = new CreateContainerPlugin({
				commandFactory: new CommandFactory()
			});
			this.oTitle = new Title(oMockedViewWithStableId.createId("title"), { text: "title" });
			this.oSimpleForm = new SimpleForm(oMockedViewWithStableId.createId("form"), {
				layout: "ResponsiveGridLayout",
				content: [this.oTitle]
			});
			this.oVerticalLayout = new VerticalLayout(oMockedViewWithStableId.createId("verticalLayout"), {
				content: [this.oSimpleForm]
			}).placeAt("qunit-fixture");

			await nextUIUpdate();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oVerticalLayout],
				plugins: [this.oCreateContainer]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oFormOverlay = OverlayRegistry.getOverlay(this.oSimpleForm.getAggregation("form"));
				this.oGroupOverlay = OverlayRegistry.getOverlay(this.oSimpleForm.getAggregation("form").getFormContainers()[0]);
				done();
			}.bind(this));
		},
		afterEach() {
			sandbox.restore();
			this.oMockedAppComponent.destroy();
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {
		QUnit.test("when a child overlay has propagated createContainer action designTime metadata and handleCreate() is called, ", async function(assert) {
			var fnDone = assert.async();

			this.oCreateContainer.attachEventOnce("elementModified", function(oEvent) {
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then command is available");
				assert.strictEqual(oCommand.getMetadata().getName(), "sap.ui.rta.command.CreateContainer", "and command is of the correct type");
				assert.strictEqual(oEvent.getParameter("action").changeType, "addSimpleFormGroup", "then the correct action is passed to the event");
				assert.deepEqual(oCommand.getParentId(), this.oSimpleForm.getAggregation("form").getId(), "then the correct parentId is in the command");
				fnDone();
			}.bind(this));
			assert.ok(true, "then plugin createContainer is called with this overlay");

			await RtaQunitUtils.simulateRename(sandbox, "My New Group", () => {
				this.oCreateContainer.handleCreate(false, this.oFormOverlay);
			});
		});

		QUnit.test("when a sibling overlay has propagated createContainer action designTime metadata and handleCreate() is called, ", async function(assert) {
			var fnDone = assert.async();

			this.oCreateContainer.attachEventOnce("elementModified", function(oEvent) {
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then command is available");
				assert.strictEqual(oCommand.getMetadata().getName(), "sap.ui.rta.command.CreateContainer", "and command is of the correct type");
				assert.strictEqual(oEvent.getParameter("action").changeType, "addSimpleFormGroup", "then the correct action is passed to the event");
				assert.deepEqual(oCommand.getParentId(), this.oSimpleForm.getAggregation("form").getId(), "then the correct parentId is in the command");
				fnDone();
			}.bind(this));
			assert.ok(true, "then plugin createContainer is called with this overlay");

			await RtaQunitUtils.simulateRename(sandbox, "My New Group", () => {
				this.oCreateContainer.handleCreate(true, this.oGroupOverlay);
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
