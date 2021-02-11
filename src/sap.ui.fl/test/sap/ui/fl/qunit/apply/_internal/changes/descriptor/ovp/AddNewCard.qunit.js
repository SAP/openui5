/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/ovp/AddNewCard",
	"sap/ui/fl/Change",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
],
function (
	AddNewCard,
	Change,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("applyChange", {
		beforeEach: function () {
			this.oManifest = {
				"sap.ovp": {
					cards: {
						card1: {},
						card2: {}
					}
				}
			};
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling '_applyChange' with a change to add new key user card", function (assert) {
			var oChange = new Change({
				changeType: "appdescr_ovp_addNewCard",
				content: {
					card: {
						customercard: {
							model: "modelX",
							settings: {
								title: "{{sap.ui.fl.demo.ovp_sap.ovp.cards.customer.ZDEMOOVP_card02_C1.settings.title}}",
								template: "sap.ovp.cards.charts.analytical"
							}
						}
					}
				}
			});
			var oNewManifest = AddNewCard.applyChange(this.oManifest, oChange);
			assert.strictEqual(oNewManifest["sap.ovp"]["cards"]["customercard"]["model"], "modelX", "the manifest is updated correctly with new card.");
		});

		QUnit.test("when calling '_applyChange' with a change to add no card", function (assert) {
			var oChange = new Change({
				changeType: "appdescr_ovp_addNewCard",
				content: {}
			});
			assert.throws(function() {
				AddNewCard.applyChange(this.oManifest, oChange);
			}, Error("No new card found"),
			"throws error");
		});

		QUnit.test("when calling '_applyChange' with a change to add new empty card", function (assert) {
			var oChange = new Change({
				changeType: "appdescr_ovp_addNewCard",
				content: {
					card: {}
				}
			});
			// var oNewManifest = AddNewCard.applyChange(oManifest, this.oChange2);
			assert.throws(function() {
				AddNewCard.applyChange(this.oManifest, oChange);
			}, Error("No new card found"),
			"throws error");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
