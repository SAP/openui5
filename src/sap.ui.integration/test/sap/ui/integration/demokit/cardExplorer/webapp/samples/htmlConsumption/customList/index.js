sap.ui.define([

], function () {
  "use strict";
  // Note: the HTML page 'index.html' loads this module via data-sap-ui-on-init

  window.onload = () => {

	  document.querySelectorAll("div[role='list']").forEach((list) => {

		  let listItems = list.querySelectorAll("div[role='listitem']"),
			  currentLI = 0;

		  list.addEventListener("keydown", function (event) {

			  switch (event.keyCode) {
				  case 38: // Up arrow
						  listItems[currentLI].setAttribute("tabindex", "-1");

						  currentLI = currentLI > 0 ? --currentLI : 0;     // Decrease the counter
						  listItems[currentLI].setAttribute("tabindex", "0");
						  listItems[currentLI].focus();
						  break;
				  case 40: // Down arrow
					  listItems[currentLI].setAttribute("tabindex", "-1");

					  currentLI = currentLI < listItems.length - 1 ? ++currentLI : listItems.length - 1; // Increase counter
					  listItems[currentLI].setAttribute("tabindex", "0");
					  listItems[currentLI].focus();
					  break;
				  }
		  });
	  });
  }
});