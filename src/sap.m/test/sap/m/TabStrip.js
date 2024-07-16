sap.ui.define([
  "sap/m/MessageToast",
  "sap/m/TabStripItem",
  "sap/m/TabStrip"
], function(MessageToast, TabStripItem, TabStrip) {
  "use strict";
  var oItem2 = new TabStripItem({
	  key: "1",
	  text: "One",
	  modified: true
  });
  var oTabStrip = new TabStrip('TabStripFirst', {
	  itemClose: function(oEvent) {
		  var oItem = oEvent.getParameter("item"),
			  sMessage = "itemCloseRequest handler for item " + oItem.getId() + " received";
		  if (oItem.getModified()) {
			  sMessage += ". The tab won't close.";
			  oEvent.preventDefault();
		  } else {
			  sMessage += ". The tab is closed.";
		  }
		  MessageToast.show(sMessage, {autoClose: true});
	  },
	  hasSelect: true,
	  selectedItem: oItem2,
	  items: [
		  new TabStripItem({
			  key: "0",
			  additionalText: "some text",
			  icon: "sap-icon://syringe",
			  text: "01234567890123456789012345"
		  }),
		  oItem2,
		  new TabStripItem({
			  key: "2",
			  icon: "sap-icon://syringe",
			  iconTooltip: "syringe",
			  text: "Two"
		  }),
		  new TabStripItem({
			  key: "3",
			  text: "Three",
			  additionalText: "intro text (2)",
			  modified: true
		  }),
		  new TabStripItem({
			  key: "4",
			  icon: "../ui/documentation/sdk/images/HT-6120.jpg",
			  iconTooltip: "flash",
			  text: "Four"
		  }),
		  new TabStripItem({
			  key: "5",
			  additionalText: "additional text",
			  modified: false
		  }),
		  new TabStripItem({
			  key: "6",
			  text: "Six"
		  }),
		  new TabStripItem({
			  key: "7",
			  text: "Seven",
			  modified: true
		  }),
		  new TabStripItem({
			  key: "8",
			  text: "Eight"
		  }),
		  new TabStripItem({
			  key: "9",
			  text: "Nine",
			  modified: true
		  }),
		  new TabStripItem({
			  key: "10",
			  text: "Ten"
		  })
	  ]
  });
  oTabStrip.placeAt('body');
});