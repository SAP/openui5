/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/fieldhelp/FieldHelpCustomData"
], function (Element, FieldHelpCustomData) {
	/*global QUnit, sinon*/
	"use strict";

	QUnit.test("'key' is set with default value", function (assert) {
		const oCustomData = new FieldHelpCustomData();
		assert.equal(oCustomData.getKey(), "sap-ui-DocumentationRef", "'key' is set with default value");
		oCustomData.destroy();
	});

	QUnit.test("other 'key' is currently not supported and leads to error thrown", function (assert) {
		assert.expect(1);
		try {
			new FieldHelpCustomData({
				key: "some other key"
			});
		} catch (e) {
			assert.equal(e.message, `Unsupported key "some other key" for sap.ui.core.fieldhelp.FieldHelpCustomData`,
				"other key leads to error");
		}
	});

	QUnit.test("update fieldhelp when assigned to parent and its key/value fulfill requirements, also destroy",
		function(assert) {
			const oElement = new Element();
			oElement.updateFieldHelp = sinon.spy();

			const oCustomData = new FieldHelpCustomData();
			oElement.addCustomData(oCustomData);

			assert.equal(oElement.updateFieldHelp.callCount, 0, "'updateFieldHelp' isn't called yet");
			assert.equal(oElement.getFieldHelpDisplay(), null, "'fieldHelpDisplay' isn't set yet");

			oCustomData.setValue(["documentation-ref"]);
			assert.equal(oElement.updateFieldHelp.callCount, 1, "'updateFieldHelp' is called");

			oElement.destroy();
			assert.equal(oElement.updateFieldHelp.callCount, 2,
				"'updateFieldHelp' is called once the parent is destroyed");
		});
});