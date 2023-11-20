/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/ovp/ChangeCard",
	"sap/ui/fl/apply/_internal/flexObjects/AppDescriptorChange",
	"sap/ui/thirdparty/sinon-4"
], function(
	ChangeCard,
	AppDescriptorChange,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("applyChange", {
		beforeEach() {
			this.oManifest = {
				"sap.ovp": {
					cards: {
						card1: {},
						card2: {}
					}
				}
			};
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling '_applyChange' with a change containing title in the OVP card", function(assert) {
			var oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_ovp_changecard"
				},
				content: {
					cardId: "card1",
					entityPropertyChange: {
						operation: "UPSERT",
						propertyPath: "customer.settings",
						propertyValue: {
							title: "Title"
						}
					}
				}
			});

			var oNewManifest = ChangeCard.applyChange(this.oManifest, oChange);
			assert.strictEqual(oNewManifest["sap.ovp"].cards.card1["customer.settings"].title, "Title", "the Manifest is updated correctly.");
		});

		QUnit.test("when calling '_applyChange' with a change not containing customer settings", function(assert) {
			var oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_ovp_changecard"
				},
				content: {
					cardId: "card1",
					entityPropertyChange: {
						operation: "UPSERT"
					}
				}
			});
			assert.throws(function() {
				ChangeCard.applyChange(this.oManifest, oChange);
			}, Error("Change card settings was not found"),
			"throws error");
		});

		QUnit.test("when calling '_applyChange' with change that is not a valid operation", function(assert) {
			var oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_ovp_changecard"
				},
				content: {
					cardId: "card1",
					entityPropertyChange: {
						operation: "DELETE",
						propertyPath: "customer.settings",
						propertyValue: {
							title: "Title"
						}
					}
				}
			});
			assert.throws(function() {
				ChangeCard.applyChange(this.oManifest, oChange);
			}, Error("This Operation is not supported"),
			"throws error");
		});

		QUnit.test("when calling '_applyChange' with change that is an array and not object", function(assert) {
			var oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_ovp_changecard"
				},
				content: {
					cardId: "card1",
					entityPropertyChange: [
						{
							operation: "UPSERT",
							propertyPath: "customer.settings",
							propertyValue: {
								title: "Title"
							}
						},
						{
							operation: "UPSERT",
							propertyPath: "customer.settings",
							propertyValue: {
								subtitle: "Title"
							}
						}
					]
				}
			});
			assert.throws(function() {
				ChangeCard.applyChange(this.oManifest, oChange);
			}, Error("Expected value for oPropertyChange was an object"),
			"throws error");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
