/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/app/AddNewInbound",
	"sap/ui/fl/apply/_internal/flexObjects/AppDescriptorChange",
	"sap/ui/fl/Layer"
], function(
	AddNewInbound,
	AppDescriptorChange,
	Layer
) {
	"use strict";

	QUnit.module("applyChange", {
		beforeEach() {
			this.oManifest = {
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

			this.oChangeLayerCustomer = new AppDescriptorChange({
				changeType: "appdescr_app_addNewInbound",
				layer: Layer.CUSTOMER,
				content: {
					inbound: {
						"customer.contactCreate": {
							semanticObject: "Contact",
							action: "create",
							icon: "sap-icon://add-contact",
							title: "Title",
							subTitle: "SubTitle"
						}
					}
				}
			});
		}
	}, function() {
		QUnit.test("when calling '_applyChange' adding a new inbound in a manifest from customer", function(assert) {
			var oNewManifest = AddNewInbound.applyChange(this.oManifest, this.oChangeLayerCustomer);
			assert.equal(Object.keys(oNewManifest["sap.app"].crossNavigation.inbounds).length, 2, "expected inbounds size is correct");
			assert.ok(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"], "Risk-configure still exits");
			assert.ok(oNewManifest["sap.app"].crossNavigation.inbounds["customer.contactCreate"], "new inbound is added correctly");
		});

		QUnit.test("when calling '_applyChange' adding a new inbound in an empty inbounds manifest", function(assert) {
			this.oManifestNoInbounds = {
				"sap.app": {
					crossNavigation: {
						inbounds: {
						}
					}
				}
			};
			var oNewManifest = AddNewInbound.applyChange(this.oManifestNoInbounds, this.oChangeLayerCustomer);
			assert.equal(Object.keys(oNewManifest["sap.app"].crossNavigation.inbounds).length, 1, "expected inbounds size is correct");
			assert.ok(oNewManifest["sap.app"].crossNavigation.inbounds["customer.contactCreate"], "new inbound is added correctly");
		});

		QUnit.test("when calling '_applyChange' adding a new inbound in a manifest which has path sap.app/crossNavigation but no inbounds", function(assert) {
			this.oManifestNoPathToInbounds2 = {
				"sap.app": {
					crossNavigation: {}
				}
			};
			var oNewManifest = AddNewInbound.applyChange(this.oManifestNoPathToInbounds2, this.oChangeLayerCustomer);
			assert.equal(Object.keys(oNewManifest["sap.app"].crossNavigation.inbounds).length, 1, "expected inbounds size is correct");
			assert.ok(oNewManifest["sap.app"].crossNavigation.inbounds["customer.contactCreate"], "new inbound is added correctly");
		});

		QUnit.test("when calling '_applyChange' adding a new inbound in a manifest which has path sap.app/ but no crossNavigation", function(assert) {
			this.oManifestNoPathToInbounds1 = {
				"sap.app": {}
			};
			var oNewManifest = AddNewInbound.applyChange(this.oManifestNoPathToInbounds1, this.oChangeLayerCustomer);
			assert.equal(Object.keys(oNewManifest["sap.app"].crossNavigation.inbounds).length, 1, "expected inbounds size is correct");
			assert.ok(oNewManifest["sap.app"].crossNavigation.inbounds["customer.contactCreate"], "new inbound is added correctly");
		});

		QUnit.test("when calling '_applyChange' adding a new inbound in a manifest with empty inboud id", function(assert) {
			assert.throws(function() {
				// Empty inbound id
				this.oChangeEmptyInboundId = new AppDescriptorChange({
					changeType: "appdescr_app_addNewInbound",
					layer: Layer.CUSTOMER,
					content: {
						inbound: {
							"": {
								semanticObject: "Contact",
								action: "create",
								icon: "sap-icon://add-contact",
								title: "Title",
								subTitle: "SubTitle"
							}
						}
					}
				});
				AddNewInbound.applyChange(this.oManifest, this.oChangeEmptyInboundId);
			}, Error("The ID of your inbound is empty."),
			"throws error that the id of the inbound must not be empty");
		});

		QUnit.test("when calling '_applyChange' without an inbound", function(assert) {
			assert.throws(function() {
				// Empty inbound
				this.oChangeNoInbound = new AppDescriptorChange({
					changeType: "appdescr_app_addNewInbound",
					layer: Layer.CUSTOMER,
					content: {
						inbound: {}
					}
				});
				AddNewInbound.applyChange(this.oManifest, this.oChangeNoInbound);
			}, Error("There is no inbound provided. Please provide an inbound."),
			 "throws an error that the change does not have an inbound");
		});

		QUnit.test("when calling '_applyChange' adding a new inbound which already exist in the manifest", function(assert) {
			assert.throws(function() {
				// Already existing inbound
				this.oChangeAlreadyExistingInbound = new AppDescriptorChange({
					changeType: "appdescr_app_addNewInbound",
					layer: Layer.VENDOR,
					content: {
						inbound: {
							"Risk-configure": {
								semanticObject: "Contact",
								action: "create",
								icon: "sap-icon://add-contact",
								title: "Title",
								subTitle: "SubTitle"
							}
						}
					}
				});
				AddNewInbound.applyChange(this.oManifest, this.oChangeAlreadyExistingInbound);
			}, Error("Inbound with ID \"Risk-configure\" already exist."),
			"throws error that the inbound id already exists in the manifest");
		});

		QUnit.test("when calling '_applyChange' adding a new inbound in a manifest from customer layer with no prefix", function(assert) {
			assert.throws(function() {
				// Layer check
				this.oChangeLayerCustomerVendorNoPrefix = new AppDescriptorChange({
					changeType: "appdescr_app_addNewInbound",
					layer: Layer.CUSTOMER,
					content: {
						inbound: {
							contactCreate: {
								semanticObject: "Contact",
								action: "create",
								icon: "sap-icon://add-contact",
								title: "Title",
								subTitle: "SubTitle"
							}
						}
					}
				});
				AddNewInbound.applyChange(this.oManifest, this.oChangeLayerCustomerVendorNoPrefix);
			}, Error("Id contactCreate must start with customer."),
			"throws error that the namespace is not compliance");
		});

		QUnit.test("when calling '_applyChange' adding more than one inbound in a manifest", function(assert) {
			assert.throws(function() {
				// More than one inbound
				this.oChangeMoreThenOneInbound = new AppDescriptorChange({
					changeType: "appdescr_app_addNewInbound",
					layer: Layer.CUSTOMER,
					content: {
						inbound: {
							contactCreate: {
								semanticObject: "Contact",
								action: "create",
								icon: "sap-icon://add-contact",
								title: "Title",
								subTitle: "SubTitle"
							},
							someInbound: {
								semanticObject: "SomeInbound",
								action: "create",
								icon: "sap-icon://add-someInbound",
								title: "SomeInboundTitle",
								subTitle: "SomeInbountSubTitle"
							}
						}
					}
				});
				AddNewInbound.applyChange(this.oManifest, this.oChangeMoreThenOneInbound);
			}, Error("It is not allowed to add more than one inbound: contactCreate, someInbound."),
			"throws error that you are not allowed to add more than one inbound");
		});

		QUnit.test("when calling '_applyChange' adding a change which has more then one object under content", function(assert) {
			assert.throws(function() {
				// More than one objects under change object content
				this.oChangeMoreThenOneObjectUnderContent = new AppDescriptorChange({
					changeType: "appdescr_app_addNewInbound",
					layer: Layer.CUSTOMER,
					content: {
						inbound: {
							"customer.contactCreate": {
								semanticObject: "Contact",
								action: "create",
								icon: "sap-icon://add-contact",
								title: "Title",
								subTitle: "SubTitle"
							}
						},
						anotherChangeObject: {	}
					}
				});
				AddNewInbound.applyChange(this.oManifest, this.oChangeMoreThenOneObjectUnderContent);
			}, Error("It is not allowed to add more than one object under change object 'content'."),
			"throws error that the change object is not compliant");
		});

		QUnit.test("when calling '_applyChange' adding a change which has no object under content", function(assert) {
			assert.throws(function() {
				// No object under change object content
				this.oChangeNoObjectUnderContent = new AppDescriptorChange({
					changeType: "appdescr_app_addNewInbound",
					layer: Layer.CUSTOMER,
					content: {	}
				});
				AddNewInbound.applyChange(this.oManifest, this.oChangeNoObjectUnderContent);
			}, Error("The change object 'content' cannot be empty. Please provide the necessary property, as outlined in the change schema for 'appdescr_app_addNewInbound'."),
			"throws error that the change object is not compliant");
		});

		QUnit.test("when calling '_applyChange' adding a change which has no supported object under change object content", function(assert) {
			assert.throws(function() {
				// Not supported object under change object content
				this.oChangeNotSupportedObjectUnderContent = new AppDescriptorChange({
					changeType: "appdescr_app_addNewInbound",
					layer: Layer.CUSTOMER,
					content: {
						notSupportedObject: {
							"customer.contactCreate": {
								semanticObject: "Contact",
								action: "create",
								icon: "sap-icon://add-contact",
								title: "Title",
								subTitle: "SubTitle"
							}
						}
					}
				});
				AddNewInbound.applyChange(this.oManifest, this.oChangeNotSupportedObjectUnderContent);
			}, Error("The provided property 'notSupportedObject' is not supported. Supported property for change 'appdescr_app_addNewInbound' is 'inbound'."),
			"throws error that the change object is not compliant");
		});

		QUnit.test("when calling '_applyChange' adding a change which has missing mandatory parameters", function(assert) {
			assert.throws(function() {
				// Mandatory property missing
				this.oChangeMandatoryParameterMissing = new AppDescriptorChange({
					changeType: "appdescr_app_addNewInbound",
					layer: Layer.CUSTOMER,
					content: {
						inbound: {
							"customer.contactCreate": {
								semanticObject: "Contact",
								icon: "sap-icon://add-contact",
								title: "Title",
								subTitle: "SubTitle",
								signature: {}
							}
						}
					}
				});
				AddNewInbound.applyChange(this.oManifest, this.oChangeMandatoryParameterMissing);
			}, Error("Mandatory property 'action' is missing. Mandatory properties are semanticObject|action."),
			"throws error that the change object is missing mandatory parameters");
		});

		QUnit.test("when calling '_applyChange' adding a change which has not supported properties", function(assert) {
			assert.throws(function() {
				// Having not supported properties
				this.oChangeNotHavingSupportedProperties = new AppDescriptorChange({
					changeType: "appdescr_app_addNewInbound",
					layer: Layer.CUSTOMER,
					content: {
						inbound: {
							"customer.contactCreate": {
								semanticObject: "Contact",
								action: "create",
								additionalParameters: "allowed",
								icon: "sap-icon://add-contact",
								title: "Title",
								subTitle: "SubTitle",
								signature: {}
							}
						}
					}
				});
				AddNewInbound.applyChange(this.oManifest, this.oChangeNotHavingSupportedProperties);
			}, Error("Properties additionalParameters are not supported. Supported properties are semanticObject|action|hideLauncher|icon|title|shortTitle|subTitle|info|indicatorDataSource|deviceTypes|displayMode|signature."),
			"throws error that the change object has not supported properties");
		});

		QUnit.test("when calling '_applyChange' adding a change which the property value of semanticObject does not match to regex", function(assert) {
			assert.throws(function() {
				// Property Value does not match to regular expression
				this.oChangeRegExNotMatchForSemanticObject = new AppDescriptorChange({
					changeType: "appdescr_app_addNewInbound",
					layer: Layer.CUSTOMER,
					content: {
						inbound: {
							"customer.contactCreate": {
								semanticObject: "Not-Match-RegEx",
								action: "create",
								icon: "sap-icon://add-contact",
								title: "Title",
								subTitle: "SubTitle",
								signature: {}
							}
						}
					}
				});
				AddNewInbound.applyChange(this.oManifest, this.oChangeRegExNotMatchForSemanticObject);
			}, Error("The property has disallowed values. Supported values for 'semanticObject' should adhere to regular expression /^[\\w\\*]{0,30}$/."),
			"throws error that the change property does not match to regular expression");
		});

		QUnit.test("when calling '_applyChange' adding a change which the property value of action does not match to regex", function(assert) {
			assert.throws(function() {
				// Property Value does not match to regular expression
				this.oChangeRegExNotMatchForAction = new AppDescriptorChange({
					changeType: "appdescr_app_addNewInbound",
					layer: Layer.CUSTOMER,
					content: {
						inbound: {
							"customer.contactCreate": {
								semanticObject: "Contact",
								action: "Not-Match-RegEx",
								icon: "sap-icon://add-contact",
								title: "Title",
								subTitle: "SubTitle",
								signature: {}
							}
						}
					}
				});
				AddNewInbound.applyChange(this.oManifest, this.oChangeRegExNotMatchForAction);
			}, Error("The property has disallowed values. Supported values for 'action' should adhere to regular expression /^[\\w\\*]{0,60}$/."),
			"throws error that the change property does not match to regular expression");
		});
	});
});
