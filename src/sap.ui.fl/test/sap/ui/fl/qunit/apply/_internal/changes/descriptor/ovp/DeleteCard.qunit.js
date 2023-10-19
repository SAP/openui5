/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/ovp/DeleteCard",
	"sap/ui/fl/apply/_internal/flexObjects/AppDescriptorChange",
	"sap/ui/thirdparty/sinon-4"
], function(
	DeleteCard,
	AppDescriptorChange,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("applyChange", {
		beforeEach() {
			this.oChange = new AppDescriptorChange({
				flexObjectMetadata: {
					changeType: "appdescr_ovp_removeCard"
				},
				content: {
					cardId: "card1"
				}
			});
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling '_applyChange' with a change to delete card that is defined in manifest", function(assert) {
			var oManifest = {
				"sap.ovp": {
					cards: {
						card1: {},
						card2: {}
					}
				}
			};
			var oNewManifest = DeleteCard.applyChange(oManifest, this.oChange);
			assert.strictEqual(oNewManifest["sap.ovp"].cards.card1, undefined, "the card is deleted correctly.");
		});

		QUnit.test("when calling '_applyChange' with a change to delete card that is not defined in manifest", function(assert) {
			var oManifest = {
				"sap.ovp": {
					cards: {
						card2: {}
					}
				}
			};
			assert.throws(function() {
				DeleteCard.applyChange(oManifest, this.oChange);
			}, Error("The card to be deleted was not found"),
			"throws error");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
