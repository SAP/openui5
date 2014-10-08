sap.ui.controller("view.inbox.MailInbox", {

	onInit: function(){
		this.router = sap.ui.core.UIComponent.getRouterFor(this);
		this.router.attachRoutePatternMatched(this._handleRouteMatched, this);
	},

	_handleRouteMatched : function (evt) {
		var param = evt.getParameter("name");
		var sFilter = evt.getParameter("arguments").inboxType;
		if ("inbox" !== param) {
			return;
		}

		if (sFilter){
			var oFilter = new sap.ui.model.Filter(sFilter, sap.ui.model.FilterOperator.EQ, true);
			this.bindListData([oFilter]);
		} else {
			this.bindListData();
		}
	},

	bindListData : function(aFilters){
		var that = this;
		this.getView().oList.bindAggregation("items", {
			path: "/items",
			factory: function(sId){
				return new sap.m.StandardListItem(sId, {
					title: "{from}",
					description: "{title}",
					unread: "{unread}",
					info: "{date}",
					type: sap.m.ListType.Active,
					customData: [
						new sap.ui.core.CustomData({
							key: "id",
							value: "{id}"
						})
					]
				});
			},
			filters: aFilters
		});
	},

	onListSelect: function(oEvent){
		var sBindingPath = oEvent.getParameter("listItem").getBindingContext().getPath(),
			sViewId = sBindingPath.substring(sBindingPath.lastIndexOf("/") + 1);

		this.router.navTo("mail", {viewId: sViewId});
	},

	handleNavBack : function () {
		this.router.myNavBack("home", {});
	}

});