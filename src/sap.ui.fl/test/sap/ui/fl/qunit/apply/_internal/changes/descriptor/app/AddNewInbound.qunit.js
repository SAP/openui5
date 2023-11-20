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

			this.oManifestNoInbounds = {
				"sap.app": {
					crossNavigation: {
						inbounds: {
						}
					}
				}
			};

			this.oManifestNoPathToInbounds1 = {
				"sap.app": {}
			};

			this.oManifestNoPathToInbounds2 = {
				"sap.app": {
					crossNavigation: {}
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

			// Empty inbound
			this.oChangeNoInbound = new AppDescriptorChange({
				changeType: "appdescr_app_addNewInbound",
				layer: Layer.CUSTOMER,
				content: {
					inbound: {}
				}
			});

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
		}
	}, function() {
		QUnit.test("when calling '_applyChange' adding a new inbound in a manifest from customer", function(assert) {
			var oNewManifest = AddNewInbound.applyChange(this.oManifest, this.oChangeLayerCustomer);
			assert.equal(Object.keys(oNewManifest["sap.app"].crossNavigation.inbounds).length, 2, "expected inbounds size is correct");
			assert.ok(oNewManifest["sap.app"].crossNavigation.inbounds["Risk-configure"], "Risk-configure still exits");
			assert.ok(oNewManifest["sap.app"].crossNavigation.inbounds["customer.contactCreate"], "new inbound is added correctly");
		});

		QUnit.test("when calling '_applyChange' adding a new inbound in an empty inbounds manifest", function(assert) {
			var oNewManifest = AddNewInbound.applyChange(this.oManifestNoInbounds, this.oChangeLayerCustomer);
			assert.equal(Object.keys(oNewManifest["sap.app"].crossNavigation.inbounds).length, 1, "expected inbounds size is correct");
			assert.ok(oNewManifest["sap.app"].crossNavigation.inbounds["customer.contactCreate"], "new inbound is added correctly");
		});

		QUnit.test("when calling '_applyChange' adding a new inbound in a manifest which has path sap.app/crossNavigation but no inbounds", function(assert) {
			var oNewManifest = AddNewInbound.applyChange(this.oManifestNoPathToInbounds2, this.oChangeLayerCustomer);
			assert.equal(Object.keys(oNewManifest["sap.app"].crossNavigation.inbounds).length, 1, "expected inbounds size is correct");
			assert.ok(oNewManifest["sap.app"].crossNavigation.inbounds["customer.contactCreate"], "new inbound is added correctly");
		});

		QUnit.test("when calling '_applyChange' adding a new inbound in a manifest which has path sap.app/ but no crossNavigation", function(assert) {
			var oNewManifest = AddNewInbound.applyChange(this.oManifestNoPathToInbounds1, this.oChangeLayerCustomer);
			assert.equal(Object.keys(oNewManifest["sap.app"].crossNavigation.inbounds).length, 1, "expected inbounds size is correct");
			assert.ok(oNewManifest["sap.app"].crossNavigation.inbounds["customer.contactCreate"], "new inbound is added correctly");
		});

		QUnit.test("when calling '_applyChange' adding a new inbound in a manifest with empty inboud id", function(assert) {
			assert.throws(function() {
				AddNewInbound.applyChange(this.oManifest, this.oChangeEmptyInboundId);
			}, Error("The ID of your inbound is empty"),
			"throws error that the id of the inbound must not be empty");
		});

		QUnit.test("when calling '_applyChange' without an inbound", function(assert) {
			assert.throws(function() {
				AddNewInbound.applyChange(this.oManifest, this.oChangeNoInbound);
			}, Error("Inbound does not exist"),
			 "throws an error that the change does not have an inbound");
		});

		QUnit.test("when calling '_applyChange' adding a new inbound which already exist in the manifest", function(assert) {
			assert.throws(function() {
				AddNewInbound.applyChange(this.oManifest, this.oChangeAlreadyExistingInbound);
			}, Error("Inbound with ID \"Risk-configure\" already exist."),
			"throws error that the inbound id already exists in the manifest");
		});

		QUnit.test("when calling '_applyChange' adding a new inbound in a manifest from customer layer with no prefix", function(assert) {
			assert.throws(function() {
				AddNewInbound.applyChange(this.oManifest, this.oChangeLayerCustomerVendorNoPrefix);
			}, Error("Id contactCreate must start with customer."),
			"throws error that the namespace is not compliance");
		});

		QUnit.test("when calling '_applyChange' adding more than one inbound in a manifest", function(assert) {
			assert.throws(function() {
				AddNewInbound.applyChange(this.oManifest, this.oChangeMoreThenOneInbound);
			}, Error("It is not allowed to add more than one inbound"),
			"throws error that you are not allowed to add more than one inbound");
		});
	});
});
