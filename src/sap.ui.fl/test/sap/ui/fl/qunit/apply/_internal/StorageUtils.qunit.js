/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/apply/_internal/StorageUtils"
], function(
	sinon,
	Utils
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	function getEmptyFlexDataWithIndex (iIndex) {
		return {
			appDescriptorChanges: [],
			index: iIndex,
			changes: [],
			variants: [],
			variantChanges: [],
			variantDependentControlChanges: [],
			variantManagementChanges: [],
			ui2personalization: {}
		};
	}

	QUnit.module("getGroupedFlexObjects (including getEmptyFlexDataResponse)", {
		beforeEach: function() {
			this.oEmptyResponse = {
				USER: getEmptyFlexDataWithIndex(5),
				CUSTOMER: getEmptyFlexDataWithIndex(4),
				CUSTOMER_BASE: getEmptyFlexDataWithIndex(3),
				PARTNER: getEmptyFlexDataWithIndex(2),
				VENDOR: getEmptyFlexDataWithIndex(1),
				BASE: getEmptyFlexDataWithIndex(0)
			};

			this.oVariantManagementRef = "varManRef";
			this.oCtrlVariantUser = {
				fileType: "ctrl_variant",
				layer: "USER"
			};
			this.oCtrlVariantCustomer = {
				fileType: "ctrl_variant",
				layer: "CUSTOMER"
			};
			this.oCtrlVariantUserWithVMR = {
				fileType: "ctrl_variant",
				layer: "USER",
				variantManagementReference: this.oVariantManagementRef
			};
			this.oCtrlVariantCustomerWithVMR = {
				fileType: "ctrl_variant",
				layer: "CUSTOMER",
				variantManagementReference: this.oVariantManagementRef
			};
			this.oCtrlVariantManagUser = {
				fileType: "ctrl_variant_management_change",
				layer: "USER"
			};
			this.oCtrlVariantManagCustomer = {
				fileType: "ctrl_variant_management_change",
				layer: "CUSTOMER"
			};
			this.oChangeUser = {
				fileType: "change",
				layer: "USER"
			};
			this.oChangeCustomer = {
				fileType: "change",
				layer: "CUSTOMER"
			};
			this.oChangeUserWithVMR = {
				fileType: "change",
				layer: "USER",
				variantReference: this.oVariantManagementRef
			};
			this.oChangeCustomerWithVMR = {
				fileType: "change",
				layer: "CUSTOMER",
				variantReference: this.oVariantManagementRef
			};
			this.oVariantUserWithVMR = {
				fileType: "variant",
				layer: "USER",
				variantReference: this.oVariantManagementRef
			};
			this.oVariantCustomerWithVMR = {
				fileType: "variant",
				layer: "CUSTOMER",
				variantReference: this.oVariantManagementRef
			};
			this.oCtrlVariantChangeUser = {
				fileType: "ctrl_variant_change",
				layer: "USER"
			};
			this.oCtrlVariantChangeCustomer = {
				fileType: "ctrl_variant_change",
				layer: "CUSTOMER"
			};
			this.oOtherType = {
				fileType: "other"
			};
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("with all kinds of changes", function (assert) {
			var aTestData = [
				this.oCtrlVariantUser, this.oCtrlVariantCustomer, this.oCtrlVariantUserWithVMR, this.oCtrlVariantCustomerWithVMR,
				this.oCtrlVariantManagUser, this.oCtrlVariantManagCustomer, this.oChangeUser, this.oChangeCustomer,
				this.oChangeUserWithVMR, this.oChangeCustomerWithVMR, this.oVariantUserWithVMR, this.oVariantCustomerWithVMR,
				this.oCtrlVariantChangeUser, this.oCtrlVariantChangeCustomer, this.oOtherType
			];

			this.oEmptyResponse.USER.changes = [this.oChangeUser];
			this.oEmptyResponse.USER.variants = [this.oCtrlVariantUserWithVMR];
			this.oEmptyResponse.USER.variantChanges = [this.oCtrlVariantChangeUser];
			this.oEmptyResponse.USER.variantDependentControlChanges = [this.oChangeUserWithVMR, this.oVariantUserWithVMR];
			this.oEmptyResponse.USER.variantManagementChanges = [this.oCtrlVariantManagUser];

			this.oEmptyResponse.CUSTOMER.changes = [this.oChangeCustomer];
			this.oEmptyResponse.CUSTOMER.variants = [this.oCtrlVariantCustomerWithVMR];
			this.oEmptyResponse.CUSTOMER.variantChanges = [this.oCtrlVariantChangeCustomer];
			this.oEmptyResponse.CUSTOMER.variantDependentControlChanges = [this.oChangeCustomerWithVMR, this.oVariantCustomerWithVMR];
			this.oEmptyResponse.CUSTOMER.variantManagementChanges = [this.oCtrlVariantManagCustomer];

			assert.deepEqual(Utils.getGroupedFlexObjects(aTestData), this.oEmptyResponse, "the return is correct");
		});

		QUnit.test("with an empty array", function(assert) {
			assert.deepEqual(Utils.getGroupedFlexObjects([]), this.oEmptyResponse, "the return is correct");
		});
	});


	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
