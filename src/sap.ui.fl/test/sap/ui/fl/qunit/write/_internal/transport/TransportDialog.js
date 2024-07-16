sap.ui.define([
  "sap/m/App",
  "sap/ui/fl/write/_internal/transport/TransportDialog",
  "sap/m/Button",
  "sap/m/CheckBox",
  "sap/m/Page",
  "sap/ui/thirdparty/jquery"
], function(App, TransportDialog, Button, CheckBox, Page, jQuery) {
  "use strict";
  // Note: the HTML page 'TransportDialog.html' loads this module via data-sap-ui-on-init

  var bTemp = false;
  var bPackages = false;
  var bLrep = false;
  var bHidePackage = false;
  var oApp = new App("myApp", {
	  initialPage : "page1"
  });

  var fPress = function() {
	  var oDialog, fOnOkay, fOnCancel, sPackage, aPackages;

	  fOnOkay = function(oEvent) {
		  var sTransport, sPackage;

		  sTransport = oEvent.mParameters.selectedTransport;
		  sPackage = oEvent.mParameters.selectedPackage;
	  };
	  fOnCancel = function() {
		  //debugger;
	  };

	  if (bTemp) {
		  sPackage = "TW1";
	  } else {
		  sPackage = "";
	  }

	  if (bPackages) {
		  aPackages = [
			  {
				  transportId : "T1",
				  description : "Transport 1"
			  },
			  {
				  transportId : "T2",
				  description : "Transport 2"
			  },
			  {
				  transportId : "T3",
				  description : "Transport 3"
			  },
			  {
				  transportId : "T4",
				  description : "Transport 4"
			  },
			  {
				  transportId : "T5",
				  description : "Transport 5"
			  }
		  ]
	  } else {
		  aPackages = [ ];
	  }

	  var oObject = null;

	  if (bLrep) {
		  oObject = { "type":"variant","name":"id_1414740501651_318","namespace":"" };
	  }

	  oDialog = new TransportDialog({
		  hidePackage : bHidePackage,
		  pkg : sPackage,
		  transports : aPackages,
		  lrepObject : oObject
	  });
	  oDialog.attachOk(fOnOkay);
	  oDialog.attachCancel(fOnCancel);
	  oDialog.open();
  };
  var oStartButton = new Button({
	  text : "Start Dialog",
	  press : fPress
  });

  var oUseTemp = new CheckBox({
	  text : "Use Package",
	  selected: true,
	  select : function() {
		  bTemp= !bTemp;
	  }
  });

  var oUseLREP = new CheckBox({
	  text : "Use LREP Object",
	  selected: true,
	  select : function() {
		  bLrep= !bLrep;
	  }
  });

  var oUsePackages = new CheckBox({
	  text : "Use Transports",
	  selected: true,
	  select : function() {
		  bPackages= !bPackages;
	  }
  });

  var oHidePackage = new CheckBox({
	  text : "Hide Package",
	  selected: true,
	  select : function() {
		  bHidePackage= !bHidePackage;
	  }
  });

  var oCompactMode = new CheckBox({
	  selected: true,
	  text: "compactMode",
	  select : function() {
		  jQuery("body").toggleClass("sapUiSizeCompact");
	  }
  });

  var oPage = new Page("page1", {
	  title : "Transport Dialog Control",
	  content : [oStartButton, oUseTemp, oUsePackages, oHidePackage, oUseLREP,oCompactMode]
  });

  oApp.addPage(oPage);
  oApp.placeAt("body");

  jQuery(document).ready(function() {
	  jQuery("#myApp").toggleClass("sapUiSizeCompact");
  });
});