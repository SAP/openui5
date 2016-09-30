/*global QUnit*/

jQuery.sap.require("sap.ui.fl.changeHandler.PropertyChange");
jQuery.sap.require("sap.m.Button");
jQuery.sap.require("sap.ui.layout.VerticalLayout");
jQuery.sap.require("sap.ui.fl.Change");
jQuery.sap.require("sap.ui.fl.changeHandler.JsControlTreeModifier");
jQuery.sap.require("sap.ui.fl.changeHandler.XmlTreeModifier");

(function(PropertyChange, Change, JsControlTreeModifier, XmlTreeModifier) {
	"use strict";

	QUnit.module("Given a Property Change Handler", {
		beforeEach : function() {
			this.oChangeHandler = PropertyChange;

			this.OLD_VALUE = "original";
			this.NEW_VALUE = "newValue";

			this.oButton = new sap.m.Button({text:this.OLD_VALUE});
			var oDOMParser = new DOMParser();
			var oXmlDocument = oDOMParser.parseFromString("<Button text='" + this.OLD_VALUE + "' enabled='true' />", "application/xml");
			this.oXmlButton = oXmlDocument.childNodes[0];

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
		assert.deepEqual(this.oChange.getContent(), this.mExpectedChangeContent,
				"the change CONTENT is filled correctly");
		assert.equal(this.oChange.getChangeType(), "propertyChange", "the change TYPE is filled correctly");
	});

	QUnit.test('When applying the property change on a js control tree, Then', function(assert) {
		this.oChangeHandler.applyChange(this.oChange, this.oButton, {modifier: JsControlTreeModifier});

		assert.equal(this.oButton.getText(), this.NEW_VALUE, "property text has changed as expected");
	});

	QUnit.test('When applying the property change on a xml control tree, Then', function(assert) {
		this.oChangeHandler.applyChange(this.oChange, this.oXmlButton, {modifier: XmlTreeModifier});

		assert.equal(this.oXmlButton.getAttribute("text"), this.NEW_VALUE, "property text has changed as expected");
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

//	QUnit.test('When applying broken changes, Then', function(assert) {
//		var oChange = new Change({
//			selector : {
//				id : this.oObjectHeader.getId()
//			},
//			content : this.mExpectedMultiMoveChangeContent
//		});
//		assert.throws(function() {
//			this.oChangeHandler.applyChange(oChange, this.oButton);
//		}, new Error("Source parent id (selector) doesn't match the control on which to apply the change"),
//				"inconsistent selector error captured");
//
//		var oChange = new Change({
//			selector : {
//				id : this.oObjectHeader.getId()
//			},
//			content : this.mExpectedMultiMoveChangeContent
//		});
//		assert.throws(function() {
//			this.oChangeHandler.applyChange(oChange, this.oObjectHeader);
//		}, new Error("No source aggregation supplied via selector for move"), "missing source aggregation error captured");
//
//		var oChange = new Change({
//			selector : this.mExpectedSelector,
//			content : {
//				movedElements : []
//			}
//		});
//		assert.throws(function() {
//			this.oChangeHandler.applyChange(oChange, this.oObjectHeader);
//		}, new Error("No target supplied for move"), "missing target error captured");
//
//		var oChange = new Change({
//			selector : this.mExpectedSelector,
//			content : {
//				target : {
//					selector : {
//						id : "unkown"
//					}
//				}
//			}
//		});
//		assert.throws(function() {
//			this.oChangeHandler.applyChange(oChange, this.oObjectHeader);
//		}, new Error("Move target parent not found"), "unkown target error captured");
//
//		var oChange = new Change({
//			selector : this.mExpectedSelector,
//			content : {
//				movedElements : [{
//					selector : {
//						id : this.oObjectAttribute.getId()
//					},
//					sourceIndex : 0,
//					targetIndex : 2
//				}],
//				target : {
//					selector : {
//						id : this.oLayout.getId()
//					}
//				}
//			}
//		});
//		assert.throws(function() {
//			this.oChangeHandler.applyChange(oChange, this.oObjectHeader);
//		}, new Error("No target aggregation supplied for move"), "missing target aggregation error captured");
//
//		var oChange = new Change({
//			selector : this.mExpectedSelector,
//			content : {
//				target : {
//					selector : {
//						id : this.oLayout.getId(),
//						aggregation : "content"
//					}
//				}
//			}
//		});
//		assert.throws(function() {
//			this.oChangeHandler.applyChange(oChange, this.oObjectHeader);
//		}, new Error("No moveElements supplied"), "missing moved elements error captured");
//
//		var oChange = new Change({
//			selector : this.mExpectedSelector,
//			content : {
//				movedElements : [{
//					selector : {
//						id : "unkown"
//					}
//				}],
//				target : {
//					selector : {
//						id : this.oLayout.getId(),
//						aggregation : "content"
//					}
//				}
//			}
//		});
//		assert
//				.throws(function() {
//					this.oChangeHandler.applyChange(oChange, this.oObjectHeader);
//				}, new Error("Unkown element with id 'unkown' in moveElements supplied"),
//						"missing moved element id error captured");
//
//		var oChange = new Change({
//			selector : this.mExpectedSelector,
//			content : {
//				movedElements : [{
//					selector : {
//						id : this.oObjectAttribute.getId()
//					},
//					sourceIndex : 0
//				}],
//				target :{
//					selector : {
//						id : this.oLayout.getId(),
//						aggregation : "content"
//					}
//				}
//			}
//		});
//		assert.throws(function() {
//			this.oChangeHandler.applyChange(oChange, this.oObjectHeader);
//		}, new Error("Missing targetIndex for element with id '" + this.oObjectAttribute.getId()
//				+ "' in moveElements supplied"), "missing target index error captured");
//
//	});

}(sap.ui.fl.changeHandler.PropertyChange, sap.ui.fl.Change, sap.ui.fl.changeHandler.JsControlTreeModifier, sap.ui.fl.changeHandler.XmlTreeModifier));
