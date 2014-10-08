jQuery.sap.declare("sap.ui.demo.tdg.test.action.FilterAction");
jQuery.sap.require("sap.ui.test.Opa5");
var Opa5 = sap.ui.test.Opa5;

sap.ui.demo.tdg.test.action.FilterAction = Opa5.extend("sap.ui.demo.tdg.test.action.FilterAction", {
	_enterFilter : function (sFilter) {
		return this.waitFor({
			id : "searchField",
			viewName : "Master",
			success : function (oSearchField) {
				oSearchField.setValue(sFilter);
				oSearchField.fireSearch();
			}
		});
	},

	iEnterAFilterForBread : function () {
		return this._enterFilter("Bread");
	},

	iRemoveTheFilter : function () {
		return this._enterFilter("");
	}
});