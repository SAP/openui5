sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function (elementActionTest) {
	'use strict';

	var fnConfirmUCIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("uci").getVisible(), false, "then the Upload Collection Item element is invisible");
	};

	var fnConfirmUCIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("uc").getVisible(), true, "then the Upload Collection Item element is visible");
	};

	elementActionTest("Checking the remove/reveal action for Upload Collection Item", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.fiori">"' +
			'<wc:UploadCollection id="uc">' +
			' <wc:items>' +
			'	<wc:UploadCollectionItem id="uci" />' +
			' </wc:items>' +
			'</wc:UploadCollection>' +
			'</mvc:View>',
		action: {
			name: "remove",
			controlId: "uci",
			parameter: function (oView) {
				return {
					removedElement: oView.byId("uci")
				};
			}
		},
		afterAction: fnConfirmUCIsInvisible,
		afterUndo: fnConfirmUCIsVisible,
		afterRedo: fnConfirmUCIsInvisible
	});

	var fnConfirmUCIFileNameIs = function (sFileName) {
		return function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("uci").getFileName(), sFileName, "Upload Collection Item file name is correct");
		};
	};

	elementActionTest("Checking the rename action for Upload Collection Item", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wc="sap.ui.webc.fiori">"' +
			'<wc:UploadCollection id="uc">' +
			' <wc:items>' +
			'	<wc:UploadCollectionItem id="uci" fileName="initial file name"/>' +
			' </wc:items>' +
			'</wc:UploadCollection>' +
			'</mvc:View>',
		action : {
			name : "rename",
			controlId : "uci",
			parameter : function (oView) {
				return {
					newValue : "new file name",
					renamedElement : oView.byId("uci")
				};
			}
		},
		afterAction: fnConfirmUCIFileNameIs("new file name"),
		afterUndo: fnConfirmUCIFileNameIs("initial file name"),
		afterRedo: fnConfirmUCIFileNameIs("new file name")
	});


});