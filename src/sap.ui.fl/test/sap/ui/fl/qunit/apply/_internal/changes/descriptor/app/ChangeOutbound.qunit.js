/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/app/ChangeOutbound",
	"sap/ui/fl/apply/_internal/flexObjects/AppDescriptorChange"
], function(
	ChangeOutbound,
	AppDescriptorChange
) {
	"use strict";

	QUnit.module("applyChange", {
		beforeEach() {
			this.oChangeArray = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeOutbound"
				},
				content: {
					outboundId: "Risk-configure",
					entityPropertyChange: [
						{
							propertyPath: "semanticObject",
							operation: "UPDATE",
							propertyValue: "newObject"
						},
						{
							propertyPath: "action",
							operation: "UPSERT",
							propertyValue: "test"
						},
						{
							propertyPath: "additionalParameters",
							operation: "UPSERT",
							propertyValue: "allowed"
						}
					]
				}
			});

			this.oChangeSingle = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeOutbound"
				},
				content: {
					outboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "additionalParameters",
							operation: "UPSERT",
							propertyValue: "ignored"
						}
				}
			});

			this.oChangeSingleParameters = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeOutbound"
				},
				content: {
					outboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "parameters/id/required",
							operation: "UPSERT",
							propertyValue: false
						}
				}
			});

			this.oChangeArrayParameters = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeOutbound"
				},
				content: {
					outboundId: "Risk-configure",
					entityPropertyChange: [
						{
							propertyPath: "parameters/id/required",
							operation: "UPSERT",
							propertyValue: false
						},
						{
							propertyPath: "parameters/pathToProertyUpdate/propertyUpdate",
							operation: "UPDATE",
							propertyValue: "updatedValue"
						},
						{
							propertyPath: "parameters/pathToProertyInsert/propertyInsert",
							operation: "UPSERT",
							propertyValue: "insertedValue"
						}
					]
				}
			});

			this.oChangeUnsupportedChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeOutbound"
				},
				content: {
					outboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "icon",
							operation: "UPSERT",
							propertyValue: "newIcon"
						}
				}
			});

			this.oChangeGenericPathUnsupportedChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeOutbound"
				},
				content: {
					outboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "parameter/id",
							operation: "UPSERT",
							propertyValue: false
						}
				}
			});

			this.oChangeUnsupportedOperation = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeOutbound"
				},
				content: {
					outboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "action",
							operation: "INSERT",
							propertyValue: "newAction"
						}
				}
			});

			this.oChangeNoId = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeOutbound"
				},
				content: {
					outboundId: "",
					entityPropertyChange:
						{
							propertyPath: "title",
							operation: "INSERT",
							propertyValue: "{{new.title}}"
						}
				}
			});

			this.oChangeNoChanges = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeOutbound"
				},
				content: {
					outboundId: "Risk-configure",
					entityPropertyChange: ""
				}
			});

			this.oChangeInvalidFormat = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeOutbound"
				},
				content: {
					outboundId: "Risk-configure",
					entityPropertyChange: [
						{
							propertyPath: "",
							operation: "",
							propertyValue: ""
						}
					]
				}
			});

			this.oChangeNoValue = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeOutbound"
				},
				content: {
					outboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "additionalParameters",
							operation: "UPDATE",
							propertyValue: "allowed"
						}
				}
			});

			this.oChangeUnsupportedPattern = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeOutbound"
				},
				content: {
					outboundId: "Risk-configure",
					entityPropertyChange: [
						{
							propertyPath: "semanticObject",
							operation: "UPSERT",
							propertyValue: "newObject!?"
						}
					]
				}
			});

			this.oChangeComplexPopertyPathSingle = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeOutbound"
				},
				content: {
					outboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "parameters/Company\\/Name/value/value",
							operation: "UPSERT",
							propertyValue: "newValue"
						}
				}
			});

			this.oChangeComplexPopertyPath = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeOutbound"
				},
				content: {
					outboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "parameters/Company\\/Name/To\\/Value/value",
							operation: "UPSERT",
							propertyValue: "newValue"
						}
				}
			});

			this.oChangeMoreComplexPopertyPath = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeOutbound"
				},
				content: {
					outboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "parameters/Company\\/Name\\/End/To\\/Value\\/End/value",
							operation: "UPSERT",
							propertyValue: "newValue"
						}
				}
			});

			this.oChangeUnsupportedSemanticObject = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeOutbound"
				},
				content: {
					outboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "semanticObject",
							operation: "UPSERT",
							propertyValue: "unsupported."
						}
				}
			});

			this.oChangeUnsupportedAction = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeOutbound"
				},
				content: {
					outboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "action",
							operation: "UPSERT",
							propertyValue: "unsupported."
						}
				}
			});

			this.oChangeUnsupportedAdditionalParameters = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeOutbound"
				},
				content: {
					outboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "additionalParameters",
							operation: "UPSERT",
							propertyValue: "IgNoReD"
						}
				}
			});
		}
	}, function() {
		QUnit.test("when calling '_applyChange' with several changes in array", function(assert) {
			const oManifest = {
				"sap.app": {
					crossNavigation: {
						outbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								additionalParameters: "ignored"
							}
						}
					}
				}
			};
			const oNewManifest = ChangeOutbound.applyChange(oManifest, this.oChangeArray);
			assert.equal(oNewManifest["sap.app"].crossNavigation.outbounds["Risk-configure"].semanticObject, "newObject", "outbound is updated correctly");
			assert.equal(oNewManifest["sap.app"].crossNavigation.outbounds["Risk-configure"].action, "test", "outbound is updated correctly");
			assert.equal(oNewManifest["sap.app"].crossNavigation.outbounds["Risk-configure"].additionalParameters, "allowed", "outbound is updated correctly");
		});

		QUnit.test("when calling '_applyChange' with single change", function(assert) {
			const oManifest = {
				"sap.app": {
					crossNavigation: {
						outbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								additionalParameters: "allowed"
							}
						}
					}
				}
			};
			const oNewManifest = ChangeOutbound.applyChange(oManifest, this.oChangeSingle);
			assert.equal(oNewManifest["sap.app"].crossNavigation.outbounds["Risk-configure"].additionalParameters, "ignored", "outbound is updated correctly");
		});

		QUnit.test("when calling '_applyChange' with single change for parameters/", function(assert) {
			const oManifest = {
				"sap.app": {
					crossNavigation: {
						outbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								additionalParameters: "allowed",
								parameters: {
									id: {
										required: true
									}
								}
							}
						}
					}
				}
			};
			const oNewManifest = ChangeOutbound.applyChange(oManifest, this.oChangeSingleParameters);
			assert.equal(oNewManifest["sap.app"].crossNavigation.outbounds["Risk-configure"].parameters.id.required, false, "outbound is updated correctly");
		});

		QUnit.test("when calling '_applyChange' with more than one change for parameters/", function(assert) {
			const oManifest = {
				"sap.app": {
					crossNavigation: {
						outbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								parameters: {
									id: {
										required: true
									},
									pathToProertyUpdate: {
										propertyUpdate: "value"
									}
								}
							}
						}
					}
				}
			};
			const oNewManifest = ChangeOutbound.applyChange(oManifest, this.oChangeArrayParameters);
			assert.equal(oNewManifest["sap.app"].crossNavigation.outbounds["Risk-configure"].parameters.id.required, false, "outbound is updated correctly");
			assert.equal(oNewManifest["sap.app"].crossNavigation.outbounds["Risk-configure"].parameters.pathToProertyUpdate.propertyUpdate, "updatedValue", "outbound is updated correctly");
			assert.equal(oNewManifest["sap.app"].crossNavigation.outbounds["Risk-configure"].parameters.pathToProertyInsert.propertyInsert, "insertedValue", "outbound is inserted correctly");
		});

		QUnit.test("when calling '_applyChange' with no outbound exists", function(assert) {
			const oManifest = {
				"sap.app": {
					crossNavigation: {
						outbounds: {}
					}
				}
			};
			assert.throws(function() {
				ChangeOutbound.applyChange(oManifest, this.oChangeSingle);
			}, Error("Nothing to update. outbound with ID \"Risk-configure\" does not exist."), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with unsupported change", function(assert) {
			const oManifest = {
				"sap.app": {
					crossNavigation: {
						outbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								additionalParameters: "notallowed"
							}
						}
					}
				}
			};
			assert.throws(function() {
				ChangeOutbound.applyChange(oManifest, this.oChangeUnsupportedChange);
			}, Error("Changing icon is not supported. The supported 'propertyPath' is: semanticObject|action|additionalParameters|parameters/*"), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with unsupported change for gernic path", function(assert) {
			const oManifest = {
				"sap.app": {
					crossNavigation: {
						outbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								parameters: {
									id: {
										required: true
									},
									pathToProertyUpdate: {
										propertyUpdate: "value"
									}
								}
							}
						}
					}
				}
			};
			assert.throws(function() {
				ChangeOutbound.applyChange(oManifest, this.oChangeGenericPathUnsupportedChange);
			}, Error("Changing parameter/id is not supported. The supported 'propertyPath' is: semanticObject|action|additionalParameters|parameters/*"), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with an unsupported operation", function(assert) {
			const oManifest = {
				"sap.app": {
					crossNavigation: {
						outbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								additionalParameters: "notallowed"
							}
						}
					}
				}
			};
			assert.throws(function() {
				ChangeOutbound.applyChange(oManifest, this.oChangeUnsupportedOperation);
			}, Error("Operation INSERT is not supported. The supported 'operation' is UPDATE|UPSERT"), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with wrong manifest", function(assert) {
			const oManifest = {
				"sap.app": {}
			};
			assert.throws(function() {
				ChangeOutbound.applyChange(oManifest, this.oChangeArray);
			}, Error("sap.app/crossNavigation or sap.app/crossNavigation/outbounds sections have not been found in manifest.json"), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with no ID", function(assert) {
			const oManifest = {
				"sap.app": {
					crossNavigation: {
						outbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								additionalParameters: "allowed"
							}
						}
					}
				}
			};
			assert.throws(function() {
				ChangeOutbound.applyChange(oManifest, this.oChangeNoId);
			}, Error("Mandatory \"outboundId\" parameter is not provided."), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with no changes", function(assert) {
			const oManifest = {
				"sap.app": {
					crossNavigation: {
						outbounds: {
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
			assert.throws(function() {
				ChangeOutbound.applyChange(oManifest, this.oChangeNoChanges);
			}, Error("Changes for \"Risk-configure\" are not provided."), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with invalid change format", function(assert) {
			const oManifest = {
				"sap.app": {
					crossNavigation: {
						outbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								additionalParameters: "allowed"
							}
						}
					}
				}
			};
			assert.throws(function() {
				ChangeOutbound.applyChange(oManifest, this.oChangeInvalidFormat);
			}, Error("Invalid change format: The mandatory 'propertyPath' is not defined. Please define the mandatory property 'propertyPath'"), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with UPDATE and no value in manifest", function(assert) {
			const oManifest = {
				"sap.app": {
					crossNavigation: {
						outbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								additionalParameters: ""
							}
						}
					}
				}
			};
			assert.throws(function() {
				ChangeOutbound.applyChange(oManifest, this.oChangeNoValue);
			}, Error("Path does not contain a value. 'UPDATE' operation is not appropriate."), "throws an error");
		});
		QUnit.test("when calling '_applyChange' with an unsupported pattern", function(assert) {
			const oManifest = {
				"sap.app": {
					crossNavigation: {
						outbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure"
							}
						}
					}
				}
			};
			assert.throws(function() {
				ChangeOutbound.applyChange(oManifest, this.oChangeUnsupportedPattern);
			}, Error("Not supported format for propertyPath semanticObject. The supported pattern is ^[\\w\\*]{0,30}$"), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with single complex propertyPath", function(assert) {
			const oManifest = {
				"sap.app": {
					crossNavigation: {
						outbounds: {
							"Risk-configure": {
								semanticObject: "Address",
								action: "display",
								additionalParameters: "ignored",
								parameters: {
									"Company/Name": {
										value: {
											value: "oldValue",
											format: "plain"
										},
										required: true
									}
								}
							}
						}
					}
				}
			};
			const oNewManifest = ChangeOutbound.applyChange(oManifest, this.oChangeComplexPopertyPathSingle);
			assert.equal(oNewManifest["sap.app"].crossNavigation.outbounds["Risk-configure"].parameters["Company/Name"].value.value, "newValue", "outbound is updated correctly");
		});

		QUnit.test("when calling '_applyChange' with two complex propertyPaths", function(assert) {
			const oManifest = {
				"sap.app": {
					crossNavigation: {
						outbounds: {
							"Risk-configure": {
								semanticObject: "Address",
								action: "display",
								additionalParameters: "ignored",
								parameters: {
									"Company/Name": {
										"To/Value": {
											value: "oldValue",
											format: "plain"
										},
										required: true
									}
								}
							}
						}
					}
				}
			};
			const oNewManifest = ChangeOutbound.applyChange(oManifest, this.oChangeComplexPopertyPath);
			assert.equal(oNewManifest["sap.app"].crossNavigation.outbounds["Risk-configure"].parameters["Company/Name"]["To/Value"].value, "newValue", "outbound is updated correctly");
		});

		QUnit.test("when calling '_applyChange' with three complex propertyPaths", function(assert) {
			const oManifest = {
				"sap.app": {
					crossNavigation: {
						outbounds: {
							"Risk-configure": {
								semanticObject: "Address",
								action: "display",
								additionalParameters: "ignored",
								parameters: {
									"Company/Name/End": {
										"To/Value/End": {
											value: "oldValue",
											format: "plain"
										},
										required: true
									}
								}
							}
						}
					}
				}
			};
			const oNewManifest = ChangeOutbound.applyChange(oManifest, this.oChangeMoreComplexPopertyPath);
			assert.equal(oNewManifest["sap.app"].crossNavigation.outbounds["Risk-configure"].parameters["Company/Name/End"]["To/Value/End"].value, "newValue", "outbound is updated correctly");
		});

		QUnit.test("when calling '_applyChange' with unsupported vaules of parameter semanticObject", function(assert) {
			const oManifest = {
				"sap.app": {
					crossNavigation: {
						outbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								additionalParameters: "allowed"
							}
						}
					}
				}
			};
			assert.throws(function() {
				ChangeOutbound.applyChange(oManifest, this.oChangeUnsupportedSemanticObject);
			}, Error("Not supported format for propertyPath semanticObject. The supported pattern is ^[\\w\\*]{0,30}$"), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with unsupported vaules of parameter action", function(assert) {
			const oManifest = {
				"sap.app": {
					crossNavigation: {
						outbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								additionalParameters: "allowed"
							}
						}
					}
				}
			};
			assert.throws(function() {
				ChangeOutbound.applyChange(oManifest, this.oChangeUnsupportedAction);
			}, Error("Not supported format for propertyPath action. The supported pattern is ^[\\w\\*]{0,60}$"), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with unsupported vaules of parameter additionalParameters", function(assert) {
			const oManifest = {
				"sap.app": {
					crossNavigation: {
						outbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								additionalParameters: "allowed"
							}
						}
					}
				}
			};
			assert.throws(function() {
				ChangeOutbound.applyChange(oManifest, this.oChangeUnsupportedAdditionalParameters);
			}, Error("Not supported format for propertyPath additionalParameters. The supported pattern is ^(ignored|allowed|notallowed)$"), "throws an error");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
