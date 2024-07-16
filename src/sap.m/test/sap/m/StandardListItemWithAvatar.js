sap.ui.define([
  "sap/ui/core/IconPool",
  "sap/m/Avatar",
  "sap/m/List",
  "sap/m/StandardListItem",
  "sap/ui/core/library",
  "sap/m/App",
  "sap/m/Page"
], function(IconPool, Avatar, List, StandardListItem, coreLibrary, App, Page) {
  "use strict";

  // shortcut for sap.ui.core.TextAlign
  const TextAlign = coreLibrary.TextAlign;

  // shortcut for sap.ui.core.TextDirection
  const TextDirection = coreLibrary.TextDirection;

  var av = new Avatar( {
		  displaySize: "L",
		  displayShape: "Square",
		  badgeIcon: "sap-icon://camera",
		  imageFitType: "Cover",
		  press: function(){alert();}
	  });
  av.setSrc("images/Lamp_avatar_01.jpg");

  var av1 = new Avatar( {
	  displaySize: "L",
	  displayShape: "Square",
	  badgeIcon: "sap-icon://camera",
	  imageFitType: "Contain",
	  showBorder: true,
	  press: function(){alert("action press");}
  });
  av1.setSrc("images/Lamp_avatar_01.jpg");

  var av2 = new Avatar( {
	  displaySize: "XL",
	  imageFitType: "Cover"
  });
  av2.setSrc("sap-icon://lab");

  var av3 = new Avatar( {
	  displaySize: "L",
	  imageFitType: "Contain",
	  src: "sap-icon://lab"
  });


  var oList = new List({
	  inset : true,
	  showUnread: true,
	  headerText : "Avatar test",
	  items : [
		  new StandardListItem({
			  title : "Image",
			  titleTextDirection: TextDirection.LTR,
			  titleTextAlign: TextAlign.End,
			  description : "SIP Telephone Set",
			  info: "Today",
			  infoState: "Success",
			  icon: "images/Woman_avatar_01.png",
			  iconInset: true,
			  unread : true,
			  counter: 1
		  }),
		  new StandardListItem({
			  title : "Icon no inset",
			  description : "Brilliance Monitor, Docking Station",
			  info: "Yesterday",
			  iconInset: false,
			  icon: "sap-icon://search",
			  unread : true,
			  counter: 4
		  }),

		  new StandardListItem({
			  title : "Avatar no Inset",
			  description : "Mouse, Headphone, Keyboard",
			  info: "+ 359 234 567",
			  infoTextDirection: TextDirection.LTR,
			  infoState: "Warning",
			  avatar: av,
			  unread : true,
			  iconInset: false,
			  counter: 2
		  }),

		  new StandardListItem({
			  title : "Avatar no Inset and contain fit of the image",
			  description : "Mouse, Headphone, Keyboard",
			  info: "+ 359 234 567",
			  infoTextDirection: TextDirection.LTR,
			  infoState: "Warning",
			  avatar: av1,
			  unread : true,
			  iconInset: false,
			  counter: 2
		  }),

		  new StandardListItem({
			  title : "Avatar no Inset",
			  description : "Mouse, Headphone, Keyboard",
			  info: "+ 359 234 567",
			  infoTextDirection: TextDirection.LTR,
			  infoState: "Warning",
			  avatar: av3,
			  unread : true,
			  iconInset: false,
			  counter: 2
		  }),

		  new StandardListItem({
			  title : "Avatar with Inset",
			  description : "Mouse, Headphone, Keyboard",
			  info: "+ 359 234 567",
			  infoTextDirection: TextDirection.LTR,
			  infoState: "Warning",
			  avatar: av2,
			  unread : true,
			  iconInset: true,
			  counter: 2
		  }),

		  new StandardListItem({
			  title : "Icon with inset",
			  description : "Brilliance Monitor, Docking Station",
			  info: "Yesterday",
			  iconInset: true,
			  icon: "sap-icon://search",
			  unread : true,
			  counter: 4
		  })
	  ]
  });

  var app = new App().addPage(new Page({
		  title: "Standard List Item with Avatar",
		  content: oList
	  }));
  app.placeAt("body");
  //	av.setDisplayShape("Circle");
  av.setDisplaySize("XL");
});