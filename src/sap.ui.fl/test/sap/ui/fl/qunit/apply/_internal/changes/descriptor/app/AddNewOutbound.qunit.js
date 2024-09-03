/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/app/AddNewOutbound",
	"sap/ui/fl/apply/_internal/flexObjects/AppDescriptorChange",
	"sap/ui/fl/Layer"
], function(
	AddNewOutbound,
	AppDescriptorChange,
	Layer
) {
	"use strict";

	QUnit.module("applyChange", {
		beforeEach() {
			this.oManifest = {
				"sap.app": {
					crossNavigation: {
						outbounds: {
							"Risk-configure": {
								semanticObject: "Risk",
								action: "configure",
								additionalParameters: "allowed",
								parameters: {}
							}
						}
					}
				}
			};

			this.oChangeLayerCustomer = new AppDescriptorChange({
				changeType: "appdescr_app_addNewOutbound",
				layer: Layer.CUSTOMER,
				content: {
					outbound: {
						"customer.contactCreate": {
							semanticObject: "Contact",
							action: "create",
							additionalParameters: "allowed",
							parameters: {}
						}
					}
				}
			});
		}
	}, function() {
		QUnit.test("when calling '_applyChange' adding a new outbound in a manifest from customer", function(assert) {
			var oNewManifest = AddNewOutbound.applyChange(this.oManifest, this.oChangeLayerCustomer);
			assert.equal(Object.keys(oNewManifest["sap.app"].crossNavigation.outbounds).length, 2, "expected outbounds size is correct");
			assert.ok(oNewManifest["sap.app"].crossNavigation.outbounds["Risk-configure"], "Risk-configure still exits");
			assert.ok(oNewManifest["sap.app"].crossNavigation.outbounds["customer.contactCreate"], "new outbound is added correctly");
		});

		QUnit.test("when calling '_applyChange' adding a new outbound in an empty outbounds manifest", function(assert) {
			this.oManifestNoOutbounds = {
				"sap.app": {
					crossNavigation: {
						outbounds: {
						}
					}
				}
			};
			var oNewManifest = AddNewOutbound.applyChange(this.oManifestNoOutbounds, this.oChangeLayerCustomer);
			assert.equal(Object.keys(oNewManifest["sap.app"].crossNavigation.outbounds).length, 1, "expected outbounds size is correct");
			assert.ok(oNewManifest["sap.app"].crossNavigation.outbounds["customer.contactCreate"], "new outbound is added correctly");
		});

		QUnit.test("when calling '_applyChange' adding a new outbound in a manifest which has path sap.app/crossNavigation but no outbounds", function(assert) {
			this.oManifestNoPathToOutbounds2 = {
				"sap.app": {
					crossNavigation: {}
				}
			};
			var oNewManifest = AddNewOutbound.applyChange(this.oManifestNoPathToOutbounds2, this.oChangeLayerCustomer);
			assert.equal(Object.keys(oNewManifest["sap.app"].crossNavigation.outbounds).length, 1, "expected outbounds size is correct");
			assert.ok(oNewManifest["sap.app"].crossNavigation.outbounds["customer.contactCreate"], "new outbound is added correctly");
		});

		QUnit.test("when calling '_applyChange' adding a new outbound in a manifest which has path sap.app/ but no crossNavigation", function(assert) {
			this.oManifestNoPathToOutbounds1 = {
				"sap.app": {}
			};
			var oNewManifest = AddNewOutbound.applyChange(this.oManifestNoPathToOutbounds1, this.oChangeLayerCustomer);
			assert.equal(Object.keys(oNewManifest["sap.app"].crossNavigation.outbounds).length, 1, "expected outbounds size is correct");
			assert.ok(oNewManifest["sap.app"].crossNavigation.outbounds["customer.contactCreate"], "new outbound is added correctly");
		});

		QUnit.test("when calling '_applyChange' adding a new outbound in a manifest with empty inboud id", function(assert) {
			assert.throws(function() {
				// Empty outbound id
				this.oChangeEmptyOutboundId = new AppDescriptorChange({
					changeType: "appdescr_app_addNewOutbound",
					layer: Layer.CUSTOMER,
					content: {
						outbound: {
							"": {
								semanticObject: "Contact",
								action: "create",
								additionalParameters: "allowed",
								parameters: {}
							}
						}
					}
				});
				AddNewOutbound.applyChange(this.oManifest, this.oChangeEmptyOutboundId);
			}, Error("The ID of your outbound is empty."),
			"throws error that the id of the outbound must not be empty");
		});

		QUnit.test("when calling '_applyChange' without an outbound", function(assert) {
			assert.throws(function() {
				// Empty outbound
				this.oChangeNoOutbound = new AppDescriptorChange({
					changeType: "appdescr_app_addNewOutbound",
					layer: Layer.CUSTOMER,
					content: {
						outbound: {}
					}
				});
				AddNewOutbound.applyChange(this.oManifest, this.oChangeNoOutbound);
			}, Error("There is no outbound provided. Please provide an outbound."),
			 "throws an error that the change does not have an outbound");
		});

		QUnit.test("when calling '_applyChange' adding a new outbound which already exist in the manifest", function(assert) {
			assert.throws(function() {
				// Already existing outbound
				this.oChangeAlreadyExistingOutbound = new AppDescriptorChange({
					changeType: "appdescr_app_addNewOutbound",
					layer: Layer.VENDOR,
					content: {
						outbound: {
							"Risk-configure": {
								semanticObject: "Contact",
								action: "create",
								additionalParameters: "allowed",
								parameters: {}
							}
						}
					}
				});
				AddNewOutbound.applyChange(this.oManifest, this.oChangeAlreadyExistingOutbound);
			}, Error("Outbound with ID \"Risk-configure\" already exist."),
			"throws error that the outbound id already exists in the manifest");
		});

		QUnit.test("when calling '_applyChange' adding a new outbound in a manifest from customer layer with no prefix", function(assert) {
			assert.throws(function() {
				// Layer check
				this.oChangeLayerCustomerVendorNoPrefix = new AppDescriptorChange({
					changeType: "appdescr_app_addNewOutbound",
					layer: Layer.CUSTOMER,
					content: {
						outbound: {
							contactCreate: {
								semanticObject: "Contact",
								action: "create",
								additionalParameters: "allowed",
								parameters: {}
							}
						}
					}
				});
				AddNewOutbound.applyChange(this.oManifest, this.oChangeLayerCustomerVendorNoPrefix);
			}, Error("Id contactCreate must start with customer."),
			"throws error that the namespace is not compliance");
		});

		QUnit.test("when calling '_applyChange' adding more than one outbound in a manifest", function(assert) {
			assert.throws(function() {
				// More than one outbound
				this.oChangeMoreThenOneOutbound = new AppDescriptorChange({
					changeType: "appdescr_app_addNewOutbound",
					layer: Layer.CUSTOMER,
					content: {
						outbound: {
							contactCreate: {
								semanticObject: "Contact",
								action: "create",
								additionalParameters: "allowed",
								parameters: {}
							},
							someOutbound: {
								semanticObject: "SomeOutbound",
								action: "create",
								additionalParameters: "allowed",
								parameters: {}
							}
						}
					}
				});
				AddNewOutbound.applyChange(this.oManifest, this.oChangeMoreThenOneOutbound);
			}, Error("It is not allowed to add more than one outbound: contactCreate, someOutbound."),
			"throws error that you are not allowed to add more than one outbound");
		});

		QUnit.test("when calling '_applyChange' adding a change which has more then one object under content", function(assert) {
			assert.throws(function() {
				// More than one objects under change object content
				this.oChangeMoreThenOneObjectUnderContent = new AppDescriptorChange({
					changeType: "appdescr_app_addNewOutbound",
					layer: Layer.CUSTOMER,
					content: {
						outbound: {
							"customer.contactCreate": {
								semanticObject: "Contact",
								action: "create",
								additionalParameters: "allowed",
								parameters: {}
							}
						},
						anotherChangeObject: {	}
					}
				});
				AddNewOutbound.applyChange(this.oManifest, this.oChangeMoreThenOneObjectUnderContent);
			}, Error("It is not allowed to add more than one object under change object 'content'."),
			"throws error that the change object is not compliant");
		});

		QUnit.test("when calling '_applyChange' adding a change which has no object under content", function(assert) {
			assert.throws(function() {
				// No object under change object content
				this.oChangeNoObjectUnderContent = new AppDescriptorChange({
					changeType: "appdescr_app_addNewOutbound",
					layer: Layer.CUSTOMER,
					content: {	}
				});
				AddNewOutbound.applyChange(this.oManifest, this.oChangeNoObjectUnderContent);
			}, Error("The change object 'content' cannot be empty. Please provide the necessary property, as outlined in the change schema for 'appdescr_app_addNewOutbound'."),
			"throws error that the change object is not compliant");
		});

		QUnit.test("when calling '_applyChange' adding a change which has no supported object under change object content", function(assert) {
			assert.throws(function() {
				// Not supported object under change object content
				this.oChangeNotSupportedObjectUnderContent = new AppDescriptorChange({
					changeType: "appdescr_app_addNewOutbound",
					layer: Layer.CUSTOMER,
					content: {
						notSupportedObject: {
							"customer.contactCreate": {
								semanticObject: "Contact",
								action: "create",
								additionalParameters: "allowed",
								parameters: {}
							}
						}
					}
				});
				AddNewOutbound.applyChange(this.oManifest, this.oChangeNotSupportedObjectUnderContent);
			}, Error("The provided property 'notSupportedObject' is not supported. Supported property for change 'appdescr_app_addNewOutbound' is 'outbound'."),
			"throws error that the change object is not compliant");
		});

		QUnit.test("when calling '_applyChange' adding a change which has missing mandatory parameters", function(assert) {
			assert.throws(function() {
				// Mandatory property missing
				this.oChangeMandatoryParameterMissing = new AppDescriptorChange({
					changeType: "appdescr_app_addNewOutbound",
					layer: Layer.CUSTOMER,
					content: {
						outbound: {
							"customer.contactCreate": {
								semanticObject: "Contact",
								additionalParameters: "allowed",
								parameters: {}
							}
						}
					}
				});
				AddNewOutbound.applyChange(this.oManifest, this.oChangeMandatoryParameterMissing);
			}, Error("Mandatory property 'action' is missing. Mandatory properties are semanticObject|action."),
			"throws error that the change object is missing mandatory parameters");
		});

		QUnit.test("when calling '_applyChange' adding a change which has not supported properties", function(assert) {
			assert.throws(function() {
				// Having not supported properties
				this.oChangeNotHavingSupportedProperties = new AppDescriptorChange({
					changeType: "appdescr_app_addNewOutbound",
					layer: Layer.CUSTOMER,
					content: {
						outbound: {
							"customer.contactCreate": {
								semanticObject: "Contact",
								action: "create",
								additionalParameters: "allowed",
								icon: "sap-icon://add-contact",
								title: "Title",
								subTitle: "SubTitle"
							}
						}
					}
				});
				AddNewOutbound.applyChange(this.oManifest, this.oChangeNotHavingSupportedProperties);
			}, Error("Properties icon|title|subTitle are not supported. Supported properties are semanticObject|action|additionalParameters|parameters."),
			"throws error that the change object has not supported properties");
		});

		QUnit.test("when calling '_applyChange' adding a change which the property value of semanticObject does not match to regex", function(assert) {
			assert.throws(function() {
				// Property Value does not match to regular expression
				this.oChangeRegExNotMatchForSemanticObject = new AppDescriptorChange({
					changeType: "appdescr_app_addNewOutbound",
					layer: Layer.CUSTOMER,
					content: {
						outbound: {
							"customer.contactCreate": {
								semanticObject: "Not-Match-RegEx",
								action: "create",
								additionalParameters: "allwoed"
							}
						}
					}
				});
				AddNewOutbound.applyChange(this.oManifest, this.oChangeRegExNotMatchForSemanticObject);
			}, Error("The property has disallowed values. Supported values for 'semanticObject' should adhere to regular expression /^[\\w\\*]{0,30}$/."),
			"throws error that the change property does not match to regular expression");
		});

		QUnit.test("when calling '_applyChange' adding a change which the property value of action does not match to regex", function(assert) {
			assert.throws(function() {
				// Property Value does not match to regular expression
				this.oChangeRegExNotMatchForAction = new AppDescriptorChange({
					changeType: "appdescr_app_addNewOutbound",
					layer: Layer.CUSTOMER,
					content: {
						outbound: {
							"customer.contactCreate": {
								semanticObject: "Contact",
								action: "Not-Match-RegEx",
								additionalParameters: "allwoed"
							}
						}
					}
				});
				AddNewOutbound.applyChange(this.oManifest, this.oChangeRegExNotMatchForAction);
			}, Error("The property has disallowed values. Supported values for 'action' should adhere to regular expression /^[\\w\\*]{0,60}$/."),
			"throws error that the change property does not match to regular expression");
		});

		QUnit.test("when calling '_applyChange' adding a change which the property value of additionalParameters does not match to regex", function(assert) {
			assert.throws(function() {
				// Property Value does not match to regular expression
				this.oChangeRegExNotMatchForAdditionalParameters = new AppDescriptorChange({
					changeType: "appdescr_app_addNewOutbound",
					layer: Layer.CUSTOMER,
					content: {
						outbound: {
							"customer.contactCreate": {
								semanticObject: "Contact",
								action: "create",
								additionalParameters: "RegExDoesNotMatch"
							}
						}
					}
				});
				AddNewOutbound.applyChange(this.oManifest, this.oChangeRegExNotMatchForAdditionalParameters);
			}, Error("The property has disallowed values. Supported values for 'additionalParameters' should adhere to regular expression /^(ignored|allowed|notallowed)$/."),
			"throws error that the change property does not match to regular expression");
		});
	});
});
