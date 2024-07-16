sap.ui.define([
  "sap/m/App",
  "sap/m/BusyIndicator",
  "sap/m/BusyDialog",
  "sap/m/Button",
  "sap/m/Page",
  "sap/ui/thirdparty/jquery"
], function(App, BusyIndicator, BusyDialog, Button, Page, jQuery) {
  "use strict";
  // Note: the HTML page 'BusyIndicator.html' loads this module via data-sap-ui-on-init

  var app = new App("myApp", {initialPage:"page1"});

  var busyImage = new BusyIndicator({
	  text:'this is an image busy indicator ...',
	  customIcon:'images/synchronise_48.png',
	  customIconRotationSpeed: 5000
  });

  var busyCSSText = new BusyIndicator({
	  text:'default sized busy indicator ...',
  });

  var busyCSSSize1 = new BusyIndicator({
	  size:'30px',
	  text:'30px sized busy indicator ...'
  });

  var busyCSSSize2 = new BusyIndicator({
	  size:'40px',
	  text:'40px sized busy indicator ...'
  });

  var busyCSSSize3 = new BusyIndicator({
	  size:'50px',
	  text:'50px sized busy indicator ...'
  });

  var busyCSSSize4 = new BusyIndicator({
	  size:'60px',
	  text:'60px sized busy indicator ...'
  });

  var busyCSSSize5 = new BusyIndicator({
	  size:'90px',
	  text:'90px sized busy indicator ...'
  });
  var busyCSS = new BusyIndicator(); // no value for "size" - we are using ths default one (16px)

  var busyDialog1 = (busyDialog3) ? busyDialog3 : new BusyDialog('busy1',{customIcon: 'images/synchronise_48.png'});

  var busyDialog2 = (busyDialog2) ? busyDialog2 : new BusyDialog('busy2',{text:'i am soo busy doing stuff', title: 'Busy'});

  var busyDialog3 = busyDialog3 ? busyDialog3 : new BusyDialog('busy3',{text:'i am a busy screen with a loooooooong long long long text and a cancel button',
	  title: 'LOADING',
	  showCancelButton: true, // IMPORTANT: the "Cancel" button text of this dialog may not be set, it should be the default text (tested in translation tests)
	  close: function(oEvent){console.log(oEvent, 'closed')}
  });

  var busyDialog4 = (busyDialog4) ? busyDialog4 : new BusyDialog('busy4',{text:'Fetching JSON Data', title: 'Loading'});

  var syncLoad = function() {
	  busyDialog4.open()
	  jQuery.ajax({
		  url: "http://itunes.apple.com/search?term=yelp&country=us&entity=software",
		  dataType: 'jsonp',
		  async:false,
		  type: 'GET',
		  success:function(jsonData) {
			  console.log(jsonData)
			  busyDialog4.close()
			  },
		  error:function(jqXHR, exception) {
			  console.log(textStatus)
			  busyDialog4.close()
		  }
	  })
  }

  var openBusyScreenBtn1 = new Button({
	  text: 'open BusyDialog',
	  press: function() {
		  busyDialog1.open();
		  setTimeout(function() {
			  busyDialog1.close();
		  },2000)
	  }
  }).addStyleClass('BusyButton');
  var openBusyScreenBtn2 = new Button({
	  text: 'open BusyDialog_text',
	  press: function() {
		  busyDialog2.open();
		  setTimeout(function() {
			  busyDialog2.close();
		  },2000)
	  }
  }).addStyleClass('BusyButton');
  var openBusyScreenBtn3 = new Button({
	  text: 'open BusyDialog_text_cancelButton',
	  press: function() {
		  busyDialog3.open();
	  }
  }).addStyleClass('BusyButton');
  var openBusyScreenBtn4 = new Button({
	  text: 'Ajax Call',
	  press: function() {
		  syncLoad();
	  }
  }).addStyleClass('BusyButton');

  var page1 = new Page("page1", {
	  title:"Mobile Busy Indicator Controls",
	  headerContent: [busyCSS],
	  content:[
		  openBusyScreenBtn1,
		  openBusyScreenBtn2,
		  openBusyScreenBtn3,
		  openBusyScreenBtn4,
		  busyImage,
		  busyCSSText,
		  busyCSSSize1,
		  busyCSSSize2,
		  busyCSSSize3,
		  busyCSSSize4,
		  busyCSSSize5
	  ]
  });
  app.addPage(page1).placeAt("content");
});