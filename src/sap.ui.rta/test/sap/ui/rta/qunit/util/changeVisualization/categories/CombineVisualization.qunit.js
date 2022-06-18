/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/rta/util/changeVisualization/categories/CombineVisualization",
	"sap/ui/core/Core",
	"sap/ui/dt/ElementUtil",
	"sap/m/Button"
], function(
	jQuery,
	sinon,
	CombineVisualization,
	oCore,
	ElementUtil,
	Button
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oResourceBundle = oCore.getLibraryResourceBundle("sap.ui.rta");

	QUnit.module("Base tests", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no payload is passed", function(assert) {
			var mDescription = CombineVisualization.getDescription(
				{},
				"fallback",
				{ appComponent: null }
			);
			assert.strictEqual(
				mDescription.descriptionText,
				oResourceBundle.getText("TXT_CHANGEVISUALIZATION_CHANGE_COMBINE", ["fallback"]),
				"then the fallback text is returned"
			);
			assert.strictEqual(
				mDescription.descriptionTooltip,
				oResourceBundle.getText("TXT_CHANGEVISUALIZATION_CHANGE_COMBINE", ["fallback"]),
				"then the fallback tooltip is returned"
			);
		});

		QUnit.test("when a payload with two ids is provided", function(assert) {
			var mDescription = CombineVisualization.getDescription(
				{ originalSelectors: ["someControl", "someOtherControl"] },
				"fallback",
				{ appComponent: null }
			);
			assert.strictEqual(
				mDescription.descriptionText,
				oResourceBundle.getText(
					"TXT_CHANGEVISUALIZATION_CHANGE_COMBINE_TWO",
					["someControl", "someOtherControl"]),
				"then the text for two ids is returned"
			);
		});

		QUnit.test("when a payload with long ids is provided", function(assert) {
			var mDescription = CombineVisualization.getDescription(
				{
					originalSelectors: [
						"someControl",
						"someThirdControlWithAnExtremlyLongIdThatDoesntReallyFitOnTheScreen"
					]
				},
				"fallback",
				{ appComponent: null }
			);
			assert.strictEqual(
				mDescription.descriptionText,
				oResourceBundle.getText(
					"TXT_CHANGEVISUALIZATION_CHANGE_COMBINE_TWO",
					["someControl", "someThirdControlWithAnExtre(...)tDoesntReallyFitOnTheScreen"]
				),
				"then the long id is shortened individually"
			);
			assert.strictEqual(
				mDescription.descriptionTooltip,
				oResourceBundle.getText(
					"TXT_CHANGEVISUALIZATION_CHANGE_COMBINE_TWO",
					["someControl", "someThirdControlWithAnExtremlyLongIdThatDoesntReallyFitOnTheScreen"]
				),
				"then the tooltip contains the full id"
			);
		});

		QUnit.test("when a payload with more than two ids is provided", function(assert) {
			var mDescription = CombineVisualization.getDescription(
				{ originalSelectors: ["someControl", "someOtherControl", "someThirdControl"] },
				"fallback",
				{ appComponent: null }
			);
			assert.strictEqual(
				mDescription.descriptionText,
				oResourceBundle.getText(
					"TXT_CHANGEVISUALIZATION_CHANGE_COMBINE_MANY",
					[3]
				),
				"then the text for more than two ids is returned with the number of combined elements"
			);
			assert.strictEqual(
				mDescription.descriptionTooltip,
				"\"someControl\",\n\"someOtherControl\",\n\"someThirdControl\"",
				"then the tooltip contains a list of all ids"
			);
		});

		QUnit.test("when a payload with an existing element is provided", function(assert) {
			var oButton = new Button("someId");
			var oLabelStub = sandbox.stub(ElementUtil, "getLabelForElement")
				.withArgs(oButton)
				.callsFake(function(oElement) {
					if (oElement === oButton) {
						return "someLabel";
					}
					return oLabelStub.wrappedMethod.apply(this, arguments);
				});
			var mDescription = CombineVisualization.getDescription(
				{ originalSelectors: [oButton.getId(), "someOtherId"] },
				"fallback",
				{ appComponent: null }
			);
			assert.strictEqual(
				mDescription.descriptionText,
				oResourceBundle.getText(
					"TXT_CHANGEVISUALIZATION_CHANGE_COMBINE_TWO",
					["someLabel", "someOtherId"]
				),
				"then the label of the element is resolved"
			);
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});