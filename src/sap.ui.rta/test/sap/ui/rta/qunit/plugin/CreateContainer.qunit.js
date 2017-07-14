/* global QUnit sinon */

QUnit.config.autostart = false;

jQuery.sap.require("sap.ui.qunit.qunit-coverage");
jQuery.sap.require("sap.ui.thirdparty.sinon");
jQuery.sap.require("sap.ui.thirdparty.sinon-ie");
jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");

sap.ui.define([ "sap/ui/fl/Utils",
				"sap/ui/layout/VerticalLayout",
				"sap/ui/dt/DesignTime",
				"sap/ui/rta/command/CommandFactory",
				"sap/ui/dt/OverlayRegistry",
				"sap/ui/fl/registry/ChangeRegistry",
				"sap/ui/layout/form/FormContainer",
				"sap/ui/layout/form/Form",
				"sap/ui/layout/form/FormLayout",
				"sap/ui/rta/plugin/CreateContainer",
				"sap/ui/core/Title" ],
	function(Utils, VerticalLayout, DesignTime, CommandFactory, OverlayRegistry, ChangeRegistry, FormContainer, Form, FormLayout, CreateContainerPlugin, Title) {

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

			assert.strictEqual(this.oCreateContainer.isCreateAvailable(false, this.oFormOverlay), false, "then isCreateAvailable is called and it returns false");
			assert.strictEqual(this.oCreateContainer.isCreateEnabled(false, this.oFormOverlay), false, "then isCreateEnabled is called and it returns false");
			assert.strictEqual(this.oCreateContainer._isEditable(this.oFormOverlay), false, "then the overlay is not editable");
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

			assert.strictEqual(this.oCreateContainer.isCreateAvailable(false, this.oFormOverlay), true, "then isCreateAvailable is called and it returns true");
			assert.strictEqual(this.oCreateContainer.isCreateEnabled(false, this.oFormOverlay), true, "then isCreateEnabled is called and it returns true");
			assert.strictEqual(this.oCreateContainer._isEditable(this.oFormOverlay), true, "then the overlay is editable");
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

			assert.strictEqual(this.oCreateContainer.isCreateAvailable(false, this.oFormOverlay), false, "then isCreateAvailable is called and then it returns false");
			assert.strictEqual(this.oCreateContainer.isCreateEnabled(false, this.oFormOverlay), true, "then isCreateEnabled is called and then it returns correct value");
			assert.strictEqual(this.oCreateContainer._isEditable(this.oFormOverlay), false, "then the overlay is not editable");
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

			assert.strictEqual(this.oCreateContainer.isCreateAvailable(false, this.oFormOverlay), true, "then isCreateAvailable is called and it returns true");
			assert.strictEqual(this.oCreateContainer.isCreateEnabled(false, this.oFormOverlay), true, "then isCreateEnabled is called and it returns correct value from function call");
			assert.strictEqual(this.oCreateContainer._isEditable(this.oFormOverlay), true, "then the overlay is editable");
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

			assert.strictEqual(this.oCreateContainer.isCreateAvailable(false, this.oFormOverlay), false, "then isCreateAvailable is called and it returns false");
			assert.strictEqual(this.oCreateContainer.isCreateEnabled(true, this.oFormOverlay), false, "then isCreateEnabled is called and it returns true");
			assert.strictEqual(this.oCreateContainer._isEditable(this.oFormOverlay), false, "then the overlay is not editable");
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

		QUnit.test("when the designTimeMetadata has a getCreatedContainerId property and a function _getCreatedContainerId() is called", function(assert) {
			var vAction = {
				getCreatedContainerId : function(sNewControlID) {
					return sNewControlID;
				}
			};

			assert.deepEqual(this.oCreateContainer._getCreatedContainerId(vAction, this.sNewControlID), this.oNewFormContainerOverlay, "then the correct overlay is returned");
		});

		QUnit.test("when the designTimeMetadata has no getCreatedContainerId property and a function _getCreatedContainerId() is called", function(assert) {
			var vAction = {
				changeType : "addGroup"
			};

			assert.deepEqual(this.oCreateContainer._getCreatedContainerId(vAction, this.sNewControlID), this.oNewFormContainerOverlay, "then the correct overlay is returned");
		});

		QUnit.test("when a child overlay has createContainer action designTime metadata and handleCreate() is called, ", function(assert) {
			var oNewContainerOverlay = this.oNewFormContainerOverlay;
			sandbox.stub(this.oCreateContainer, "_getCreatedContainerId").returns(oNewContainerOverlay);
			sandbox.stub(oNewContainerOverlay, "isSelectable").returns(true);

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
								isEnabled : true,
								getCreatedContainerId : function(sNewControlID) {
									return sNewControlID;
								}
							}
						}
					}
				}
			});
			this.oCreateContainer.deregisterElementOverlay(this.oFormOverlay);
			this.oCreateContainer.registerElementOverlay(this.oFormOverlay);

			assert.strictEqual(this.oCreateContainer.isCreateAvailable(false, this.oFormOverlay), true, "then isCreateAvailable is called, then it returns true");
			assert.strictEqual(this.oCreateContainer.isCreateEnabled(false, this.oFormOverlay), true, "then isCreateEnabled is called, then it returns true");

			this.oCreateContainer.attachEventOnce("elementModified", function(oEvent) {
				var oCommand = oEvent.getParameter("command");
				assert.ok(oCommand, "then command is available");
				assert.strictEqual(oCommand.getMetadata().getName(), "sap.ui.rta.command.CreateContainer", "and command is of the correct type");
			});
			assert.ok(true, "then plugin createContainer is called with this overlay");

			assert.deepEqual(this.oCreateContainer.handleCreate(false, this.oFormOverlay), oNewContainerOverlay, "then the correct overlay is returned");

			assert.strictEqual(oNewContainerOverlay.isSelected(), true, "then the correct overlay is selected");
		});

		QUnit.test("when a sibling overlay has createContainer action designTime metadata and handleCreate() is called, ", function(assert) {
			var oNewContainerOverlay = this.oNewFormContainerOverlay;
			sandbox.stub(this.oCreateContainer, "_getCreatedContainerId").returns(oNewContainerOverlay);
			sandbox.stub(oNewContainerOverlay, "isSelectable").returns(true);

			var done = assert.async();
			this.oDesignTime.attachEventOnce("synced", function() {
				this.oFormContainerOverlay = OverlayRegistry.getOverlay(this.oFormContainer);
				assert.strictEqual(this.oCreateContainer.isCreateAvailable(true, this.oFormContainerOverlay), true, "then isCreateAvailable is called, then it returns true");
				assert.strictEqual(this.oCreateContainer.isCreateEnabled(true, this.oFormContainerOverlay), true, "then isCreateEnabled is called, then it returns true");

				this.oCreateContainer.attachEventOnce("elementModified", function (oEvent) {
					var oCommand = oEvent.getParameter("command");
					assert.ok(oCommand, "then command is available");
					assert.strictEqual(oCommand.getMetadata().getName(), "sap.ui.rta.command.CreateContainer", "and command is of the correct type");
				});

				assert.ok(true, "then plugin createContainer is called with this overlay");
				assert.deepEqual(this.oCreateContainer.handleCreate(true, this.oFormContainerOverlay), oNewContainerOverlay, "then the correct overlay is returned");
				assert.strictEqual(oNewContainerOverlay.isSelected(), true, "then the correct overlay is selected");
				done();
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
			this.oCreateContainer.deregisterElementOverlay(this.oFormOverlay);
			this.oCreateContainer.registerElementOverlay(this.oFormOverlay);
		});

});
