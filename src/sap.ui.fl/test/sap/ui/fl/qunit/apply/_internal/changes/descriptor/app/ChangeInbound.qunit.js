/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/app/ChangeInbound",
	"sap/ui/fl/apply/_internal/flexObjects/AppDescriptorChange"
], function(
	ChangeInbound,
	AppDescriptorChange
) {
	"use strict";

	QUnit.module("applyChange", {
		beforeEach() {
			this.oChangeArray = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
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
						},
						{
							propertyPath: "semanticObject",
							operation: "UPSERT",
							propertyValue: "newObject"
						},
						{
							propertyPath: "action",
							operation: "UPSERT",
							propertyValue: "test"
						}
					]
				}
			});

			this.oChangeSingle = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
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

			this.oChangeSingleSignatureParameters = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "signature/parameters/id/required",
							operation: "UPSERT",
							propertyValue: false
						}
				}
			});

			this.oChangeArraySignatureParameters = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange: [
						{
							propertyPath: "signature/parameters/id/required",
							operation: "UPSERT",
							propertyValue: false
						},
						{
							propertyPath: "signature/parameters/pathToProertyUpdate/propertyUpdate",
							operation: "UPDATE",
							propertyValue: "updatedValue"
						},
						{
							propertyPath: "signature/parameters/pathToProertyInsert/propertyInsert",
							operation: "UPSERT",
							propertyValue: "insertedValue"
						}
					]
				}
			});

			this.oChangeUnsupportedChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "unsupportedProperty",
							operation: "UPSERT",
							propertyValue: "newObject"
						}
				}
			});

			this.oChangeGenericPathUnsupportedChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "signature/parameter/id",
							operation: "UPSERT",
							propertyValue: false
						}
				}
			});

			this.oChangeUnsupportedOperation = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "title",
							operation: "UNSUPPORTED",
							propertyValue: "{{new.title}}"
						}
				}
			});

			this.oChangeNoId = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
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

			this.oChangeNoChanges = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange: ""
				}
			});

			this.oChangeInvalidFormat = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
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

			this.oChangeNoValue = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
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

			this.oChangeUnsupportedPattern = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
				content: {
					inboundId: "Risk-configure",
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
					changeType: "appdescr_app_changeInbound"
				},
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "signature/parameters/Company\\/Name/value/value",
							operation: "UPSERT",
							propertyValue: "newValue"
						}
				}
			});

			this.oChangeComplexPopertyPath = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "signature/parameters/Company\\/Name/To\\/Value/value",
							operation: "UPSERT",
							propertyValue: "newValue"
						}
				}
			});

			this.oChangeMoreComplexPopertyPath = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "signature/parameters/Company\\/Name\\/End/To\\/Value\\/End/value",
							operation: "UPSERT",
							propertyValue: "newValue"
						}
				}
			});

			this.oChangeDeletePropertyRequired = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "signature/parameters/id/required",
							operation: "DELETE"
						}
				}
			});

			this.oChangeDeletePropertyId = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "signature/parameters/id",
							operation: "DELETE"
						}
				}
			});

			this.oChangeDeletePropertyParameters = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "signature/parameters",
							operation: "DELETE"
						}
				}
			});

			this.oChangeDeleteArrayProperties = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange: [
						{
							propertyPath: "signature/parameters/id/required",
							operation: "DELETE"
						},
						{
							propertyPath: "signature/parameters/id",
							operation: "DELETE"
						},
						{
							propertyPath: "signature/parameters",
							operation: "DELETE"
						},
						{
							propertyPath: "signature",
							operation: "DELETE"
						}
					]
				}
			});

			this.oChangeArrayDeleteComplexPathProperties = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange: [
						{
							propertyPath: "signature/parameters/Company\\/Name\\/End/To\\/Value\\/End/value",
							operation: "DELETE"
						},
						{
							propertyPath: "signature/parameters/Company\\/Name\\/End/To\\/Value\\/End",
							operation: "DELETE"
						},
						{
							propertyPath: "signature/parameters/Company\\/Name\\/End/required",
							operation: "DELETE"
						}
					]
				}
			});

			this.oChangeDeletePropertyInvalidFormat = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "signature/parameters/id/required",
							operation: "DELETE",
							propertyValue: ""
						}
				}
			});

			this.oChangeDeleteMandatoryProperty = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "semanticObject",
							operation: "DELETE"
						}
				}
			});

			this.oChangeDeleteNotExistingProperty = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "signature/parameters/id/notExistingProperty",
							operation: "DELETE"
						}
				}
			});

			this.oChangeInsertBoolean = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "signature/parameters/id/required",
							operation: "INSERT",
							propertyValue: true
						}
				}
			});

			this.oChangeInsertString = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "signature/parameters/testString",
							operation: "INSERT",
							propertyValue: "testString"
						}
				}
			});

			this.oChangeInsertInt = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "signature/parameters/testInt",
							operation: "INSERT",
							propertyValue: 123
						}
				}
			});

			this.oChangeInsertObject = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "signature/parameters/testObject",
							operation: "INSERT",
							propertyValue: { a: "a", b: false, c: 123 }
						}
				}
			});

			this.oChangeInsertArray = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange: [
						{
							propertyPath: "signature/parameters/id/required",
							operation: "INSERT",
							propertyValue: true
						},
						{
							propertyPath: "signature/parameters/testString",
							operation: "INSERT",
							propertyValue: "testString"
						},
						{
							propertyPath: "signature/parameters/testInt",
							operation: "INSERT",
							propertyValue: 123
						},
						{
							propertyPath: "signature/parameters/testObject",
							operation: "INSERT",
							propertyValue: { a: "a", b: false, c: 123 }
						}
					]
				}
			});

			this.oChangeInsertNotAllowedPath = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "test",
							operation: "INSERT",
							propertyValue: "notAllowedPath"
						}
				}
			});

			this.oChangeInsertParameters = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "signature/parameters",
							operation: "INSERT",
							propertyValue: {}
						}
				}
			});

			this.oChangeInsertAlreadyExistingProperty = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "action",
							operation: "INSERT",
							propertyValue: "test"
						}
				}
			});

			this.oChangeInsertComplexPath = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_app_changeInbound"
				},
				content: {
					inboundId: "Risk-configure",
					entityPropertyChange:
						{
							propertyPath: "signature/parameters/Company\\/Name\\/End/To\\/Value\\/End/value",
							operation: "INSERT",
							propertyValue: "complexPathValue"
						}
				}
			});
		}
	}, function() {
		QUnit.test("when calling '_applyChange' with several changes in array", function(assert) {
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
			assert.equal(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"].title, "{{new.title}}", "inbound is updated correctly");
			assert.equal(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"].subTitle, "{{new.subtitle}}", "inbound is updated correctly");
			assert.equal(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"].semanticObject, "newObject", "inbound is updated correctly");
			assert.equal(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"].action, "test", "inbound is updated correctly");
		});

		QUnit.test("when calling '_applyChange' with single change", function(assert) {
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
			assert.equal(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"].icon, "newicon", "inbound is updated correctly");
		});

		QUnit.test("when calling '_applyChange' with single change for signature/parameters", function(assert) {
			var oManifest = {
				"sap.app": {
					crossNavigation: {
						inbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								title: "some",
								subTitle: "some",
								icon: "icon",
								signature: {
									parameters: {
										id: {
											required: true
										}
									}
								}
							}
						}
					}
				}
			};
			var oNewManifest = ChangeInbound.applyChange(oManifest, this.oChangeSingleSignatureParameters);
			assert.equal(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"].signature.parameters.id.required, false, "inbound is updated correctly");
		});

		QUnit.test("when calling '_applyChange' with more than one change for signature/parameters", function(assert) {
			var oManifest = {
				"sap.app": {
					crossNavigation: {
						inbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								title: "some",
								subTitle: "some",
								icon: "icon",
								signature: {
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
				}
			};
			var oNewManifest = ChangeInbound.applyChange(oManifest, this.oChangeArraySignatureParameters);
			assert.equal(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"].signature.parameters.id.required, false, "inbound is updated correctly");
			assert.equal(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"].signature.parameters.pathToProertyUpdate.propertyUpdate, "updatedValue", "inbound is updated correctly");
			assert.equal(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"].signature.parameters.pathToProertyInsert.propertyInsert, "insertedValue", "inbound is inserted correctly");
		});

		QUnit.test("when calling '_applyChange' with deletion for signature/parameters/", function(assert) {
			const oManifest = {
				"sap.app": {
					crossNavigation: {
						inbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								title: "some",
								subTitle: "some",
								icon: "icon",
								signature: {
									parameters: {
										id: {
											required: true
										}
									}
								}
							}
						}
					}
				}
			};
			let oNewManifest = ChangeInbound.applyChange(oManifest, this.oChangeDeletePropertyRequired);
			assert.equal(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"].signature.parameters.id.required, undefined, "property is deleted correctly");
			assert.deepEqual(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"].signature.parameters.id, {}, "property is deleted correctly");

			oNewManifest = ChangeInbound.applyChange(oManifest, this.oChangeDeletePropertyId);
			assert.equal(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"].signature.parameters.id, undefined, "property is deleted correctly");
			assert.deepEqual(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"].signature.parameters, {}, "property is deleted correctly");

			oNewManifest = ChangeInbound.applyChange(oManifest, this.oChangeDeletePropertyParameters);
			assert.equal(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"].signature.parameters, undefined, "property is deleted correctly");
			assert.deepEqual(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"],
				{
					action: "configure",
					icon: "icon",
					semanticObject: "Risk",
					signature: {},
					subTitle: "some",
					title: "some"
				}, "property is deleted correctly");
		});

		QUnit.test("when calling '_applyChange' with deletion of complete object for signature/parameters/", function(assert) {
			const oManifest = {
				"sap.app": {
					crossNavigation: {
						inbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								title: "some",
								subTitle: "some",
								icon: "icon",
								signature: {
									parameters: {
										id: {
											required: true
										}
									}
								}
							}
						}
					}
				}
			};
			const oNewManifest = ChangeInbound.applyChange(oManifest, this.oChangeDeletePropertyParameters);
			assert.equal(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"].signature.parameters, undefined, "property is deleted correctly");
			assert.deepEqual(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"],
				{
					action: "configure",
					icon: "icon",
					semanticObject: "Risk",
					signature: {},
					subTitle: "some",
					title: "some"
				}, "property is deleted correctly");
		});

		QUnit.test("when calling '_applyChange' with deletion array for signature/parameters/", function(assert) {
			const oManifest = {
				"sap.app": {
					crossNavigation: {
						inbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								title: "some",
								subTitle: "some",
								icon: "icon",
								signature: {
									parameters: {
										id: {
											required: true
										}
									}
								}
							}
						}
					}
				}
			};
			const oNewManifest = ChangeInbound.applyChange(oManifest, this.oChangeDeleteArrayProperties);
			assert.deepEqual(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"],
				{
					action: "configure",
					icon: "icon",
					semanticObject: "Risk",
					subTitle: "some",
					title: "some"
				}, "property is deleted correctly");
		});

		QUnit.test("when calling '_applyChange' with not existing parameter to delete", function(assert) {
			const oManifest = {
				"sap.app": {
					crossNavigation: {
						inbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								title: "some",
								subTitle: "some",
								icon: "icon",
								signature: {
									parameters: {
										id: {
											required: true
										}
									}
								}
							}
						}
					}
				}
			};
			const oNewManifest = ChangeInbound.applyChange(oManifest, this.oChangeDeleteNotExistingProperty);
			assert.deepEqual(oNewManifest, oManifest, "property is not deleted");
		});

		QUnit.test("when calling '_applyChange' with deletion of mandatory property'", function(assert) {
			const oManifest = {
				"sap.app": {
					crossNavigation: {
						inbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								title: "some",
								subTitle: "some",
								icon: "icon",
								signature: {
									parameters: {
										id: {
											required: true
										}
									}
								}
							}
						}
					}
				}
			};
			assert.throws(function() {
				ChangeInbound.applyChange(oManifest, this.oChangeDeleteMandatoryProperty);
			}, Error("The property 'semanticObject' was attempted to be deleted. The mandatory properties semanticObject|action cannot be deleted."), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with invalid DELETE property 'propertyValue'", function(assert) {
			const oManifest = {
				"sap.app": {
					crossNavigation: {
						inbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								title: "some",
								subTitle: "some",
								icon: "icon",
								signature: {
									parameters: {
										id: {
											required: true
										}
									}
								}
							}
						}
					}
				}
			};
			assert.throws(function() {
				ChangeInbound.applyChange(oManifest, this.oChangeDeletePropertyInvalidFormat);
			}, Error("The property 'propertyValue' must not be provided in a 'DELETE' operation. Please remove 'propertyValue'."), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with insert properties in signature/parameters/", function(assert) {
			const oManifest = {
				"sap.app": {
					crossNavigation: {
						inbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								title: "some",
								subTitle: "some",
								icon: "icon",
								signature: {
								}
							}
						}
					}
				}
			};
			let oNewManifest = ChangeInbound.applyChange(oManifest, this.oChangeInsertBoolean);
			assert.equal(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"].signature.parameters.id.required, true, "property is inserted correctly");

			oNewManifest = ChangeInbound.applyChange(oManifest, this.oChangeInsertString);
			assert.equal(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"].signature.parameters.testString, "testString", "property is inserted correctly");

			oNewManifest = ChangeInbound.applyChange(oManifest, this.oChangeInsertInt);
			assert.equal(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"].signature.parameters.testInt, 123, "property is inserted correctly");

			oNewManifest = ChangeInbound.applyChange(oManifest, this.oChangeInsertObject);
			assert.deepEqual(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"].signature.parameters.testObject, { a: "a", b: false, c: 123 }, "property is inserted correctly");

			assert.deepEqual(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"],
				{
					action: "configure",
					title: "some",
					subTitle: "some",
					icon: "icon",
					semanticObject: "Risk",
					signature: {
						parameters: {
							id: {
								required: true
							},
							testInt: 123,
							testObject: {
								a: "a",
								b: false,
								c: 123
							},
							testString: "testString"
					  }
					}
				  }, "properties inserted correctly");
		});

		QUnit.test("when calling '_applyChange' with insert properties as array in signature/parameters/", function(assert) {
			const oManifest = {
				"sap.app": {
					crossNavigation: {
						inbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								title: "some",
								subTitle: "some",
								icon: "icon",
								signature: {
								}
							}
						}
					}
				}
			};
			const oNewManifest = ChangeInbound.applyChange(oManifest, this.oChangeInsertArray);
			assert.equal(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"].signature.parameters.id.required, true, "property is inserted correctly");
			assert.equal(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"].signature.parameters.testString, "testString", "property is inserted correctly");
			assert.equal(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"].signature.parameters.testInt, 123, "property is inserted correctly");
			assert.deepEqual(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"].signature.parameters.testObject, { a: "a", b: false, c: 123 }, "property is inserted correctly");
			assert.deepEqual(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"],
				{
					action: "configure",
					title: "some",
					subTitle: "some",
					icon: "icon",
					semanticObject: "Risk",
					signature: {
						parameters: {
							id: {
								required: true
							},
							testInt: 123,
							testObject: {
								a: "a",
								b: false,
								c: 123
							},
							testString: "testString"
					  }
					}
				  }, "properties inserted correctly");
		});

		QUnit.test("when calling '_applyChange' insert property parameters", function(assert) {
			const oManifest = {
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
			const oNewManifest = ChangeInbound.applyChange(oManifest, this.oChangeInsertParameters);
			assert.deepEqual(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"].signature.parameters, { }, "property is inserted correctly");
		});

		QUnit.test("when calling '_applyChange' insert property in not supported path", function(assert) {
			const oManifest = {
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

			assert.throws(function() {
				ChangeInbound.applyChange(oManifest, this.oChangeInsertNotAllowedPath);
			}, Error("Changing test is not supported. The supported 'propertyPath' is: semanticObject|action|hideLauncher|icon|title|shortTitle|subTitle|info|indicatorDataSource|deviceTypes|displayMode|signature/parameters/*"), "throws an error");
		});

		QUnit.test("when calling '_applyChange' insert property which already exist", function(assert) {
			const oManifest = {
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

			assert.throws(function() {
				ChangeInbound.applyChange(oManifest, this.oChangeInsertAlreadyExistingProperty);
			}, Error("Path has already a value. 'INSERT' operation is not appropriate."), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with no inbound exists", function(assert) {
			var oManifest = {
				"sap.app": {
					crossNavigation: {
						inbounds: {}
					}
				}
			};
			assert.throws(function() {
				ChangeInbound.applyChange(oManifest, this.oChangeSingle);
			}, Error("Nothing to update. Inbound with ID \"Risk-configure\" does not exist."), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with unsupported change", function(assert) {
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
			assert.throws(function() {
				ChangeInbound.applyChange(oManifest, this.oChangeUnsupportedChange);
			}, Error("Changing unsupportedProperty is not supported. The supported 'propertyPath' is: semanticObject|action|hideLauncher|icon|title|shortTitle|subTitle|info|indicatorDataSource|deviceTypes|displayMode|signature/parameters/*"), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with unsupported change for gernic path", function(assert) {
			var oManifest = {
				"sap.app": {
					crossNavigation: {
						inbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								title: "some",
								subTitle: "some",
								signature: {
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
				}
			};
			assert.throws(function() {
				ChangeInbound.applyChange(oManifest, this.oChangeGenericPathUnsupportedChange);
			}, Error("Changing signature/parameter/id is not supported. The supported 'propertyPath' is: semanticObject|action|hideLauncher|icon|title|shortTitle|subTitle|info|indicatorDataSource|deviceTypes|displayMode|signature/parameters/*"), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with an unsupported operation", function(assert) {
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
			assert.throws(function() {
				ChangeInbound.applyChange(oManifest, this.oChangeUnsupportedOperation);
			}, Error("Operation UNSUPPORTED is not supported. The supported 'operation' is UPDATE|UPSERT|DELETE|INSERT"), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with wrong manifest", function(assert) {
			var oManifest = {
				"sap.app": {}
			};
			assert.throws(function() {
				ChangeInbound.applyChange(oManifest, this.oChangeArray);
			}, Error("sap.app/crossNavigation or sap.app/crossNavigation/inbounds sections have not been found in manifest.json"), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with no ID", function(assert) {
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
			assert.throws(function() {
				ChangeInbound.applyChange(oManifest, this.oChangeNoId);
			}, Error("Mandatory \"inboundId\" parameter is not provided."), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with no changes", function(assert) {
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
			assert.throws(function() {
				ChangeInbound.applyChange(oManifest, this.oChangeNoChanges);
			}, Error("Changes for \"Risk-configure\" are not provided."), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with invalid change format", function(assert) {
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
			assert.throws(function() {
				ChangeInbound.applyChange(oManifest, this.oChangeInvalidFormat);
			}, Error("Invalid change format: The mandatory 'propertyPath' is not defined. Please define the mandatory property 'propertyPath'"), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with UPDATE and no value in manifest", function(assert) {
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
			assert.throws(function() {
				ChangeInbound.applyChange(oManifest, this.oChangeNoValue);
			}, Error("Path does not contain a value. 'UPDATE' operation is not appropriate."), "throws an error");
		});
		QUnit.test("when calling '_applyChange' with an unsupported pattern", function(assert) {
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
			assert.throws(function() {
				ChangeInbound.applyChange(oManifest, this.oChangeUnsupportedPattern);
			}, Error("Not supported format for propertyPath semanticObject. The supported pattern is ^[\\w\\*]{0,30}$"), "throws an error");
		});

		QUnit.test("when calling '_applyChange' with single complex propertyPath", function(assert) {
			var oManifest = {
				"sap.app": {
					crossNavigation: {
						inbounds: {
							"Risk-configure": {
								semanticObject: "Address",
								action: "display",
								title: "some",
								subTitle: "some",
								icon: "icon",
								signature: {
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
				}
			};
			var oNewManifest = ChangeInbound.applyChange(oManifest, this.oChangeComplexPopertyPathSingle);
			assert.equal(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"].signature.parameters["Company/Name"].value.value, "newValue", "inbound is updated correctly");
		});

		QUnit.test("when calling '_applyChange' with two complex propertyPaths", function(assert) {
			var oManifest = {
				"sap.app": {
					crossNavigation: {
						inbounds: {
							"Risk-configure": {
								semanticObject: "Address",
								action: "display",
								title: "some",
								subTitle: "some",
								icon: "icon",
								signature: {
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
				}
			};
			var oNewManifest = ChangeInbound.applyChange(oManifest, this.oChangeComplexPopertyPath);
			assert.equal(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"].signature.parameters["Company/Name"]["To/Value"].value, "newValue", "inbound is updated correctly");
		});

		QUnit.test("when calling '_applyChange' with three complex propertyPaths", function(assert) {
			var oManifest = {
				"sap.app": {
					crossNavigation: {
						inbounds: {
							"Risk-configure": {
								semanticObject: "Address",
								action: "display",
								title: "some",
								subTitle: "some",
								icon: "icon",
								signature: {
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
				}
			};
			var oNewManifest = ChangeInbound.applyChange(oManifest, this.oChangeMoreComplexPopertyPath);
			assert.equal(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"].signature.parameters["Company/Name/End"]["To/Value/End"].value, "newValue", "inbound is updated correctly");
		});

		QUnit.test("when calling '_applyChange' DELETE with three complex propertyPaths", function(assert) {
			var oManifest = {
				"sap.app": {
					crossNavigation: {
						inbounds: {
							"Risk-configure": {
								semanticObject: "Address",
								action: "display",
								title: "some",
								subTitle: "some",
								icon: "icon",
								signature: {
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
				}
			};
			var oNewManifest = ChangeInbound.applyChange(oManifest, this.oChangeArrayDeleteComplexPathProperties);
			assert.deepEqual(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"],
				{
					action: "display",
					icon: "icon",
					semanticObject: "Address",
					signature: {
						parameters: {
							"Company/Name/End": {}
					  }
					},
					subTitle: "some",
					title: "some"
				},
				"inbound is deleted correctly");
		});

		QUnit.test("when calling '_applyChange' INSERT with complex propertyPath", function(assert) {
			const oManifest = {
				"sap.app": {
					crossNavigation: {
						inbounds: {
							"Risk-configure": {
								semanticObject: "Address",
								action: "display",
								title: "some",
								subTitle: "some",
								icon: "icon"
							}
						}
					}
				}
			};
			const oNewManifest = ChangeInbound.applyChange(oManifest, this.oChangeInsertComplexPath);
			assert.deepEqual(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"],
				{
					action: "display",
					title: "some",
					subTitle: "some",
					icon: "icon",
					signature: {
						parameters: {
							"Company/Name/End": {
								"To/Value/End": {
									value: "complexPathValue"
								}
							}
						}
					},
					semanticObject: "Address"
				},
				"property is instered correctly");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
