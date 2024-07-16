sap.ui.define([
  "sap/ui/integration/Host"
], function(Host) {
  "use strict";
  // Note: the HTML page 'index.html' loads this module via data-sap-ui-on-init

  if ('serviceWorker' in navigator) {
	  navigator.serviceWorker.register('./service-worker.js');
  }

  customElements.whenDefined("ui-integration-card").then(function () {
	  createHost();
  });

  function createHost() {
	  let host = new Host(),
		  cards = document.getElementsByTagName("ui-integration-card");

	  host.useExperimentalCaching();

	  for (let i = 0; i < cards.length; i++) {
		  cards[i]._getControl().setHost(host);
	  }

	  return host;
  }
});