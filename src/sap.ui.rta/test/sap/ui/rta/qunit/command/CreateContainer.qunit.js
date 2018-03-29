/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/command/CreateContainer",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/core/Popup",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4",
	"jquery.sap.global"
],
function(
	CommandFactory,
	CreateContainer,
	ElementDesignTimeMetadata,
	Popup,
	Form,
	FormContainer,
	ChangeRegistry,
	Utils,
	sinon,
	jQuery
) {
		"use strict";

		var oMockedAppComponent = {
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

		sinon.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);

		QUnit.module("Given a popup with empty designtime metadata is created...", {
			beforeEach : function(assert) {
				this.oPopup = new Popup();

				this.NEW_CONTROL_ID = "NEW_ID";
				this.NEW_CONTROL_LABEL = "New Label";

				this.oPopupDesignTimeMetadata = new ElementDesignTimeMetadata();

			},
			afterEach : function(assert) {
				this.oPopup.destroy();
			}
		}, function(){
			QUnit.test("when getting a createContainer command for popup ...", function(assert) {
				var oCreateContainerCommand = CommandFactory.getCommandFor(this.oPopup, "CreateContainer", {
					index : 0,
					newControlId : this.NEW_CONTROL_ID,
					label : this.NEW_CONTROL_LABEL,
					parentId : this.oPopup.getId()
				}, this.oPopupDesignTimeMetadata);

				assert.notOk(oCreateContainerCommand, "no createContainer command for popup exists");
			});
		});

		QUnit.module("Given a form and it's designtime metadata are created...", {
			beforeEach : function(assert) {

				this.oFormContainer = new FormContainer("container");
				this.oForm = new Form("form", {
					formContainers : [this.oFormContainer]
				});

				this.NEW_CONTROL_ID = "NEW_ID";
				this.NEW_CONTROL_LABEL = "New Label";

				var oChangeRegistry = ChangeRegistry.getInstance();

				this.fnApplyChangeSpy = sinon.spy();
				this.fnCompleteChangeContentSpy = sinon.spy();

				oChangeRegistry.registerControlsForChanges({
					"sap.ui.layout.form.Form": {
						"addGroup" : {
							applyChange: this.fnApplyChangeSpy,
							completeChangeContent: this.fnCompleteChangeContentSpy
						}
					}
				});

				this.oCreateContainerDesignTimeMetadata = new ElementDesignTimeMetadata({
					data : {
						aggregations : {
							formContainers : {
								actions : {
									createContainer :  {
										changeType : "addGroup",
										isEnabled : true,
										mapToRelevantControlID : function(sNewControlID) {
											return sNewControlID;
										}
									}
								}
							}
						}
					}
				});

				this.oCreateContainerCommand = CommandFactory.getCommandFor(this.oForm, "createContainer", {
					index : 0,
					newControlId : this.NEW_CONTROL_ID,
					label : this.NEW_CONTROL_LABEL,
					parentId : this.oForm.getId()
				}, this.oCreateContainerDesignTimeMetadata);

			},
			afterEach : function(assert) {
				this.oForm.destroy();
				this.oCreateContainerCommand.destroy();
			}
		}, function(){
			QUnit.test("when getting a createContainer command for form", function(assert) {
				var done = assert.async();
				var sChangeType = this.oCreateContainerDesignTimeMetadata.getActionDataFromAggregations("createContainer", this.oForm)[0].changeType;
				assert.ok(this.oCreateContainerCommand, "createContainer command for form exists");
				assert.equal(this.oCreateContainerCommand.getChangeType(), sChangeType, "correct change type is assigned to a command");

				this.oCreateContainerCommand.execute().then( function() {
					assert.equal(this.fnCompleteChangeContentSpy.callCount, 1, "then completeChangeContent is called once");
					assert.equal(this.fnApplyChangeSpy.callCount, 1, "then applyChange is called once");
					done();
				}.bind(this));
			});
		});

		QUnit.start();

	});