sap.ui.define(
	['sap/ui/test/Opa5',
	 'sap/ui/test/matchers/BindingPath',
	 'sap/ui/test/matchers/Properties',
	 'sap/ui/test/matchers/AggregationFilled',
	 'sap/ui/test/actions/Press',
	 'sap/ui/test/actions/EnterText',
	 'sap/m/MessageBox'],
	function (Opa5, BindingPath, Properties, AggregationFilled, Press, EnterText,MessageBox) {

	Opa5.createPageObjects({
		onOrderCompleted: {
			viewName: "OrderCompleted",
			actions: {

				iPressOnTheReturnToShopButton: function () {
					return this.waitFor({
						id: "returnToShopButton",
						actions: new sap.ui.test.actions.Press()
					});
				}
			},
			assertions: {

				iShouldSeeTheOrderCompletedPage: function () {
					return this.waitFor({
						id: "returnToShopButton",
						success: function (oButton) {
							Opa5.assert.ok(oButton, "Found the order completed page");
						}
					});
				}
			}
		}
	});
});
