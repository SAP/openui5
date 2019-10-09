sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/m/MessageToast',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Controller, MessageToast, JSONModel) {
	"use strict";

	var ListController = Controller.extend("sap.m.sample.ListSwipe.List", {

		onInit : function (evt) {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);
		},

		handleSwipe: function(evt) {   // register swipe event
			var oSwipeContent = evt.getParameter("swipeContent"), // get swiped content from event
				oSwipeDirection = evt.getParameter("swipeDirection"); // get swiped direction from event
				var msg = "";

			if (oSwipeDirection === "BeginToEnd") {
				// List item is approved, change swipeContent(button) text to Disapprove and type to Reject
				oSwipeContent.setText("Approve").setType("Accept");
				msg = 'Swipe direction is from the beginning to the end (left ro right in LTR languages)';

			} else  {
				// List item is not approved, change swipeContent(button) text to Approve and type to Accept
				oSwipeContent.setText("Disapprove").setType("Reject");
				msg = 'Swipe direction is from the end to the beginning (right to left in LTR languages)';
			}
			MessageToast.show(msg);
		},

		handleReject: function (evt) {
			var oList = evt.getSource().getParent();
			oList.removeAggregation("items", oList.getSwipedItem());
			oList.swipeOut();
		}

	});


	return ListController;

});