sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function (elementActionTest) {
	'use strict';

	var fnConfirmUCIPositionIs = function (iIndex) {
		return function (oUiComponent, oViewAfterAction, assert) {
			var oItem = oViewAfterAction.byId("uci1");
			assert.strictEqual(oViewAfterAction.byId("uc").indexOfItem(oItem), iIndex, "The item is moved to the correct position");
		};
	};

	elementActionTest("Checking the move action for Upload Collection items", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.fiori">"' +
			'<wc:UploadCollection id="uc">' +
			' <wc:items>' +
			'	<wc:UploadCollectionItem id="uci1" />' +
			'	<wc:UploadCollectionItem id="uci2" />' +
			' </wc:items>' +
			'</wc:UploadCollection>' +
			'</mvc:View>',
		action: {
			name: "move",
			controlId: "uc",
			parameter: function (oView) {
				return {
					movedElements: [{
						element: oView.byId("uci1"),
						sourceIndex: 0,
						targetIndex: 1
					}],
					source: {
						aggregation: "items",
						parent: oView.byId("uc")
					},
					target: {
						aggregation: "items",
						parent: oView.byId("uc")
					}
				};
			}
		},
		afterAction: fnConfirmUCIPositionIs(1),
		afterUndo: fnConfirmUCIPositionIs(0),
		afterRedo: fnConfirmUCIPositionIs(1)
	});

});