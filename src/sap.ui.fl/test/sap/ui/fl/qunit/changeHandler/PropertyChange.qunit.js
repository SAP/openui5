/*global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/fl/changeHandler/PropertyChange',
	'sap/ui/fl/Change',
	'sap/ui/fl/changeHandler/JsControlTreeModifier',
	'sap/ui/fl/changeHandler/XmlTreeModifier'
], function(
	PropertyChange,
	Change,
	JsControlTreeModifier,
	XmlTreeModifier
) {
	'use strict';
	QUnit.start();

	QUnit.module("Given a Property Change Handler", {
		beforeEach : function() {
			this.oChangeHandler = PropertyChange;

			this.OLD_VALUE = "original";
			this.NEW_VALUE = "newValue";

			this.oButton = new sap.m.Button({text:this.OLD_VALUE});
			this.oDOMParser = new DOMParser();
			this.oXmlDocument = this.oDOMParser.parseFromString("<Button text='" + this.OLD_VALUE + "' enabled='true' />", "application/xml");
			this.oXmlButton = this.oXmlDocument.childNodes[0];

			this.mExpectedSelector = {
				id : this.oButton.getId(),
				type : "sap.m.Button"
			};

			this.mExpectedChangeContent = {
				property : "text",
				oldValue : this.OLD_VALUE,
				newValue : this.NEW_VALUE,
				semantic : "rename"
			};

			this.mSpecificChangeData = {
				selector : this.mExpectedSelector,
				changeType : "propertyChange",
				content : this.mExpectedChangeContent
			};

			this.oChange = new Change(this.mSpecificChangeData);
		},
		afterEach : function() {
			this.oButton.destroy();
		}
	});

	QUnit.test('When providing change data via specific change info, Then', function(assert) {
		this.oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeData);
		assert.deepEqual(this.oChange.getSelector(), this.mExpectedSelector, "the change SELECTOR is filled correctly");
		assert.deepEqual(this.oChange.getContent(), this.mExpectedChangeContent, "the change CONTENT is filled correctly");
		assert.equal(this.oChange.getChangeType(), "propertyChange", "the change TYPE is filled correctly");
	});

	QUnit.test('When applying the property change on a js control tree, Then', function(assert) {
		this.oChangeHandler.applyChange(this.oChange, this.oButton, {modifier: JsControlTreeModifier});
		assert.equal(this.oButton.getText(), this.NEW_VALUE, "property text has changed as expected");
	});

	QUnit.test('When reverting the property change on a js control tree, Then', function(assert) {
		this.oChangeHandler.applyChange(this.oChange, this.oButton, {modifier: JsControlTreeModifier});
		this.oChangeHandler.revertChange(this.oChange, this.oButton, {modifier: JsControlTreeModifier});
		assert.equal(this.oButton.getText(), this.OLD_VALUE, "property text has original value");
	});

	QUnit.test('When applying the property change on a xml control tree, Then', function(assert) {
		this.oChangeHandler.applyChange(this.oChange, this.oXmlButton, {modifier: XmlTreeModifier});
		assert.equal(this.oXmlButton.getAttribute("text"), this.NEW_VALUE, "property text has changed as expected");
	});

	QUnit.test('When reverting the property change on a xml control tree, Then', function(assert) {
		this.oChangeHandler.applyChange(this.oChange, this.oXmlButton, {modifier: XmlTreeModifier});
		this.oChangeHandler.revertChange(this.oChange, this.oXmlButton, {modifier: XmlTreeModifier});
		assert.equal(this.oXmlButton.getAttribute("text"), this.OLD_VALUE, "property text has original value");
	});

	QUnit.test('When applying a property change which changes a binding on a js control tree, Then', function(assert) {

		this.NEW_VALUE = "{i18n>textKey}";

		this.mExpectedChangeContent = {
			property : "text",
			oldValue : this.OLD_VALUE,
			newValue : this.NEW_VALUE,
			semantic : "rename"
		};

		this.mSpecificChangeData = {
			selector : this.mExpectedSelector,
			changeType : "propertyChange",
			content : this.mExpectedChangeContent
		};

		this.oChange = new Change(this.mSpecificChangeData);

		this.oChangeHandler.applyChange(this.oChange, this.oButton, {modifier: JsControlTreeModifier});

		var oBindingInfo = this.oButton.getBindingInfo("text");

		assert.equal(oBindingInfo.parts[0].path, "textKey", "property value binding path has changed as expected");
		assert.equal(oBindingInfo.parts[0].model, "i18n", "property value binding model has changed as expected");

	});

	QUnit.test('When reverting a property change which changes a binding on a js control tree, Then', function(assert) {

		this.OLD_VALUE = "{i18n>textKey}";
		this.oButton = new sap.m.Button({text:this.OLD_VALUE});

		this.mExpectedChangeContent = {
			property : "text",
			oldValue : this.OLD_VALUE,
			newValue : this.NEW_VALUE,
			semantic : "rename"
		};

		this.mSpecificChangeData = {
			selector : this.mExpectedSelector,
			changeType : "propertyChange",
			content : this.mExpectedChangeContent
		};

		this.oChange = new Change(this.mSpecificChangeData);

		// apply
		this.oChangeHandler.applyChange(this.oChange, this.oButton, {modifier: JsControlTreeModifier});
		assert.equal(this.oButton.getBindingInfo("text"), undefined, "property text has no binding");
		assert.equal(this.oButton.getText(), "newValue", "property value binding path has changed as expected");

		// revert
		this.oChangeHandler.revertChange(this.oChange, this.oButton, {modifier: JsControlTreeModifier});
		var oBindingInfo = this.oButton.getBindingInfo("text");
		assert.equal(oBindingInfo.parts[0].path, "textKey", "property value binding path has changed as expected");
		assert.equal(oBindingInfo.parts[0].model, "i18n", "property value binding model has changed as expected");
	});

	QUnit.test('When applying a property change which changes a binding on a xml control tree, Then', function(assert) {

		this.NEW_VALUE = "{i18n>textKey}";

		this.mExpectedChangeContent = {
			property : "text",
			oldValue : this.OLD_VALUE,
			newValue : this.NEW_VALUE,
			semantic : "rename"
		};

		this.mSpecificChangeData = {
			selector : this.mExpectedSelector,
			changeType : "propertyChange",
			content : this.mExpectedChangeContent
		};

		this.oChange = new Change(this.mSpecificChangeData);

		this.oChangeHandler.applyChange(this.oChange, this.oXmlButton, {modifier: XmlTreeModifier});

		assert.equal(this.oXmlButton.getAttribute("text"), this.NEW_VALUE, "property value has changed as expected");
	});

	QUnit.test('When reverting a property change which changes a binding on a xml control tree, Then', function(assert) {

		this.OLD_VALUE = "{i18n>textKey}";
		this.oXmlDocument = this.oDOMParser.parseFromString("<Button text='" + this.OLD_VALUE + "' enabled='true' />", "application/xml");
		this.oXmlButton = this.oXmlDocument.childNodes[0];

		this.mExpectedChangeContent = {
			property : "text",
			oldValue : this.OLD_VALUE,
			newValue : this.NEW_VALUE,
			semantic : "rename"
		};

		this.mSpecificChangeData = {
			selector : this.mExpectedSelector,
			changeType : "propertyChange",
			content : this.mExpectedChangeContent
		};

		this.oChange = new Change(this.mSpecificChangeData);

		this.oChangeHandler.applyChange(this.oChange, this.oXmlButton, {modifier: XmlTreeModifier});
		this.oChangeHandler.revertChange(this.oChange, this.oXmlButton, {modifier: XmlTreeModifier});

		assert.equal(this.oXmlButton.getAttribute("text"), this.OLD_VALUE, "property value has original value");
	});
});