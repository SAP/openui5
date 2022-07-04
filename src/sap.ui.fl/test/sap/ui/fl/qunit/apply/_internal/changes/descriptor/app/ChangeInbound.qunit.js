/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/app/ChangeInbound",
	"sap/ui/fl/Change"
], function (
	ChangeInbound,
	Change
) {
	"use strict";

	QUnit.module("applyChange", {
		beforeEach: function () {
			this.oChangeArray = new Change({
				changeType: "appdescr_app_changeInbound",
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange: [
						{
							propertyPath: "title",
							operation: "UPDATE",
							propertyValue: "{{new.title}}"
						},
						{
							propertyPath: "subTitle",
							operation: "UPSERT",
							propertyValue: "{{new.subtitle}}"
						}
					]
				}
			});

			this.oChangeSingle = new Change({
				changeType: "appdescr_app_changeInbound",
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "icon",
							operation: "UPSERT",
							propertyValue: "newicon"
						}
				}
			});

			this.oChangeUnsupportedChange = new Change({
				changeType: "appdescr_app_changeInbound",
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "semanticObject",
							operation: "UPSERT",
							propertyValue: "newObject"
						}
				}
			});

			this.oChangeUnsupportedOperation = new Change({
				changeType: "appdescr_app_changeInbound",
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "title",
							operation: "INSERT",
							propertyValue: "{{new.title}}"
						}
				}
			});

			this.oChangeNoId = new Change({
				changeType: "appdescr_app_changeInbound",
				content: {
					inboundId: "",
					entityPropertyChange:
						{
							propertyPath: "title",
							operation: "INSERT",
							propertyValue: "{{new.title}}"
						}
				}
			});

			this.oChangeNoChanges = new Change({
				changeType: "appdescr_app_changeInbound",
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange: ""
				}
			});

			this.oChangeInvalidFormat = new Change({
				changeType: "appdescr_app_changeInbound",
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange: [
						{
							propertyPath: "",
							operation: "",
							propertyValue: ""
						}
					]
				}
			});

			this.oChangeNoValue = new Change({
				changeType: "appdescr_app_changeInbound",
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "title",
							operation: "UPDATE",
							propertyValue: "{{new.title}}"
						}
				}
			});
		}
	}, function () {
		QUnit.test("when calling '_applyChange' with several changes in array", function (assert) {
			var oManifest = {
				"sap.app": {
					crossNavigation: {
						inbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								title: "some",
								subTitle: "some"
							}
						}
					}
				}
			};
			var oNewManifest = ChangeInbound.applyChange(oManifest, this.oChangeArray);
			assert.equal(oNewManifest["sap.app"]["crossNavigation"]["inbounds"]["Risk-configure"].title, "{{new.title}}", "inbound is updated correctly");
			assert.equal(oNewManifest["sap.app"]["crossNavigation"]["inbounds"]["Risk-configure"].subTitle, "{{new.subtitle}}", "inbound is updated correctly");
		});

		QUnit.test("when calling '_applyChange' with single change", function (assert) {
			var oManifest = {
				"sap.app": {
					crossNavigation: {
						inbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								title: "some",
								subTitle: "some",
								icon: "icon"
							}
						}
					}
				}
			};
			var oNewManifest = ChangeInbound.applyChange(oManifest, this.oChangeSingle);
			assert.equal(oNewManifest["sap.app"]["crossNavigation"]["inbounds"]["Risk-configure"].icon, "newicon", "inbound is updated correctly");
		});

		QUnit.test("when calling '_applyChange' with no inbound exists", function (assert) {
			var oManifest = {
				"sap.app": {
					crossNavigation: {
						inbounds: {}
					}
				}
			};
			assert.throws(function () {
				ChangeInbound.applyChange(oManifest, this.oChangeSingle);
			}, Error("Nothing to update. Inbound with ID \"Risk-configure\" does not exist."), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with unsupported change", function (assert) {
			var oManifest = {
				"sap.app": {
					crossNavigation: {
						inbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								title: "some",
								subTitle: "some"
							}
						}
					}
				}
			};
			assert.throws(function () {
				ChangeInbound.applyChange(oManifest, this.oChangeUnsupportedChange);
			}, Error("Changing semanticObject is not supported. The supported 'propertyPath' is: title|subTitle|icon"), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with an unsupported operation", function (assert) {
			var oManifest = {
				"sap.app": {
					crossNavigation: {
						inbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								title: "some",
								subTitle: "some"
							}
						}
					}
				}
			};
			assert.throws(function () {
				ChangeInbound.applyChange(oManifest, this.oChangeUnsupportedOperation);
			}, Error("Operation INSERT is not supported. The supported 'operation' is UPDATE|UPSERT"), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with wrong manifest", function (assert) {
			var oManifest = {
				"sap.app": {}
			};
			assert.throws(function () {
				ChangeInbound.applyChange(oManifest, this.oChangeArray);
			}, Error("sap.app/crossNavigation or sap.app/crossNavigation/inbounds sections have not been found in manifest.json"), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with no ID", function (assert) {
			var oManifest = {
				"sap.app": {
					crossNavigation: {
						inbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								title: "some",
								subTitle: "some"
							}
						}
					}
				}
			};
			assert.throws(function () {
				ChangeInbound.applyChange(oManifest, this.oChangeNoId);
			}, Error("Mandatory \"inboundId\" parameter is not provided."), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with no changes", function (assert) {
			var oManifest = {
				"sap.app": {
					crossNavigation: {
						inbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								title: "some",
								subTitle: "some"
							}
						}
					}
				}
			};
			assert.throws(function () {
				ChangeInbound.applyChange(oManifest, this.oChangeNoChanges);
			}, Error("Changes for \"Risk-configure\" are not provided."), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with invalid change format", function (assert) {
			var oManifest = {
				"sap.app": {
					crossNavigation: {
						inbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								title: "some",
								subTitle: "some"
							}
						}
					}
				}
			};
			assert.throws(function () {
				ChangeInbound.applyChange(oManifest, this.oChangeInvalidFormat);
			}, Error("Invalid change format: The mandatory 'propertyPath' is not defined. Please define the mandatory property 'propertyPath'"), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with UPDATE and no value in manifest", function (assert) {
			var oManifest = {
				"sap.app": {
					crossNavigation: {
						inbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								title: "",
								subTitle: "some"
							}
						}
					}
				}
			};
			assert.throws(function () {
				ChangeInbound.applyChange(oManifest, this.oChangeNoValue);
			}, Error("Path does not contain a value. 'UPDATE' operation is not appropriate."), "throws an error");
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
