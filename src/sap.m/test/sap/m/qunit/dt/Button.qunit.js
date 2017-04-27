(function () {
	'use strict';

	sap.ui.require([
			"sap/ui/rta/test/controlEnablingCheck",
			'sap/ui/dt/test/report/QUnit',
			'sap/ui/dt/test/ElementEnablementTest'],
		function (rtaControlEnablingCheck, QUnit, ElementEnablementTest) {

			var oElementEnablementTest = new ElementEnablementTest({
				type: "sap.m.Button"
			});

			oElementEnablementTest.run().then(function(oData) {
				var oReport = new QUnit({
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
		});
})();
