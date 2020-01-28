/* global QUnit */

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/Util",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormLayout",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/rta/plugin/CreateContainer",
	"sap/ui/core/Title",
	"sap/ui/thirdparty/sinon-4"
],
function (
	Utils,
	VerticalLayout,
	DesignTime,
	DtUtil,
	CommandFactory,
	OverlayRegistry,
	ChangeRegistry,
	FormContainer,
	Form,
	FormLayout,
	SimpleForm,
	CreateContainerPlugin,
	Title,
	sinon
) {
	"use strict";

	var viewContent = '<mvc:View xmlns:mvc="sap.ui.core.mvc">' + '</mvc:View>';

	var oMockedViewWithStableId = sap.ui.xmlview({
		id: "mockview",
		viewContent: viewContent
	});

	var oMockedComponent = {
		getLocalId: function () {
			return undefined;
		},
		getManifestEntry: function () {
			return {};
		},
		getMetadata: function () {
			return {
				getName: function () {
					return "someName";
				}
			};
		},
		getManifest: function () {
			return {
				"sap.app" : {
					applicationVersion : {
						version : "1.2.3"
					}
				}
			};
		},
		getModel: function () {}
	};

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given a designTime and createContainer plugin are instantiated for a Form", {
		beforeEach : function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(oMockedComponent);
			sandbox.stub(Utils, "getViewForControl").returns(oMockedViewWithStableId);

			var oChangeRegistry = ChangeRegistry.getInstance();
			return oChangeRegistry.registerControlsForChanges({
				"sap.ui.layout.form.Form" : {
					addGroup: {
						completeChangeContent: function() {},
						applyChange: function() {},
						revertChange: function() {}
					}
				}
			})
			.then(function() {
				this.oCreateContainer = new CreateContainerPlugin({
					commandFactory : new CommandFactory()
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
					content : [this.oForm]
				}).placeAt("qunit-fixture");

				sap.ui.getCore().applyChanges();

				this.sNewControlID = oMockedViewWithStableId.createId(jQuery.sap.uid());
				this.oNewFormContainerStub = new FormContainer(this.sNewControlID);
				this.oForm.addFormContainer(this.oNewFormContainerStub);

				this.oDesignTime = new DesignTime({
					rootElements : [this.oVerticalLayout],
					plugins : [this.oCreateContainer]
				});

				var done = assert.async();

				this.oDesignTime.attachEventOnce("synced", function() {
					this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
					this.oFormOverlay = OverlayRegistry.getOverlay(this.oForm);
					this.oFormContainerOverlay = OverlayRegistry.getOverlay(this.oFormContainer);
					this.oNewFormContainerOverlay = OverlayRegistry.getOverlay(this.oNewFormContainerStub);

					done();
				}.bind(this));
			}.bind(this));
		},
		afterEach: function () {
			sandbox.restore();
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
				assert.strictEqual(this.oCreateContainer.isAvailable(false, [this.oFormOverlay]), false, "then isAvailable is called and it returns false");
				assert.strictEqual(this.oCreateContainer.isEnabled(false, [this.oFormOverlay]), false, "then isEnabled is called and it returns false");
				return this.oCreateContainer._isEditableCheck(this.oFormOverlay, false);
			}.bind(this))
			.then(function(bIsEditable) {
				assert.notOk(bIsEditable, "then the overlay is not editable");
			});
		});

		QUnit.test("when an overlay has createContainer action designTime metadata, but has no isEnabled property defined", function(assert) {
			this.oFormOverlay.setDesignTimeMetadata({
				aggregations : {
					formContainers : {
						actions : {
							createContainer : {
								changeType : "addGroup"
							}
						}
					}
				}
			});
			this.oCreateContainer.deregisterElementOverlay(this.oFormOverlay);
			this.oCreateContainer.registerElementOverlay(this.oFormOverlay);

			return DtUtil.waitForSynced(this.oDesignTime)()
			.then(function() {
				assert.strictEqual(this.oCreateContainer.isAvailable(false, [this.oFormOverlay]), true, "then isAvailable is called and it returns true");
				assert.strictEqual(this.oCreateContainer.isEnabled(false, [this.oFormOverlay]), true, "then isEnabled is called and it returns true");
				return this.oCreateContainer._isEditableCheck(this.oFormOverlay, false);
			}.bind(this))
			.then(function(bIsEditable) {
				assert.ok(bIsEditable, "then the overlay is editable");
			});
		});

		QUnit.test("when an overlay has createContainer action designTime metadata, has no changeType and isEnabled property is true", function(assert) {
			this.oFormOverlay.setDesignTimeMetadata({
				aggregations : {
					formContainers : {
						actions : {
							createContainer : {
								isEnabled : true
							}
						}
					}
				}
			});
			this.oCreateContainer.deregisterElementOverlay(this.oFormOverlay);
			this.oCreateContainer.registerElementOverlay(this.oFormOverlay);

			return DtUtil.waitForSynced(this.oDesignTime)()
			.then(function() {
				assert.strictEqual(this.oCreateContainer.isAvailable(false, [this.oFormOverlay]), false, "then isAvailable is called and then it returns false");
				assert.strictEqual(this.oCreateContainer.isEnabled(false, [this.oFormOverlay]), true, "then isEnabled is called and then it returns correct value");
				return this.oCreateContainer._isEditableCheck(this.oFormOverlay, false);
			}.bind(this))
			.then(function(bIsEditable) {
				assert.notOk(bIsEditable, "then the overlay is not editable");
			});
		});

		QUnit.test("when an overlay has createContainer action designTime metadata, and isEnabled property is function", function(assert) {
			this.oFormOverlay.setDesignTimeMetadata({
				aggregations : {
					formContainers : {
						actions : {
							createContainer : {
								changeType : "addGroup",
								isEnabled : function (oElement) {
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
				assert.strictEqual(this.oCreateContainer.isAvailable(false, [this.oFormOverlay]), true, "then isAvailable is called and it returns true");
				assert.strictEqual(this.oCreateContainer.isEnabled(false, [this.oFormOverlay]), true, "then isEnabled is called and it returns correct value from function call");
				return this.oCreateContainer._isEditableCheck(this.oFormOverlay, false);
			}.bind(this))
			.then(function(bIsEditable) {
				assert.ok(bIsEditable, "then the overlay is editable");

				var bCheckValue = true;
				var bFirstCall = true;
				var bIsAvailable = true;
				sandbox.stub(this.oCreateContainer, "isAvailable").callsFake(function(bOverlayIsSibling, aElementOverlays) {
					assert.equal(bOverlayIsSibling, bFirstCall, "the 'available' function calls isAvailable with bOverlayIsSibling = " + bFirstCall);
					assert.deepEqual(aElementOverlays[0].getId(), this.oFormOverlay.getId(), "the 'available' function calls isAvailable with the correct overlay");
					bFirstCall = false;
					return bIsAvailable;
				}.bind(this));
				sandbox.stub(this.oCreateContainer, "handleCreate").callsFake(function(bOverlayIsSibling, oElementOverlay) {
					assert.equal(bOverlayIsSibling, bCheckValue, "the 'handleCreate' function is called with bOverlayIsSibling = " + bCheckValue);
					assert.deepEqual(oElementOverlay.getId(), this.oFormOverlay.getId(), "the 'handleCreate' function is called with the correct overlay");
				}.bind(this));
				sandbox.stub(this.oCreateContainer, "isEnabled").callsFake(function(bOverlayIsSibling, aElementOverlays) {
					assert.equal(bOverlayIsSibling, bCheckValue, "the 'enabled' function calls isEnabled with bOverlayIsSibling = " + bCheckValue);
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

		QUnit.test("when an overlay has createContainer action, but its view has no stable id", function(assert) {
			var oViewWithUnstableId = sap.ui.xmlview({
				viewContent: viewContent
			});
			Utils.getViewForControl.restore();
			sandbox.stub(Utils, "getViewForControl").returns(oViewWithUnstableId);

			this.oFormOverlay.setDesignTimeMetadata({
				aggregations : {
					formContainers : {
						actions : {
							createContainer : {
								changeType : "addGroup"
							}
						}
					}
				}
			});
			this.oCreateContainer.deregisterElementOverlay(this.oFormOverlay);
			this.oCreateContainer.registerElementOverlay(this.oFormOverlay);

			return DtUtil.waitForSynced(this.oDesignTime)()
			.then(function() {
				assert.strictEqual(this.oCreateContainer.isAvailable(false, [this.oFormOverlay]), false, "then isAvailable is called and it returns false");
				assert.strictEqual(this.oCreateContainer.isEnabled(true, [this.oFormOverlay]), false, "then isEnabled is called and it returns true");
				return this.oCreateContainer._isEditableCheck(this.oFormOverlay, false);
			}.bind(this))
			.then(function(bIsEditable) {
				assert.notOk(bIsEditable, "then the overlay is not editable");
			});
		});

		QUnit.test("when an overlay has createContainer action with changeOnRelevantContainer true, but its relevant container has no stable id", function(assert) {
			this.oFormOverlay.setDesignTimeMetadata({
				aggregations : {
					formContainers : {
						actions : {
							createContainer : {
								changeType : "addGroup",
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

			// changeOnRelevantContainer means the action has to be registered on the parent
			return ChangeRegistry.getInstance().registerControlsForChanges({
				"sap.ui.layout.VerticalLayout" : {
					addGroup: {
						completeChangeContent: function() {},
						applyChange: function() {},
						revertChange: function() {}
					}
				}
			}).then(function() {
				this.oCreateContainer.deregisterElementOverlay(this.oFormOverlay);
				this.oCreateContainer.registerElementOverlay(this.oFormOverlay);
			}.bind(this))
			.then(DtUtil.waitForSynced(this.oDesignTime)())
			.then(function() {
				return this.oCreateContainer._isEditableCheck(this.oFormContainerOverlay, true);
			}.bind(this))
			.then(function(bIsEditable) {
				assert.notOk(bIsEditable, "then the overlay is not editable");
			});
		});

		QUnit.test("when a sibling overlay has createContainer action designTime metadata, but for another aggregation", function(assert) {
			this.oFormOverlay.setDesignTimeMetadata({
				aggregations : {
					toolBar : {
						actions : {
							createContainer : {
								changeType : "addToolbarContainer"
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
				getIndex : function(oForm, oFormContainer) {
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
				changeType : "addGroup"
			};

			assert.deepEqual(this.oCreateContainer._determineIndex(this.oForm, undefined, vAction.aggregationName, undefined), 0, "then the default index calculation would start and returns the right index");
		});

		QUnit.test("when the designTimeMetadata has a getCreatedContainerId property and a function getCreatedContainerId() is called", function(assert) {
			var vAction = {
				getCreatedContainerId : function(sNewControlID) {
					return sNewControlID;
				}
			};

			assert.deepEqual(this.oCreateContainer.getCreatedContainerId(vAction, this.sNewControlID),
				this.oNewFormContainerOverlay.getElement().getId(),
				"then the correct id is returned");
		});

		QUnit.test("when the designTimeMetadata has no getCreatedContainerId property and a function getCreatedContainerId() is called", function(assert) {
			var vAction = {
				changeType : "addGroup"
			};

			assert.deepEqual(this.oCreateContainer.getCreatedContainerId(vAction, this.sNewControlID),
				this.oNewFormContainerOverlay.getElement().getId(),
				"then the correct id is returned");
		});

		QUnit.test("when a child overlay has createContainer action designTime metadata and handleCreate() is called, ", function(assert) {
			var fnDone = assert.async();

			this.oFormOverlay.setDesignTimeMetadata({
				aggregations : {
					formContainers : {
						childNames : {
							singular : "GROUP_CONTROL_NAME",
							plural : "GROUP_CONTROL_NAME_PLURAL"
						},
						actions : {
							createContainer :  {
								changeType : "addGroup",
								isEnabled : true
							}
						}
					}
				}
			});
			this.oCreateContainer.deregisterElementOverlay(this.oFormOverlay);
			this.oCreateContainer.registerElementOverlay(this.oFormOverlay);

			this.oCreateContainer.attachEventOnce("elementModified", function(oEvent) {
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then command is available");
				assert.strictEqual(oCommand.getMetadata().getName(), "sap.ui.rta.command.CreateContainer", "and command is of the correct type");
				assert.strictEqual(oEvent.getParameter("action").changeType, "addGroup", "then the correct action is passed to the event");
				fnDone();
			});
			assert.ok(true, "then plugin createContainer is called with this overlay");

			this.oCreateContainer.handleCreate(false, this.oFormOverlay);
		});

		QUnit.test("when a sibling overlay has createContainer action designTime metadata and handleCreate() is called, ", function(assert) {
			var fnDone = assert.async();

			this.oCreateContainer.attachEventOnce("elementModified", function (oEvent) {
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
				aggregations : {
					formContainers : {
						childNames : {
							singular : "GROUP_CONTROL_NAME",
							plural : "GROUP_CONTROL_NAME_PLURAL"
						},
						actions : {
							createContainer :  {
								changeType : "addGroup"
							}
						}
					}
				}
			});

			this.oCreateContainer.handleCreate(true, this.oFormContainerOverlay);
		});
	});

	QUnit.module("Given a designTime and createContainer plugin are instantiated for a SimpleForm", {
		beforeEach : function(assert) {
			var done = assert.async();
			sandbox.stub(Utils, "getAppComponentForControl").returns(oMockedComponent);
			sandbox.stub(Utils, "getViewForControl").returns(oMockedViewWithStableId);

			var oChangeRegistry = ChangeRegistry.getInstance();
			return oChangeRegistry.registerControlsForChanges({
				"sap.ui.layout.form.SimpleForm": {
					addSimpleFormGroup: {
						completeChangeContent: function() {},
						applyChange: function() {},
						revertChange: function() {}
					}
				}
			})
			.then(function() {
				this.oCreateContainer = new CreateContainerPlugin({
					commandFactory : new CommandFactory()
				});
				this.oTitle = new Title(oMockedViewWithStableId.createId("title"), { text: "title" });
				this.oSimpleForm = new SimpleForm(oMockedViewWithStableId.createId("form"), {
					content: [this.oTitle]
				});
				this.oVerticalLayout = new VerticalLayout(oMockedViewWithStableId.createId("verticalLayout"), {
					content : [this.oSimpleForm]
				}).placeAt("qunit-fixture");

				sap.ui.getCore().applyChanges();

				this.oDesignTime = new DesignTime({
					rootElements : [this.oVerticalLayout],
					plugins : [this.oCreateContainer]
				});

				this.oDesignTime.attachEventOnce("synced", function() {
					this.oFormOverlay = OverlayRegistry.getOverlay(this.oSimpleForm.getAggregation("form"));
					this.oGroupOverlay = OverlayRegistry.getOverlay(this.oSimpleForm.getAggregation("form").getFormContainers()[0]);
					done();
				}.bind(this));
			}.bind(this));
		},
		afterEach: function () {
			sandbox.restore();
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}
	}, function () {
		QUnit.test("when a child overlay has propagated createContainer action designTime metadata and handleCreate() is called, ", function(assert) {
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

			this.oCreateContainer.handleCreate(false, this.oFormOverlay);
		});

		QUnit.test("when a sibling overlay has propagated createContainer action designTime metadata and handleCreate() is called, ", function(assert) {
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

			this.oCreateContainer.handleCreate(true, this.oGroupOverlay);
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
