(function () {
	'use strict';

	sap.ui.require([
			"sap/ui/rta/test/controlEnablingCheck",
			"sap/ui/dt/test/report/QUnit",
			"sap/ui/dt/test/ElementEnablementTest"],
		function (rtaControlEnablingCheck, QUnitReport, ElementEnablementTest) {

			var oElementEnablementTest = new ElementEnablementTest({
				type: "sap.uxap.ObjectPageHeaderActionButton"
			});

			oElementEnablementTest.run().then(function(oData) {
				new QUnitReport({
					data: oData
				});
			});

			// Rename action
			var fnConfirmObjectPageHeaderActionButtonRenamedWithNewValue = function (oObjectPageHeaderActionButton, oViewAfterAction, assert) {
				assert.strictEqual(oViewAfterAction.byId("ObjectPageHeaderActionButton").getText(),
					"New Option",
					"then the control has been renamed to the new value (New Option)");
			};

			var fnConfirmObjectPageHeaderActionButtonIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
				assert.strictEqual(oViewAfterAction.byId("ObjectPageHeaderActionButton").getText(),
					"Option 1",
					"then the control has been renamed to the old value (Option 1)");
			};

			rtaControlEnablingCheck("Checking the rename action for a ObjectPageHeaderActionButton", {
				xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.uxap">"' +
					'<ObjectPageLayout>' +
						'<headerTitle>' +
							'<ObjectPageDynamicHeaderTitle id="ObjectPageDynamicHeaderTitle">' +
								'<actions>' +
									'<ObjectPageHeaderActionButton text="Option 1" id="ObjectPageHeaderActionButton" />' +
								'</actions>' +
							'</ObjectPageDynamicHeaderTitle>' +
						'</headerTitle>' +
					'</ObjectPageLayout>' +
				'</mvc:View>'
				,
				action: {
					name: "rename",
					controlId: "ObjectPageHeaderActionButton",
					parameter: function (oView) {
						return {
							newValue: 'New Option',
							renamedElement: oView.byId("ObjectPageHeaderActionButton")
						};
					}
				},
				afterAction: fnConfirmObjectPageHeaderActionButtonRenamedWithNewValue,
				afterUndo: fnConfirmObjectPageHeaderActionButtonIsRenamedWithOldValue,
				afterRedo: fnConfirmObjectPageHeaderActionButtonRenamedWithNewValue
			});

			// Remove and reveal actions
			var fnConfirmObjectPageHeaderActionButtonIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
				assert.strictEqual(oViewAfterAction.byId("ObjectPageHeaderActionButton").getVisible(),
					false, "then the ObjectPageHeaderActionButton element is invisible");
			};

			var fnConfirmObjectPageHeaderActionButtonIsVisible = function (oUiComponent, oViewAfterAction, assert) {
				assert.strictEqual(oViewAfterAction.byId("ObjectPageHeaderActionButton").getVisible(),
					true, "then the ObjectPageHeaderActionButton element is visible");
			};

			rtaControlEnablingCheck("Checking the remove action for ObjectPageHeaderActionButton", {
				xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.uxap">"' +
					'<ObjectPageLayout>' +
						'<headerTitle>' +
							'<ObjectPageDynamicHeaderTitle id="ObjectPageDynamicHeaderTitle">' +
								'<actions>' +
									'<ObjectPageHeaderActionButton text="Option 1" id="ObjectPageHeaderActionButton" />' +
								'</actions>' +
							'</ObjectPageDynamicHeaderTitle>' +
						'</headerTitle>' +
					'</ObjectPageLayout>' +
				'</mvc:View>'
				,
				action: {
					name: "remove",
					controlId: "ObjectPageHeaderActionButton",
					parameter: function (oView) {
						return {
							removedElement: oView.byId("ObjectPageHeaderActionButton")
						};
					}
				},
				afterAction: fnConfirmObjectPageHeaderActionButtonIsInvisible,
				afterUndo: fnConfirmObjectPageHeaderActionButtonIsVisible,
				afterRedo: fnConfirmObjectPageHeaderActionButtonIsInvisible
			});

			rtaControlEnablingCheck("Checking the reveal action for a ObjectPageHeaderActionButton", {
				xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.uxap">"' +
					'<ObjectPageLayout>' +
						'<headerTitle>' +
							'<ObjectPageDynamicHeaderTitle id="ObjectPageDynamicHeaderTitle">' +
								'<actions>' +
									'<ObjectPageHeaderActionButton text="Option 1" id="ObjectPageHeaderActionButton" visible="false"/>' +
								'</actions>' +
							'</ObjectPageDynamicHeaderTitle>' +
						'</headerTitle>' +
					'</ObjectPageLayout>' +
				'</mvc:View>'
				,
				action: {
					name: "reveal",
					controlId: "ObjectPageHeaderActionButton",
					parameter: function(oView){
						return {};
					}
				},
				afterAction: fnConfirmObjectPageHeaderActionButtonIsVisible,
				afterUndo: fnConfirmObjectPageHeaderActionButtonIsInvisible,
				afterRedo: fnConfirmObjectPageHeaderActionButtonIsVisible
			});
		});
})();