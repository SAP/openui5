sap.ui.define([
  "sap/ui/integration/Host"
], function(Host) {
  "use strict";
  // Note: the HTML page 'CustomElementCardsWithHost.html' loads this module via data-sap-ui-on-init

  customElements.whenDefined("ui-integration-card").then(function () {
	  new Host('host1', {
		  actions: [
			  {
				  type: 'Navigation',
				  url: "http://www.sap.com",
				  target: "_blank",
				  text: 'AutoOpen - SAP website'
			  },
			  {
				  type: 'Navigation',
				  parameters: {
					  url: "http://www.sap.com",
					  target: "_blank"
				  },
				  text: 'Navigation - SAP website'
			  },
			  {
				  type: 'Custom',
				  icon: 'sap-icon://add',
				  text: 'Add',
				  tooltip: 'Add',
				  buttonType: 'Accept',
				  visible: function (card) {
					  return card.getId() !== 'card3';
				  },
				  enabled: function (card) {
					  return card.getId() !== 'card1';
				  },
				  action: function (card, button) {
					  alert('Card id = ' + card.getId() + ' Button = ' + button.getText());
				  }
			  },
			  {
				  type: 'Custom',
				  icon: 'sap-icon://delete',
				  text: 'Delete',
				  tooltip: 'Delete',
				  visible: function (card, button) {
					  return card.getId() !== 'card2' && card.getId() !== 'card3';
				  },
				  enabled: true,
				  action: function (card, button) {
					  alert('Card id = ' + card.getId() + ' Button = ' + button.getText());
				  }
			  }
		  ],
		  onAction: function (event) {
			  var parameters = event.getParameter('parameters');

			  event.getParameter('actionSource');
			  event.getParameter('type');

			  console.error("Host Action ", parameters);
		  },
		  resolveDestination: function(sDestinationName) {
			  if (sDestinationName == "Northwind") {
				  return "https://services.odata.org/V3/Northwind/Northwind.svc";

				  // or with promise
				  //return Promise.resolve("https://services.odata.org/V3/Northwind/Northwind.svc");
			  }
		  }
	  });

	  document.getElementById('cardWithActions1').setAttribute('host', 'host1');
  });
});