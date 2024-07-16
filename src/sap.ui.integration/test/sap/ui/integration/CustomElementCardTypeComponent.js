sap.ui.define([
  "sap/m/MessageToast",
  "sap/ui/integration/Host"
], function(MessageToast, Host) {
  "use strict";
  // Note: the HTML page 'CustomElementCardTypeComponent.html' loads this module via data-sap-ui-on-init

  function handleAction(event) {
	  MessageToast.show("Event Type: " + event.type);
  }

  document.querySelectorAll("ui-integration-card").forEach(function (oCard) {
	  oCard.addEventListener("action", handleAction);
  });

  customElements.whenDefined("ui-integration-card").then(function () {
	  new Host('host1', {
		  resolveDestination: function(sDestinationName) {
			  if (sDestinationName == "Northwind") {
				  return Promise.resolve("https://services.odata.org/V3/Northwind/Northwind.svc");
			  }
		  }
	  });
  });
});