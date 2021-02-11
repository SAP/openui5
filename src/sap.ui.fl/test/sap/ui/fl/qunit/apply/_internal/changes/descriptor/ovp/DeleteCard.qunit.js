/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/ovp/DeleteCard",
	"sap/ui/fl/Change",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
],
function (
	DeleteCard,
	Change,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("applyChange", {
		beforeEach: function () {
			this.oChange = new Change({
				changeType: "appdescr_ovp_removeCard",
				content: {
					cardId: "card1"
				}
			});
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling '_applyChange' with a change to delete card that is defined in manifest", function (assert) {
			var oManifest = {
				"sap.ovp": {
					cards: {
						card1: {},
						card2: {}
					}
				}
			};
			var oNewManifest = DeleteCard.applyChange(oManifest, this.oChange);
			assert.strictEqual(oNewManifest["sap.ovp"]["cards"]["card1"], undefined, "the card is deleted correctly.");
		});

		QUnit.test("when calling '_applyChange' with a change to delete card that is not defined in manifest", function (assert) {
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
		jQuery("#qunit-fixture").hide();
	});
});
