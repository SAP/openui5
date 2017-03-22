/*global QUnit*/

jQuery.sap.require("sap.ui.fl.changeHandler.PropertyBindingChange");
jQuery.sap.require("sap.m.Input");
jQuery.sap.require("sap.ui.model.json.JSONModel");
jQuery.sap.require("sap.ui.fl.Change");
jQuery.sap.require("sap.ui.fl.changeHandler.JsControlTreeModifier");
jQuery.sap.require("sap.ui.fl.changeHandler.XmlTreeModifier");

(function(PropertyBindingChange, Change, JsControlTreeModifier, XmlTreeModifier) {
	"use strict";

	QUnit.module("Given a Property Binding Change Handler", {
		beforeEach : function() {
			this.oChangeHandler = PropertyBindingChange;
//<Input value=/>
//<Button iconFirst="{= ${status} === 'critical' &amp;&amp; ${amount} > 10000
//		  text="{= ${/amount} > 10000 ? ${i18n>/high} : ${i18n>/normal} }" />

//sap.ui.unified.Calendar month 2 //default is 1

			this.OLD_BOOLEAN_VALUE = false;
			this.NEW_BOOLEAN_BINDING_WITH_CRITICAL_CHARS = "{= ( ${/field1} === 'critical' ) &&  ( ${/field2} > 100 ) }";
			this.NEW_BOOLEAN_VALUE = true;

			this.OLD_VALUE_BINDING = "{path:'/field1'}";
			//A type test: {path:'/singleEntry/amount', type:'sap.ui.model.type.Float', formatOptions: { minFractionDigits: 1}} EUR
			this.NEW_VALUE_BINDING = "{path:'namedModel>/numberAsString', type:'sap.ui.model.type.Integer'}";
			this.NEW_VALUE = "20";

			this.oInput = new sap.m.Input({
				showValueHelp: this.OLD_BOOLEAN_VALUE,
				value: this.OLD_VALUE_BINDING
			});

			var oModel = new sap.ui.model.json.JSONModel({
					field1 : "critical",
					field2 : 15000
			});
			var oNamedModel = new sap.ui.model.json.JSONModel({
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

	QUnit.test('When applying the value property binding change on a js control tree, Then', function(assert) {
		this.oChangeHandler.applyChange(this.oValueChange, this.oInput, {modifier: JsControlTreeModifier});
		assert.strictEqual(this.oInput.getValue(), this.NEW_VALUE, "property value has changed the value as expected");
		var oBindingInfo = this.oInput.getBindingInfo("value");
		assert.ok(oBindingInfo.type instanceof sap.ui.model.type.Integer, "property value binding type has changed as expected");
		assert.equal(oBindingInfo.parts[0].path, "/numberAsString", "property value binding path has changed as expected");
		assert.equal(oBindingInfo.parts[0].model, "namedModel", "property value binding model has changed as expected");
	});

	QUnit.test('When applying the showValueHelp property binding change on a js control tree, Then', function(assert) {
		this.oChangeHandler.applyChange(this.oShowValueHelpChange, this.oInput, {modifier: JsControlTreeModifier});
		assert.strictEqual(this.oInput.getShowValueHelp(), this.NEW_BOOLEAN_VALUE, "property showValueHelpChange has changed the value as expected");
		var oBindingInfo = this.oInput.getBindingInfo("showValueHelp");
		assert.equal(oBindingInfo.bindingString, this.NEW_BOOLEAN_BINDING_WITH_CRITICAL_CHARS, "property showValueHelpChange binding has changed as expected //this assert need the SAPUI5 data-sap-ui-xx-designMode");
		assert.equal(oBindingInfo.parts[0].path, "/field1", "property showValueHelpChange binding paths have changed as expected");
		assert.equal(oBindingInfo.parts[1].path, "/field2", "property showValueHelpChange binding paths have changed as expected");
	});

	QUnit.test('When applying the value property binding change on a xml control tree, Then', function(assert) {
		this.oChangeHandler.applyChange(this.oValueChange, this.oXmlInput, {modifier: XmlTreeModifier});

		assert.equal(this.oXmlInput.getAttribute("value"), this.NEW_VALUE_BINDING, "property value has changed as expected");
	});

	QUnit.test('When applying the showValueHelp property binding change on a xml control tree, Then', function(assert) {
		this.oChangeHandler.applyChange(this.oShowValueHelpChange, this.oXmlInput, {modifier: XmlTreeModifier});

		assert.equal(this.oXmlInput.getAttribute("showValueHelp"), this.NEW_BOOLEAN_BINDING_WITH_CRITICAL_CHARS, "property showValueHelp has changed as expected");
	});
}(sap.ui.fl.changeHandler.PropertyBindingChange, sap.ui.fl.Change, sap.ui.fl.changeHandler.JsControlTreeModifier, sap.ui.fl.changeHandler.XmlTreeModifier));
