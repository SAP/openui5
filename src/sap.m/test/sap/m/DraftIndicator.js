sap.ui.define([
  "sap/m/DraftIndicator",
  "sap/m/Button"
], function(DraftIndicator, Button) {
  "use strict";
  // Note: the HTML page 'DraftIndicator.html' loads this module via data-sap-ui-on-init

  //	jQuery.sap.require("sap.m.DraftIndicator");

  var draftInd = new DraftIndicator({
  });

  var oSavingDraftButton = new Button({
	  text: "show Saving Draft",
	  press: function () {
		  draftInd.showDraftSaving();
	  }
  });

  var oSavedDraftButton = new Button({
	  text: "show Draft Saved",
	  press: function () {
		  draftInd.showDraftSaved();
	  }
  });

  var oClearDraftButton = new Button({
	  text: "clear Draft state",
	  press: function () {
		  draftInd.clearDraftState();
	  }
  });


  oClearDraftButton.placeAt("content");
  oSavingDraftButton.placeAt("content");
  oSavedDraftButton.placeAt("content");
  draftInd.placeAt("content");
});