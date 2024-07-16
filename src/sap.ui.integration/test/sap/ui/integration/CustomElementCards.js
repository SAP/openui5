sap.ui.define([
  "sap/m/MessageToast"
], function(MessageToast) {
  "use strict";
  // Note: the HTML page 'CustomElementCards.html' loads this module via data-sap-ui-on-init

  customElements.whenDefined("ui-integration-card").then(function () {
	  document.createElement("ui-integration-card");
  });


  // set up a card through attributes
  var oCardThroughAttributes = document.createElement("ui-integration-card");
  oCardThroughAttributes.setAttribute('id', "dynamicCard");
  oCardThroughAttributes.setAttribute("manifest", "./widgets/cardmanifests/list.actions.manifest.json");
  document.body.appendChild(oCardThroughAttributes);

  // set up a card through properties
  var oCardThroughProperties = document.createElement("ui-integration-card");
  var manifest = {
	  "sap.app": {
		  "type": "card",
		  "id": "tableCardAsProperty"
	  },
	  "sap.card": {
		  "type": "Table",
		  "header": {
			  "title": "Table Card with Top 5 Products",
			  "subTitle": "These are the top sellers this month",
			  "icon": {
				  "src": "sap-icon://sales-order"
			  },
			  "status": {
				  "text": "5 of 100"
			  }
		  },
		  "content": {
			  "data": {
				  "json": [{
						  "Name": "Comfort Easy",
						  "Category": "PDA & Organizers"
					  },
					  {
						  "Name": "ITelO Vault",
						  "Category": "PDA & Organizers"
					  },
					  {
						  "Name": "Notebook Professional 15",
						  "Category": "Notebooks"
					  },
					  {
						  "Name": "Ergo Screen E-I",
						  "Category": "Monitors"
					  },
					  {
						  "Name": "Laser Professional Eco",
						  "Category": "Printers"
					  }
				  ]
			  },
			  "row": {
				  "columns": [{
						  "title": "Name",
						  "value": "{Name}"
					  },
					  {
						  "title": "Category",
						  "value": "{Category}"
					  }
				  ]
			  }
		  }
	  }
  };

  oCardThroughProperties.manifest = manifest
  document.body.appendChild(oCardThroughProperties);

  // event listeners
  document.getElementById("dynamicCard").addEventListener("action", function (oEvent) {
	  MessageToast.show(oEvent.detail.getParameter("type") + " Action triggered! for card with Id dynamicCard")
  });

  document.body.addEventListener("action", function (oEvent) {
	  MessageToast.show(oEvent.detail.getParameter("type") + " Action triggered! Event bubbled to the body")
  });
});