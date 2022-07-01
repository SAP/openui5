/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/util/changeVisualization/categories/MoveVisualization",
	"sap/ui/core/Core"
], function(
	MoveVisualization,
	oCore
) {
	"use strict";
	var oResourceBundle = oCore.getLibraryResourceBundle("sap.ui.rta");

	QUnit.module("Base tests", {
		beforeEach: function() {
			this.mPropertyBag = { appComponent: null };
		},
		afterEach: function() {
		}
	}, function() {
		QUnit.test("when no payload and property bag are set", function(assert) {
			assert.strictEqual(
				MoveVisualization.getDescription({}, "label", this.mPropertyBag).descriptionText,
				oResourceBundle.getText("TXT_CHANGEVISUALIZATION_CHANGE_MOVE_WITHIN", ["label"]),
				"then the description text within its group is returned"
			);
		});
		QUnit.test("when an element was moved within its parent", function(assert) {
			var oPayloadInsideGroup = {
				sourceParentContainer: { id: "Group1" },
				targetParentContainer: { id: "Group1" }
			};
			assert.strictEqual(
				MoveVisualization.getDescription(oPayloadInsideGroup, "label", this.mPropertyBag).descriptionText,
				oResourceBundle.getText("TXT_CHANGEVISUALIZATION_CHANGE_MOVE_WITHIN", ["label"]),
				"then the description text within its group is returned"
			);

			assert.notOk(
				MoveVisualization.getDescription(oPayloadInsideGroup, "label", this.mPropertyBag).buttonText,
				"then the button text is not returned"
			);
		});
		QUnit.test("when an element was moved outside its parent", function(assert) {
			var oPayloadOutsideGroup = {
				sourceParentContainer: { id: "Group1" },
				targetParentContainer: { id: "Group2" }
			};
			assert.strictEqual(
				MoveVisualization.getDescription(oPayloadOutsideGroup, "label", this.mPropertyBag).descriptionText,
				oResourceBundle.getText("TXT_CHANGEVISUALIZATION_CHANGE_MOVE", ["label"]),
				"then the description text outside its group is returned"
			);
			assert.strictEqual(
				MoveVisualization.getDescription(oPayloadOutsideGroup, "label", this.mPropertyBag).buttonText,
				oResourceBundle.getText("BTN_CHANGEVISUALIZATION_SHOW_DEPENDENT_CONTAINER_MOVE"),
				"then the button text is returned"
			);
		});
		QUnit.test("when an element was moved outside its parent that has no source id", function (assert) {
			var oPayloadOutsideGroup = {
				sourceParentContainer: { id: null },
				targetParentContainer: { id: "Group2" }
			};
			assert.strictEqual(
				MoveVisualization.getDescription(oPayloadOutsideGroup, "label", this.mPropertyBag).descriptionText,
				oResourceBundle.getText("TXT_CHANGEVISUALIZATION_CHANGE_MOVE", ["label"]),
				"then the description text outside its group is returned"
			);
			assert.notOk(
				MoveVisualization.getDescription(oPayloadOutsideGroup, "label", this.mPropertyBag).buttonText,
				"then the button text is not returned"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});