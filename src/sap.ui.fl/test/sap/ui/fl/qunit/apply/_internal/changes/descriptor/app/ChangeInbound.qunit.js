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
							propertyPath: "shortTitle",
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
							operation: "INSERT",
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
			}, Error("Changing shortTitle is not supported. The supported 'propertyPath' is: semanticObject|action|title|subTitle|icon|signature/parameters/*"), "throws an error");
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
			}, Error("Changing signature/parameter/id is not supported. The supported 'propertyPath' is: semanticObject|action|title|subTitle|icon|signature/parameters/*"), "throws an error");
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
			}, Error("Operation INSERT is not supported. The supported 'operation' is UPDATE|UPSERT"), "throws an error");
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
								additionalParameters: "ignored",
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
								additionalParameters: "ignored",
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
								additionalParameters: "ignored",
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
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
