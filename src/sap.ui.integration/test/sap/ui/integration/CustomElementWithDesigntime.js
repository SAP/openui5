sap.ui.define([

], function () {
  "use strict";
  // Note: the HTML page 'CustomElementWithDesigntime.html' loads this module via data-sap-ui-on-init

  var manifest1 = {
	  "sap.app": {
		  "id": "cardWithDesigntime",
		  "type": "card"
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


  document.getElementById("card1").setAttribute("manifest", JSON.stringify(manifest1));
});