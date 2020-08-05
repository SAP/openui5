/* global QUnit */

sap.ui.define([
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/core/Popup",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
],
function(
	CommandFactory,
	ElementDesignTimeMetadata,
	Popup,
	Form,
	FormContainer,
	ChangeRegistry,
	FlUtils,
	sinon
) {
	"use strict";

	var oMockedAppComponent = {
		getLocalId: function () {},
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
	var oGetAppComponentForControlStub = sinon.stub(FlUtils, "getAppComponentForControl").returns(oMockedAppComponent);

	QUnit.done(function () {
		oGetAppComponentForControlStub.restore();
	});

	QUnit.module("Given a popup with empty designtime metadata is created...", {
		beforeEach: function () {
			this.oPopup = new Popup();

			this.NEW_CONTROL_ID = "NEW_ID";
			this.NEW_CONTROL_LABEL = "New Label";

			this.oPopupDesignTimeMetadata = new ElementDesignTimeMetadata();
		},
		afterEach: function () {
			this.oPopup.destroy();
		}
	}, function() {
		QUnit.test("when getting a createContainer command for popup ...", function(assert) {
			return CommandFactory.getCommandFor(this.oPopup, "CreateContainer", {
				index : 0,
				newControlId : this.NEW_CONTROL_ID,
				label : this.NEW_CONTROL_LABEL,
				parentId : this.oPopup.getId()
			}, this.oPopupDesignTimeMetadata)

			.then(function(oCreateContainerCommand) {
				assert.notOk(oCreateContainerCommand, "no createContainer command for popup exists");
			})

			.catch(function (oError) {
				assert.ok(false, 'catch must never be called - Error: ' + oError);
			});
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

			return oChangeRegistry.registerControlsForChanges({
				"sap.ui.layout.form.Form": {
					addGroup : {
						applyChange: this.fnApplyChangeSpy,
						completeChangeContent: this.fnCompleteChangeContentSpy,
						revertChange: function() {}
					}
				}
			})

			.then(function() {
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

				return CommandFactory.getCommandFor(this.oForm, "createContainer", {
					index : 0,
					newControlId : this.NEW_CONTROL_ID,
					label : this.NEW_CONTROL_LABEL,
					parentId : this.oForm.getId()
				}, this.oCreateContainerDesignTimeMetadata);
			}.bind(this))

			.then(function(oCreateContainerCommand) {
				this.oCreateContainerCommand = oCreateContainerCommand;
			}.bind(this))

			.catch(function (oError) {
				assert.ok(false, 'catch must never be called - Error: ' + oError);
			});
		},
		afterEach: function () {
			this.oForm.destroy();
			this.oCreateContainerCommand.destroy();
		}
	}, function () {
		QUnit.test("when getting a createContainer command for form", function(assert) {
			var done = assert.async();
			var sChangeType = this.oCreateContainerDesignTimeMetadata.getActionDataFromAggregations("createContainer", this.oForm)[0].changeType;
			assert.ok(this.oCreateContainerCommand, "createContainer command for form exists");
			assert.equal(this.oCreateContainerCommand.getChangeType(), sChangeType, "correct change type is assigned to a command");

			this.oCreateContainerCommand.execute().then(function() {
				assert.equal(this.fnCompleteChangeContentSpy.callCount, 1, "then completeChangeContent is called once");
				assert.equal(this.fnApplyChangeSpy.callCount, 1, "then applyChange is called once");
				done();
			}.bind(this));
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});