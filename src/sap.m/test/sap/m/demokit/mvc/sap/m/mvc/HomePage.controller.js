sap.ui.controller("sap.m.mvc.HomePage", {
	
	listItemTriggered: function(evt) {
		// Option 1: using custom data attached to the ListItem
		// The ID (abbreviation) of the country is available as custom data object and... 
		// ...we could use it to fetch detail data
		// ...or we could hand it over to the detail page with  .to("detailPage", {id: id});
		var id = evt.getSource().data("id"); // this id remains unused in this example, though!
		
		// Option 2:
		// In case of data binding we can get the binding context (a sort of pointer to the data object to which the clicked ListItem is bound)
		var bindingContext = evt.getSource().getBindingContext(); // evt.getSource() is the ListItem
		
		// The EventBus is used to let the Root Controller know that a navigation should take place.
		// The bindingContext is attached to the data object here to be used in the Root Controller's event handler.
		
		var bus = sap.ui.getCore().getEventBus();
		bus.publish("nav", "to", { 
			id : "DetailPage",
			data : {
				context : bindingContext
			}
		});
	}

});