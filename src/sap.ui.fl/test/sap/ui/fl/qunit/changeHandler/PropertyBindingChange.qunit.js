/*global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/fl/changeHandler/PropertyBindingChange',
	'sap/ui/fl/Change',
	'sap/ui/fl/changeHandler/JsControlTreeModifier',
	'sap/ui/fl/changeHandler/XmlTreeModifier',
	'sap/m/Input',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/type/Integer'
], function(
	PropertyBindingChange,
	Change,
	JsControlTreeModifier,
	XmlTreeModifier,
	Input,
	JSONModel,
	Integer
) {
	'use strict';
	QUnit.start();

	QUnit.module("Given a Property Binding Change Handler", {
		beforeEach : function() {
			this.oChangeHandler = PropertyBindingChange;

			this.OLD_BOOLEAN_VALUE = false;
			this.NEW_BOOLEAN_BINDING_WITH_CRITICAL_CHARS = "{= ( ${/field1} === 'critical' ) &&  ( ${/field2} > 100 ) }";
			this.NEW_BOOLEAN_VALUE = true;

			this.OLD_VALUE_BINDING = "{path:'/field1'}";
			this.OLD_VALUE_FIELD1 = "critical";
			this.OLD_VALUE_FIELD2 = 15000;
			//A type test: {path:'/singleEntry/amount', type:'sap.ui.model.type.Float', formatOptions: { minFractionDigits: 1}} EUR
			this.NEW_VALUE_BINDING = "{path:'namedModel>/numberAsString', type:'sap.ui.model.type.Integer'}";
			this.NEW_VALUE = "20";

			this.oInput = new Input({
				showValueHelp: this.OLD_BOOLEAN_VALUE,
				value: this.OLD_VALUE_BINDING
			});

			var oModel = new JSONModel({
				field1 : this.OLD_VALUE_FIELD1,
				field2 : this.OLD_VALUE_FIELD2
			});
			var oNamedModel = new JSONModel({
				numberAsString : this.NEW_VALUE
			});
			this.oInput.setModel(oModel);
			this.oInput.setModel(oNamedModel, "namedModel");

			var oDOMParser = new DOMParser();
			var sXML = "<Input showValueHelp=\"" + this.OLD_BOOLEAN_VALUE + "\" value=\"" + this.OLD_VALUE_BINDING + "\" enabled=\"true\" />";
			var oXmlDocument = oDOMParser.parseFromString(sXML, "application/xml");
			this.oXmlInput = oXmlDocument.childNodes[0];

			this.mExpectedSelector = {
				id : this.oInput.getId(),
				type : "sap.m.Input"
			};

			this.mExpectedShowValueHelpChangeContent = {
				property : "showValueHelp",
				oldValue : this.OLD_BOOLEAN_VALUE,
				newBinding : this.NEW_BOOLEAN_BINDING_WITH_CRITICAL_CHARS
			};

			this.mSpecificShowValueHelpChangeData = {
				selector : this.mExpectedSelector,
				changeType : "propertyBindingChange",
				content : this.mExpectedShowValueHelpChangeContent
			};

			this.oShowValueHelpChange = new Change(this.mSpecificShowValueHelpChangeData);

			this.mExpectedValueChangeContent = {
				property : "value",
				oldBinding : this.OLD_VALUE_BINDING,
				newBinding : this.NEW_VALUE_BINDING
			};

			this.mSpecificValueChangeData = {
				selector : this.mExpectedSelector,
				changeType : "propertyBindingChange",
				content : this.mExpectedValueChangeContent
			};

			this.oValueChange = new Change(this.mSpecificValueChangeData);

			this.oChange = new Change({
				selector : this.mExpectedSelector,
				changeType : "propertyBindingChange"
			});
		},
		afterEach : function() {
			this.oInput.destroy();
			this.oChange = null;
		}
	});

	QUnit.test('When providing change data for a change with previous binding, Then', function(assert) {

		this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificValueChangeData);

		assert.deepEqual(this.oChange.getSelector(), this.mExpectedSelector, "the change SELECTOR is filled correctly");
		assert.deepEqual(this.oChange.getContent(), this.mExpectedValueChangeContent,
			"the change CONTENT is filled correctly");
		assert.equal(this.oChange.getChangeType(), "propertyBindingChange", "the change TYPE is filled correctly");
	});

	QUnit.test('When providing change data for a change with previous set value, Then', function(assert) {

		this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificShowValueHelpChangeData);

		assert.deepEqual(this.oChange.getSelector(), this.mExpectedSelector, "the change SELECTOR is filled correctly");
		assert.deepEqual(this.oChange.getContent(), this.mExpectedShowValueHelpChangeContent,
			"the change CONTENT is filled correctly");
		assert.equal(this.oChange.getChangeType(), "propertyBindingChange", "the change TYPE is filled correctly");
	});

	QUnit.test('When applying the value property binding change on a js control tree and reverting it afterwards, Then', function(assert) {
		this.oChangeHandler.applyChange(this.oValueChange, this.oInput, {modifier: JsControlTreeModifier});
		assert.strictEqual(this.oInput.getValue(), this.NEW_VALUE, "property value has changed the value as expected");
		var oBindingInfo = this.oInput.getBindingInfo("value");
		assert.ok(oBindingInfo.type instanceof Integer, "property value binding type has changed as expected");
		assert.equal(oBindingInfo.parts[0].path, "/numberAsString", "property value binding path has changed as expected");
		assert.equal(oBindingInfo.parts[0].model, "namedModel", "property value binding model has changed as expected");

		this.oChangeHandler.revertChange(this.oValueChange, this.oInput, {modifier: JsControlTreeModifier});
		oBindingInfo = this.oInput.getBindingInfo("value");
		assert.equal(this.oInput.getValue(), this.OLD_VALUE_FIELD1, "property value has original value as expected");
		assert.equal(oBindingInfo.parts[0].path, "/field1", "property value binding path is reverted");
		assert.equal(oBindingInfo.parts[0].model, undefined, "property value binding model is reverted");
	});

	QUnit.test('When applying the showValueHelp property binding change on a js control tree and reverting it afterwards, Then', function(assert) {
		this.oChangeHandler.applyChange(this.oShowValueHelpChange, this.oInput, {modifier: JsControlTreeModifier});
		assert.strictEqual(this.oInput.getShowValueHelp(), this.NEW_BOOLEAN_VALUE, "property showValueHelpChange has changed the value as expected");
		var oBindingInfo = this.oInput.getBindingInfo("showValueHelp");
		assert.equal(oBindingInfo.bindingString, this.NEW_BOOLEAN_BINDING_WITH_CRITICAL_CHARS, "property showValueHelpChange binding has changed as expected //this assert need the SAPUI5 data-sap-ui-xx-designMode");
		assert.equal(oBindingInfo.parts[0].path, "/field1", "property showValueHelpChange binding paths have changed as expected");
		assert.equal(oBindingInfo.parts[1].path, "/field2", "property showValueHelpChange binding paths have changed as expected");

		this.oChangeHandler.revertChange(this.oShowValueHelpChange, this.oInput, {modifier: JsControlTreeModifier});
		assert.strictEqual(this.oInput.getShowValueHelp(), this.OLD_BOOLEAN_VALUE, "property showValueHelpChange has been reverted");
		assert.equal(this.oInput.getBindingInfo("showValueHelp"), undefined, "property showValueHelpChange binding has changed as expected //this assert need the SAPUI5 data-sap-ui-xx-designMode");
	});

	QUnit.test('When applying the value property binding change on a xml control tree and reverting it afterwards, Then', function(assert) {
		this.oChangeHandler.applyChange(this.oValueChange, this.oXmlInput, {modifier: XmlTreeModifier});
		assert.equal(this.oXmlInput.getAttribute("value"), this.NEW_VALUE_BINDING, "property value has changed as expected");

		this.oChangeHandler.revertChange(this.oValueChange, this.oXmlInput, {modifier: XmlTreeModifier});
		assert.equal(this.oXmlInput.getAttribute("value"), this.OLD_VALUE_BINDING, "property value has changed as expected");
	});

	QUnit.test('When applying the showValueHelp property binding change on a xml control tree and reverting it afterwards, Then', function(assert) {
		this.oChangeHandler.applyChange(this.oShowValueHelpChange, this.oXmlInput, {modifier: XmlTreeModifier});
		assert.equal(this.oXmlInput.getAttribute("showValueHelp"), this.NEW_BOOLEAN_BINDING_WITH_CRITICAL_CHARS, "property showValueHelp has changed as expected");

		this.oChangeHandler.revertChange(this.oShowValueHelpChange, this.oXmlInput, {modifier: XmlTreeModifier});
		assert.equal(this.oXmlInput.getAttribute("showValueHelp"), "false", "property showValueHelp has changed as expected");
	});
});