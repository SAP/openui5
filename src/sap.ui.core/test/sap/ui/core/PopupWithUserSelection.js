sap.ui.define([
  "sap/m/Button",
  "sap/m/Dialog",
  "sap/m/Text",
  "sap/m/Popover",
  "sap/m/VBox",
  "sap/m/Input"
], function(Button, Dialog, Text, Popover, VBox, Input) {
  "use strict";
  // Note: the HTML page 'PopupWithUserSelection.html' loads this module via data-sap-ui-on-init

  /* Non-modal popup ==> sap.m.Popover*/
  var fnOpenPopover = function(){
	  oPopoverStandalone.openBy(oOpenPopoverButton);
  };

  var fnClosePopover = function(){
	  oPopoverStandalone.close();
  };

  var fnOpenDialogInnerPopover = function(){
	  oDialogInnerPopover.open();
  };

  var fnCloseDialogInnerPopover = function(){
	  oDialogInnerPopover.close();
  };

  var fnOpenPopoverInner = function(){
	  oPopoverInner.openBy(oOpenPopoverInnerButton);
  };

  var fnClosePopoverInner = function(){
	  oPopoverInner.close();
  };

  var oOpenPopoverButton = new Button({
	  text: 'Open Popover',
	  press: fnOpenPopover
  });

  var oClosePopoverButton = new Button({
	  text: 'Close Popover',
	  press: fnClosePopover
  });

  var oOpenPopoverInnerButton = new Button({
	  text: 'Open Inner Popover',
	  press: fnOpenPopoverInner
  });

  var oClosePopoverInnerButton = new Button({
	  text: 'Close Inner Popover',
	  press: fnClosePopoverInner
  });

  var oOpenDialogInnerPopoverButton = new Button({
	  text: 'Open Inner Dialog of Popover',
	  press: fnOpenDialogInnerPopover
  });

  var oCloseDialogInnerPopoverButton = new Button({
	  text: 'Close Inner Dialog of Popover',
	  press: fnCloseDialogInnerPopover
  });

  var oDialogInnerPopover = new Dialog({
	  title: "Inner Dialog of Popover",
	  content: [new Text({ text: "Inner Dialog of Popover Lorem ipsum" })],
	  beginButton: oCloseDialogInnerPopoverButton
  });

  var oPopoverStandalone = new Popover({
	  title: "Popover",
	  modal: false,
	  content: [new Text({ text: "Popover Lorem ipsum" }), oOpenDialogInnerPopoverButton, oClosePopoverButton]
  });

  var oPopoverInner = new Popover({
	  title: "Inner Popover",
	  content: [new Text({ text: "Inner Popover Lorem ipsum" }), oClosePopoverInnerButton]
  });

  /* Modal Popup --> sap.m.Dialog*/
  var fnOpenDialog = function () {
	  oDialog.open();
  };

  var fnCloseDialog = function () {
	  oDialog.close();
  };

  var fnOpenDialogInner = function () {
	  oDialogInner.open();
  };

  var fnCloseDialogInner = function () {
	  oDialogInner.close();
  };

  var oText = new Text({ text: "Lorem ipsum dolor st amet, consetetu" });

  var oCloseBtn = new Button({
	  text: 'Close',
	  press: fnCloseDialog
  });

  var oOpenBtn = new Button({
	  text: 'Open Dialog',
	  press: fnOpenDialog
  });

  var oOpenBtnInner = new Button({
	  text: 'Open Inner Dialog',
	  press: fnOpenDialogInner
  });

  var oCloseBtnInner = new Button({
	  text: 'Close Inner Dialog',
	  press: fnCloseDialogInner
  });

  var oDialogInner = new Dialog({
	  title: "Inner Dialog Title",
	  content: new Text({ text:"Inner Dialog Lorem ipsum"}),
	  endButton: oCloseBtnInner
  });

  var oDialog = new Dialog({
	  title: "Dialog Title",
	  beginButton: oCloseBtn
  });

  var oBusyButton = new Button({
	  text: "Set Busy",
	  press: function () {
		  new Promise(function (resolve, reject) {
			  setTimeout(function () {
				  resolve();
			  }, 3000);
		  }).then(
			  function () {
				  oVBox.setBusy(false);
			  }
		  );

		  oVBox.setBusy(true);
	  }
  });

  oDialog.addContent(new Text({ text: "Dialog Lorem ipsum" }));
  oDialog.addContent(oOpenBtnInner);
  oDialog.addContent(oOpenPopoverInnerButton);

  var oVBox = new VBox("vbox", { items: [oOpenBtn, oBusyButton, oOpenPopoverButton, oText, new Input({ value: "My Input"})] });
  oVBox.placeAt("content");
});