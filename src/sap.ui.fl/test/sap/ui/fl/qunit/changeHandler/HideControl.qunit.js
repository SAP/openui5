/*global QUnit*/

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/fl/changeHandler/HideControl",
	"sap/ui/fl/Change",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier"
],
function(
	Control,
	Element,
	HideControlChangeHandler,
	Change,
	JsControlTreeModifier,
	XmlTreeModifier
) {
	"use strict";

	QUnit.module("sap.ui.fl.changeHandler.HideControl", {
		beforeEach: function() {
			this.oChangeHandler = HideControlChangeHandler;
			var oDOMParser = new DOMParser();
			this.oXmlString =
			'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" >' +
			'<Button text="foo" enabled="true" id="buttonId" />' +
			'</mvc:View>';
			this.oXmlDocument = oDOMParser.parseFromString(this.oXmlString, "application/xml").documentElement;
			var oChangeJson = {
				selector: {
					id: "key"
				},
				content: {},
				texts: {}
			};

			this.oChange = new Change(oChangeJson);
		},
		afterEach: function() {
			this.oChange = null;
		}
	}, function() {
		QUnit.test('applyChange on a js control tree', function(assert) {
			var oControl = new Control();
			oControl.setVisible(true);
			return this.oChangeHandler.applyChange(this.oChange, oControl, {modifier: JsControlTreeModifier})
				.then(function() {
					assert.equal(oControl.getVisible(), false);
				});
		});


		QUnit.test('applyChange on a js control tree throws an exception if the change is not applicable', function(assert) {
			var oElement = new Element();

			return this.oChangeHandler.applyChange(this.oChange, oElement, {modifier: JsControlTreeModifier})
				.catch(function(oError) {
					assert.equal(oError.message,
						"Provided control instance has no getVisible method",
						"change handler throws an error that the control has no getter/setter for visible");
				});
		});

		QUnit.test('revertChange functionality', function(assert) {
			var oControl = new Control();
			oControl.setVisible(false);

			return this.oChangeHandler.applyChange(this.oChange, oControl, {modifier: JsControlTreeModifier})
				.then(this.oChangeHandler.revertChange.bind(this.oChangeHandler, this.oChange, oControl, {modifier: JsControlTreeModifier}))
				.then(function() {
					assert.equal(oControl.getVisible(), false, 'should be invisible');
				});
		});

		QUnit.test('applyChange on a xml tree', function(assert) {
			this.oXmlButton = this.oXmlDocument.childNodes[0];
			return this.oChangeHandler.applyChange(this.oChange, this.oXmlButton, {
				modifier: XmlTreeModifier,
				view: this.oXmlDocument
			}).then(function() {
				assert.equal(this.oXmlButton.getAttribute('visible'), 'false', 'xml button node has the visible attribute added and set to false');
			}.bind(this));
		});

		QUnit.test('completeChangeContent', function(assert) {
			var oSpecificChangeInfo = {};
			this.oChangeHandler.completeChangeContent(this.oChange, oSpecificChangeInfo);
			var oChangeJson = this.oChange.getDefinition();

			assert.equal(Object.keys(oChangeJson.content).length, 0);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});