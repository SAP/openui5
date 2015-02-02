sap.ui.controller("sap.m.sample.NavContainer.C", {

	handleNav: function(evt) {
		var navCon = this.getView().byId("navCon");
		var target = evt.getSource().data("target");
		if (target) {
			var animation = this.getView().byId("animationSelect").getSelectedKey();
			navCon.to(this.getView().byId(target), animation);
		} else {
			navCon.back();
		}
	}
});
