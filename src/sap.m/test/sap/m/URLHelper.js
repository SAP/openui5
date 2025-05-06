sap.ui.define([
  "sap/m/Page",
  "sap/m/List",
  "sap/m/DisplayListItem",
  "sap/m/App"
], function(Page, List, DisplayListItem, App) {
  "use strict";
  // Note: the HTML page 'URLHelper.html' loads this module via data-sap-ui-on-init

  var person = {
	  name : "John Smith",
	  tel : "+49 6227 747474",
	  sms : "+49 173 123456",
	  email : "john.smith@sap.com",
	  website : "http://www.sap.com",
	  address : "Walldorf, Germany"
  };

  var page = new Page({
	  title : person.name,
	  content : [new List({
		  inset : true,
		  headerText : "!!! You need a SIM Card to test properly !!!",
		  items : [new DisplayListItem({
			  label : "Name",
			  value : person.name
		  }), new DisplayListItem({
			  label : "Telephone",
			  value : person.tel,
			  type : "Active",
			  press : function() {
				  sap.m.URLHelper.triggerTel(person.sms);
			  }
		  }), new DisplayListItem({
			  label : "Sms",
			  value : person.sms,
			  type : "Active",
			  press : function() {
				  sap.m.URLHelper.triggerSms(person.sms);
			  }
		  }), new DisplayListItem({
			  id : "email",
			  label : "Email",
			  value : person.email,
			  type : "Active",
			  press : function() {
				  sap.m.URLHelper.triggerEmail(person.email, "Info", "Dear " + person.name + ",\nThis is a test messsage &cc=test@sap.com ");
			  }
		  }), new DisplayListItem({
			  label : "Address",
			  value : person.address,
			  type : "Active",
			  press : function() {
				  sap.m.URLHelper.redirect("http://maps.apple.com/?q=" + person.address, true);
			  }
		  }), new DisplayListItem({
			  id : "website",
			  label : "Website",
			  value : person.website,
			  type : "Active",
			  press : function() {
				  sap.m.URLHelper.redirect(person.website, true);
			  }
		  })]
	  })]
  });

  new App().addPage(page).placeAt("body");
});