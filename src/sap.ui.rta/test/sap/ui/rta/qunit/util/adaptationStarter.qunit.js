/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/util/adaptationStarter",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/m/MessageBox",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	adaptationStarter,
	FeaturesAPI,
	sinon,
	PersistenceWriteAPI,
	RuntimeAuthoring,
	MessageBox,
	RtaQunitUtils
) {
	"use strict";
	var sandbox = sinon.createSandbox();
	var oAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon);

	function setIsKeyUser(bIsKeyUser) {
		sandbox.stub(FeaturesAPI, "isKeyUser").resolves(bIsKeyUser);
	}

	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");

	QUnit.module("Base tests", {
		beforeEach: function() {
			this.fnRtaStartStub = sandbox.stub(RuntimeAuthoring.prototype, "start").resolves();
			this.fnMessageBoxStub = sandbox.stub(MessageBox, "warning");
			setIsKeyUser(true);
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When adaptationStarter is called with changes from other system", function(assert) {
			sandbox.stub(PersistenceWriteAPI, "getChangesWarning").resolves({
				showWarning: true, warningType: "mixedChangesWarning"
			});

			return adaptationStarter({
				rootControl: oAppComponent,
				flexSettings: {
					layer: "CUSTOMER"
				}
			}).then(function () {
				assert.strictEqual(this.fnMessageBoxStub.callCount, 1, "then the warning is shown");
				assert.strictEqual(
					this.fnMessageBoxStub.lastCall.args[1].title,
					oResourceBundle.getText("TIT_ADAPTATION_STARTER_MIXED_CHANGES_TITLE"),
					"then the title of the mixed changes message is shown correctly"
				);
				/**
				 * TODO: This test should be integrated again after the automatic translations have refreshed the messagebundle
				 * the translations have not implemented the new link syntax yet because of that the test is failing
				 *
				assert.strictEqual(
					this.fnMessageBoxStub.lastCall.args[0].mAggregations.content.map(function(item, index) {
						if (index === 1) {
							return "[" + item.getText() + "]" + "(" + item.getHref() + ")";
						}
						return item.getText();
					}).join(""),
					oResourceBundle.getText("MSG_ADAPTATION_STARTER_MIXED_CHANGES_WARNING"),
					"then the text of the mixed changes message is shown correctly"
				);*/
			}.bind(this));
		});

		QUnit.test("When adaptationStarter is called in a P System with no changes", function(assert) {
			sandbox.stub(PersistenceWriteAPI, "getChangesWarning").resolves({
				showWarning: true, warningType: "noChangesAndPSystemWarning"
			});

			return adaptationStarter({
				rootControl: oAppComponent,
				flexSettings: {
					layer: "CUSTOMER"
				}
			})
			.then(function () {
				assert.strictEqual(this.fnMessageBoxStub.callCount, 1, "then the warning is shown");
				assert.strictEqual(
					this.fnMessageBoxStub.lastCall.args[1].title,
					oResourceBundle.getText("TIT_ADAPTATION_STARTER_NO_CHANGES_IN_P_TITLE"),
					"then the title of the no changes and P system message is shown correctly"
				);
				assert.strictEqual(
					this.fnMessageBoxStub.lastCall.args[0],
					oResourceBundle.getText("MSG_ADAPTATION_STARTER_NO_CHANGES_IN_P_WARNING"),
					"then the text of the no changes and P system message is shown correctly"
				);
			}.bind(this));
		});

		QUnit.test("When adaptationStarter is called with changes in the same system", function(assert) {
			sandbox.stub(PersistenceWriteAPI, "getChangesWarning").resolves({
				showWarning: false
			});

			return adaptationStarter({
				rootControl: oAppComponent,
				flexSettings: {
					layer: "CUSTOMER"
				}
			})
			.then(function () {
				assert.strictEqual(this.fnMessageBoxStub.callCount, 0, "then the warning is not shown");
			}.bind(this));
		});
	});

	QUnit.done(function () {
		oAppComponent.destroy();
		jQuery("#qunit-fixture").hide();
	});
});