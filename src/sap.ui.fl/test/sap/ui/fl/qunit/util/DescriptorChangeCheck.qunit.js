/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/util/DescriptorChangeCheck",
	"sap/ui/fl/apply/_internal/flexObjects/AppDescriptorChange",
	"sap/ui/fl/Layer"
], function(
	DescriptorChangeCheck,
	AppDescriptorChange,
	Layer
) {
	"use strict";

	function assertNotCompliant(sId, oChange, sError, sMessage, assert) {
		assert.throws(function() {
			DescriptorChangeCheck.checkIdNamespaceCompliance(sId, oChange);
		}, Error(sError), sMessage);
	}

	function assertReserverd(sId, oChange, sPrefix, assert) {
		assertNotCompliant(sId, oChange, "Id " + sId + " must not start with reserved " + sPrefix, "throws error that there is reserved '" + sPrefix + "' prefix", assert);
	}
	function assertMissing(sId, oChange, sPrefix, assert) {
		assertNotCompliant(sId, oChange, "Id " + sId + " must start with " + sPrefix, "throws error that there is no mandatory '" + sPrefix + "' prefix", assert);
	}

	QUnit.module("sap.ui.fl.DescriptorChangeCheck.checkIdNamespaceCompliance", {}, function() {
		QUnit.test("Target is CUSTOMER layer", function(assert) {
			var oChange = new AppDescriptorChange({layer: Layer.CUSTOMER});
			DescriptorChangeCheck.checkIdNamespaceCompliance("customer.myid", oChange);
			assertMissing("myid", oChange, "customer.", assert);
			assertMissing("partner.myid", oChange, "customer.", assert);
		});

		QUnit.test("Target is CUSTOMER_BASE layer", function(assert) {
			var oChange = new AppDescriptorChange({layer: Layer.CUSTOMER_BASE});
			DescriptorChangeCheck.checkIdNamespaceCompliance("customer.myid", oChange);
			assertMissing("myid", oChange, "customer.", assert);
			assertMissing("partner.myid", oChange, "customer.", assert);
		});

		QUnit.test("Target is VENDOR layer", function(assert) {
			var oChange = new AppDescriptorChange({layer: Layer.VENDOR});
			DescriptorChangeCheck.checkIdNamespaceCompliance("myid", oChange);
			assertReserverd("customer.myid", oChange, "customer.", assert);
			assertReserverd("partner.myid", oChange, "partner.", assert);
		});

		QUnit.test("Target layer missing or not supported", function(assert) {
			var oChange = new AppDescriptorChange({});
			assertNotCompliant("any", oChange, "Mandatory layer parameter is not provided.", "throws error that layer is missing", assert);

			oChange = new AppDescriptorChange({layer: Layer.USER});
			assertNotCompliant("any", oChange, "Layer USER not supported.", "throws error that layer is missing", assert);
			oChange = new AppDescriptorChange({layer: "any"});
			assertNotCompliant("any", oChange, "Layer any not supported.", "throws error that layer is missing", assert);
		});
	});

	QUnit.module("sap.ui.fl.DescriptorChangeCheck.getNamespacePrefixForLayer", {}, function() {
		QUnit.test("Correct prefixes", function(assert) {
			assert.equal(DescriptorChangeCheck.getNamespacePrefixForLayer(Layer.CUSTOMER), "customer.", "Correct prefix for CUSTOMER");
			assert.equal(DescriptorChangeCheck.getNamespacePrefixForLayer(Layer.CUSTOMER_BASE), "customer.", "Correct prefix for CUSTOMER_BASE");
			assert.equal(DescriptorChangeCheck.getNamespacePrefixForLayer(Layer.VENDOR), null, "Correct prefix for VENDOR");
			assert.equal(DescriptorChangeCheck.getNamespacePrefixForLayer(Layer.PARTNER), "partner.", "Correct prefix for PARTNER");
			assert.throws(function() {
				DescriptorChangeCheck.getNamespacePrefixForLayer(Layer.USER);
			}, Error("Layer USER not supported."), "Layer USER is not supported");
		});
	});
});
