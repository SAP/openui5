(function () {
	'use strict';

	sap.ui.require([
			"sap/ui/rta/test/controlEnablingCheck",
			'sap/ui/dt/test/report/QUnit',
			'sap/ui/dt/test/ElementEnablementTest'],
		function (rtaControlEnablingCheck, QUnitReport, ElementEnablementTest) {

			var oElementEnablementTest = new ElementEnablementTest({
				type: "sap.m.Button"
			});

			oElementEnablementTest.run().then(function(oData) {
				new QUnitReport({
					data: oData
				});
			});

			// Combine Action
			var fnConfirmButtonsAreCombined = function (oUiComponent,oViewAfterAction, assert) {
				assert.strictEqual( oViewAfterAction.byId("bar0").getContentMiddle().length, 1, "then the Bar contains 1 button");
				// destroy controls which are no longer part of the view after combine command
				// to avoid duplicate id errors
				sap.ui.getCore().byId("comp---view--btn0").destroy();
				sap.ui.getCore().byId("comp---view--btn1").destroy();
				sap.ui.getCore().byId("comp---view--btn2").destroy();
			};

			var fnConfirmButtonsAreSplited = function (oUiComponent, oViewAfterAction, assert) {
				assert.strictEqual(oViewAfterAction.byId("bar0").getContentMiddle().length, 3, "then the Bar contains 3 buttons"
				);
			};

			rtaControlEnablingCheck("Checking the combine action for sap.m.Button", {
				jsOnly : true,
				xmlView :
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
				'<Page id="page0" >' +
				'<customHeader>' +
				'<Bar id="bar0">' +
				'<contentMiddle>' +
				'<Button id="btn0"/>' +
				'<Button id="btn1"/>' +
				'<Button id="btn2"/>' +
				'</contentMiddle>' +
				'</Bar>' +
				'</customHeader>' +
				'</Page>' +
				'</mvc:View>'     ,
				action : {
					name : "combine",
					controlId : "btn0",
					parameter : function(oView){
						return {
							source : oView.byId("btn0"),
							combineFields : [
								oView.byId("btn0"),
								oView.byId("btn1"),
								oView.byId("btn2")
							]
						};
					}
				},
				layer : "VENDOR",
				afterAction : fnConfirmButtonsAreCombined,
				afterUndo : fnConfirmButtonsAreSplited,
				afterRedo : fnConfirmButtonsAreCombined
			});

			// Rename action
			var fnConfirmButtonRenamedWithNewValue = function (oButton, oViewAfterAction, assert) {
				assert.strictEqual(oViewAfterAction.byId("button").getText(),
					"New Option",
					"then the control has been renamed to the new value (New Option)");
			};

			var fnConfirmButtonIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
				assert.strictEqual(oViewAfterAction.byId("button").getText(),
					"Option 1",
					"then the control has been renamed to the old value (Option 1)");
			};

			rtaControlEnablingCheck("Checking the rename action for a Button", {
				xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
				'<m:Button text="Option 1" id="button" />' +
				'</mvc:View>'
				,
				action: {
					name: "rename",
					controlId: "button",
					parameter: function (oView) {
						return {
							newValue: 'New Option',
							renamedElement: oView.byId("button")
						};
					}
				},
				afterAction: fnConfirmButtonRenamedWithNewValue,
				afterUndo: fnConfirmButtonIsRenamedWithOldValue,
				afterRedo: fnConfirmButtonRenamedWithNewValue
			});

			// Remove and reveal actions
			var fnConfirmButtonIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
				assert.strictEqual(oViewAfterAction.byId("button").getVisible(), false, "then the Button element is invisible");
			};

			var fnConfirmButtonIsVisible = function (oUiComponent, oViewAfterAction, assert) {
				assert.strictEqual(oViewAfterAction.byId("button").getVisible(), true, "then the Button element is visible");
			};

			rtaControlEnablingCheck("Checking the remove action for Button", {
				xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
				'<m:Button text="Option 1" id="button" />' +
				'</mvc:View>'
				,
				action: {
					name: "remove",
					controlId: "button",
					parameter: function (oView) {
						return {
							removedElement: oView.byId("button")
						};
					}
				},
				layer : "VENDOR",
				afterAction: fnConfirmButtonIsInvisible,
				afterUndo: fnConfirmButtonIsVisible,
				afterRedo: fnConfirmButtonIsInvisible
			});

			rtaControlEnablingCheck("Checking the reveal action for a Button", {
				xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
				'<m:Button text="Option 1" id="button" visible="false"/>' +
				'</mvc:View>'
				,
				action: {
					name: "reveal",
					controlId: "button",
					parameter: function(oView){
						return {};
					}
				},
				layer : "VENDOR",
				afterAction: fnConfirmButtonIsVisible,
				afterUndo: fnConfirmButtonIsInvisible,
				afterRedo: fnConfirmButtonIsVisible
			});
		});
})();