/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/rta/util/changeVisualization/commands/CreateContainerVisualization",
	"sap/ui/core/Core"
], function(
	sinon,
	CreateContainerVisualization,
	oCore
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oResourceBundle = oCore.getLibraryResourceBundle("sap.ui.rta");

	QUnit.module("Base tests", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no payload is passed", function(assert) {
			var mDescription = CreateContainerVisualization.getDescription(
				{},
				"fallback"
			);
			assert.strictEqual(
				mDescription.descriptionText,
				oResourceBundle.getText(
					"TXT_CHANGEVISUALIZATION_CHANGE_CREATECONTAINER",
					["fallback"]
				), "then the fallback text is returned"
			);
			assert.strictEqual(
				mDescription.descriptionTooltip,
				oResourceBundle.getText(
					"TXT_CHANGEVISUALIZATION_CHANGE_CREATECONTAINER",
					["fallback"]
				), "then the fallback tooltip is returned"
			);
		});

		QUnit.test("when a payload with original label is provided", function(assert) {
			var mDescription = CreateContainerVisualization.getDescription(
				{ originalLabel: "originalLabel" },
				"fallback"
			);
			assert.strictEqual(
				mDescription.descriptionText,
				oResourceBundle.getText(
					"TXT_CHANGEVISUALIZATION_CHANGE_CREATECONTAINER",
					["originalLabel"]
				), "then the text for original label is returned"
			);
			assert.strictEqual(
				mDescription.descriptionTooltip,
				oResourceBundle.getText(
					"TXT_CHANGEVISUALIZATION_CHANGE_CREATECONTAINER",
					["originalLabel"]
				), "then the original label tooltip is returned"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});