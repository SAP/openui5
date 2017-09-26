/* global QUnit sinon */

QUnit.config.autostart = false;

jQuery.sap.require("sap.ui.thirdparty.sinon");
jQuery.sap.require("sap.ui.thirdparty.sinon-ie");
jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");

sap.ui.require([
	"sap/ui/fl/Utils",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/dt/DesignTime",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormLayout",
	"sap/ui/rta/plugin/CreateContainer",
	"sap/ui/core/Title"
],
function(
	Utils,
	VerticalLayout,
	DesignTime,
	CommandFactory,
	OverlayRegistry,
	ChangeRegistry,
	FormContainer,
	Form,
	FormLayout,
	CreateContainerPlugin,
	Title
) {

		"use strict";

		QUnit.start();

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

		QUnit.module("Given a designTime and createContainer plugin are instantiated", {
			beforeEach : function(assert) {
				sandbox.stub(Utils, "getAppComponentForControl").returns(oMockedComponent);
				sandbox.stub(Utils, "getViewForControl").returns(oMockedViewWithStableId);

				var oChangeRegistry = ChangeRegistry.getInstance();
				oChangeRegistry.registerControlsForChanges({
					"sap.ui.layout.form.Form" : {
						"addGroup": { completeChangeContent: function () {} }
					}
				});

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
				}).placeAt("test-view");

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

			},
			afterEach : function(assert) {
				sandbox.restore();
				this.oVerticalLayout.destroy();
				this.oDesignTime.destroy();
			}
		});

		QUnit.test("when an overlay has no createContainer action designTime metadata", function(assert) {
			this.oFormOverlay.setDesignTimeMetadata({});
			this.oCreateContainer.deregisterElementOverlay(this.oFormOverlay);
			this.oCreateContainer.registerElementOverlay(this.oFormOverlay);

			assert.strictEqual(this.oCreateContainer.isAvailable(false, this.oFormOverlay), false, "then isAvailable is called and it returns false");
			assert.strictEqual(this.oCreateContainer.isEnabled(false, this.oFormOverlay), false, "then isEnabled is called and it returns false");
			assert.strictEqual(this.oCreateContainer._isEditableCheck(this.oFormOverlay, false), false, "then the overlay is not editable");
		});

		QUnit.test("when an overlay has createContainer action designTime metadata, but has no isEnabled property defined", function(assert) {
			this.oFormOverlay.setDesignTimeMetadata({
				aggregations : {
					groups : {
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

			assert.strictEqual(this.oCreateContainer.isAvailable(false, this.oFormOverlay), true, "then isAvailable is called and it returns true");
			assert.strictEqual(this.oCreateContainer.isEnabled(false, this.oFormOverlay), true, "then isEnabled is called and it returns true");
			assert.strictEqual(this.oCreateContainer._isEditableCheck(this.oFormOverlay, false), true, "then the overlay is editable");
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

			assert.strictEqual(this.oCreateContainer.isAvailable(false, this.oFormOverlay), false, "then isAvailable is called and then it returns false");
			assert.strictEqual(this.oCreateContainer.isEnabled(false, this.oFormOverlay), true, "then isEnabled is called and then it returns correct value");
			assert.strictEqual(this.oCreateContainer._isEditableCheck(this.oFormOverlay, false), false, "then the overlay is not editable");
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

			assert.strictEqual(this.oCreateContainer.isAvailable(false, this.oFormOverlay), true, "then isAvailable is called and it returns true");
			assert.strictEqual(this.oCreateContainer.isEnabled(false, this.oFormOverlay), true, "then isEnabled is called and it returns correct value from function call");
			assert.strictEqual(this.oCreateContainer._isEditableCheck(this.oFormOverlay, false), true, "then the overlay is editable");

			var bCheckValue = true;
			var bFirstCall = true;
			var bIsAvailable = true;
			sandbox.stub(this.oCreateContainer, "isAvailable", function(bOverlayIsSibling, oOverlay){
				assert.equal(bOverlayIsSibling, bFirstCall, "the 'available' function calls isAvailable with bOverlayIsSibling = " + bFirstCall);
				assert.deepEqual(oOverlay, this.oFormOverlay, "the 'available' function calls isAvailable with the correct overlay");
				bFirstCall = false;
				return bIsAvailable;
			}.bind(this));
			sandbox.stub(this.oCreateContainer, "handleCreate", function(bOverlayIsSibling, oOverlay){
				assert.equal(bOverlayIsSibling, bCheckValue, "the 'handleCreate' function is called with bOverlayIsSibling = " + bCheckValue);
				assert.deepEqual(oOverlay, this.oFormOverlay, "the 'handleCreate' function is called with the correct overlay");
			}.bind(this));
			sandbox.stub(this.oCreateContainer, "isEnabled", function(bOverlayIsSibling, oOverlay){
				assert.equal(bOverlayIsSibling, bCheckValue, "the 'enabled' function calls isEnabled with bOverlayIsSibling = " + bCheckValue);
				assert.deepEqual(oOverlay, this.oFormOverlay, "the 'enabled' function calls isEnabled with the correct overlay");
			}.bind(this));

			var aMenuItems = this.oCreateContainer.getMenuItems(this.oFormOverlay);

			assert.equal(aMenuItems[0].id, "CTX_CREATE_SIBLING_CONTAINER", "there is an entry for create sibling container");
			aMenuItems[0].handler([this.oFormOverlay]);
			aMenuItems[0].enabled(this.oFormOverlay);
			bCheckValue = false;
			assert.equal(aMenuItems[1].id, "CTX_CREATE_CHILD_CONTAINER", "there is an entry for create child container");
			aMenuItems[1].handler([this.oFormOverlay]);
			aMenuItems[1].enabled(this.oFormOverlay);

			bIsAvailable = false;
			bFirstCall = true;
			assert.equal(this.oCreateContainer.getMenuItems(this.oFormOverlay).length, 0, "and if plugin is not available for the overlay, no menu items are returned");
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

			assert.strictEqual(this.oCreateContainer.isAvailable(false, this.oFormOverlay), false, "then isAvailable is called and it returns false");
			assert.strictEqual(this.oCreateContainer.isEnabled(true, this.oFormOverlay), false, "then isEnabled is called and it returns true");
			assert.strictEqual(this.oCreateContainer._isEditableCheck(this.oFormOverlay, false), false, "then the overlay is not editable");
		});

		QUnit.test("when the designTimeMetadata has childNames for the container name", function(assert) {
			assert.deepEqual(this.oCreateContainer.getCreateContainerText(false, this.oFormOverlay), "Create Group", "then the correct message key is returned");
		});

		QUnit.test("when the designTimeMetadata has a getContainerIndex property and a function _determineIndex() is called", function(assert) {
			var vAction = {
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
				changeType : "addGroup"
			};

			assert.deepEqual(this.oCreateContainer._determineIndex(this.oForm, undefined, vAction.aggregationName, undefined), 2, "then the default index calculation would start and returns the right index");
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

			assert.strictEqual(this.oCreateContainer.isAvailable(false, this.oFormOverlay), true, "then isAvailable is called, then it returns true");
			assert.strictEqual(this.oCreateContainer.isEnabled(false, this.oFormOverlay), true, "then isEnabled is called, then it returns true");

			this.oCreateContainer.attachEventOnce("elementModified", function(oEvent) {
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then command is available");
				assert.strictEqual(oCommand.getMetadata().getName(), "sap.ui.rta.command.CreateContainer", "and command is of the correct type");
				assert.strictEqual(oEvent.getParameter("action").changeType, "addGroup", "then the correct action is passed to the event" );
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
				assert.strictEqual(oEvent.getParameter("action").changeType, "addGroup", "then the correct action is passed to the event" );
				fnDone();
			});

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

			this.oCreateContainer.deregisterElementOverlay(this.oFormContainerOverlay);
			this.oCreateContainer.registerElementOverlay(this.oFormContainerOverlay);

			this.oFormContainerOverlay = OverlayRegistry.getOverlay(this.oFormContainer);
			assert.strictEqual(this.oCreateContainer.isAvailable(true, this.oFormContainerOverlay), true, "then isAvailable is called, then it returns true");
			assert.strictEqual(this.oCreateContainer.isEnabled(true, this.oFormContainerOverlay), true, "then isEnabled is called, then it returns true");

			this.oCreateContainer.handleCreate(true, this.oFormContainerOverlay);
		});

});
