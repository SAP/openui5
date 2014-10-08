/*!
 * ${copyright}
 */

jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.ux3.Shell");
jQuery.sap.declare("samples.components.shell.Component");

// Shell Component
sap.ui.core.UIComponent.extend("samples.components.shell.Component", {
	metadata : {
		"abstract": true,
		version : "1.0",
		includes : [ "css/shell.css" ],  // css, javascript files that should be used in the component
		dependencies : { // external dependencies
			libs : [ ],
			components : ["samples.components.products.overview", "samples.components.products.details", "samples.components.products.supplier"], 
			ui5version : "1.13.0"
		},
		publicMethods: [ "render" ],
		aggregations: {
			"rootControl": { type: "sap.ui.core.Control", multiple: false, visibility: "hidden" }
		},
		library: "samples.components.shell", // inherited from ManagedObject, if omitted, the current package is automatically retrieved
		properties : {
			appTitle: {	name:"appTitle", type:"string", defaultValue:"Default Value that should not be shown" },
			model: { name: "model", type: "Object", defaultValue: null}
		}
	}
});


samples.components.shell.Component.prototype.createContent = function() {
	this.firstTime = true;
	// model to share beetween the child components
	
	var sServiceUrl = "http://epmdemo.corp/sap/bc/sepm_odata_srv/purchase";
	
	jQuery.sap.require("sap.ui.core.util.MockServer");
	var oMockServer = new sap.ui.core.util.MockServer({
		rootUri: sServiceUrl+"/"
	});
	
	var path = jQuery.sap.getModulePath("samples.components.shell") + "/../../epmdata/";
	
	oMockServer.simulate(path+"metadata.xml", path);
	oMockServer.start();

	// Data Model
	this.oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
	this.oShell = new sap.ui.ux3.Shell(this.createId("myShell"), {
		appTitle:"SAPUI5 Gold Reflection Shell",
		paneWidth: 300});

	//NAVIGATION ITEMS
	var WI = sap.ui.ux3.NavigationItem;

	var oSecondLevelNav = new sap.ui.ux3.NavigationItem({text:"{text}", key:"{key}"});
	var oFirstLevelNav = new sap.ui.ux3.NavigationItem({text:"{text}", key:"{group}"});

	oFirstLevelNav.bindAggregation("subItems", "items", oSecondLevelNav);

	this.oShell.bindAggregation("worksetItems", "/modelData", oFirstLevelNav);

	var that = this;
	this.oShell.attachWorksetItemSelected( function(oEvent) {
		var sKey = oEvent.getParameter("key");
		var oNavItem = oEvent.getParameter("item");
		var oContext = oNavItem.getBindingContext();
		var sCompName = oContext.getProperty("component");
		that.getShellContent(sKey, sCompName);
	});
	
	return this.oShell;
};


sap.ui.core.UIComponent.prototype.onBeforeRendering = function() {
// if the method is called for the first time, set up the child component for the first screen
	if (this.firstTime) {
		var oContext = this.getModel().getContext("/modelData/0/items/0");
		var sCompName = oContext.getProperty("component");
		var sKey = oContext.getProperty("key");
		this.masterComponent = sap.ui.component({
			name : sCompName,
			id : this.createId("comp_" + sKey),
			settings: { 
				model: this.oModel
			}
		});
		//this.masterComponent.setModel(this.oModel);
		this.oCont = new sap.ui.core.ComponentContainer(this.createId("cont_" + sKey), { component: this.masterComponent});
		this.oShell.setContent(this.oCont);
		this.firstTime = false;
	}
};

//=============================================================================
//OVERRIDE OF SETTERS
//=============================================================================
/*
* Overrides setText method of the component to set this text in the shell's app title
*/
samples.components.shell.Component.prototype.setAppTitle = function(sText) {
	this.oShell.setAppTitle(sText);
	this.setProperty("appTitle", sText);
	return this;
};

samples.components.shell.Component.prototype.getShellContent = function(sKey, sCompName) {
	// only instantiate the other child components if they don't exist, yet
	var oComp = sap.ui.getCore().getComponent(this.createId("comp_" + sKey));
	if (!oComp) {
		var oComp = sap.ui.component({
			name : sCompName,
			id : this.createId("comp_" + sKey),
			settings: {
				model: this.oModel
			}
		});
// if the master component has an eventBus channel to publish to _and_ the dependent component also has a corresponding subscription property
// connect the two initially
		this.oEventBusPub = this.masterComponent.getProperty("eventBusPublication")||null;
		if(!!this.oEventBusPub && oComp.setEventBusSubscription){
			oComp.setEventBusSubscription(this.oEventBusPub);
			// Pass the selection from master to the other
			var bus = sap.ui.getCore().getEventBus();
			/* the publishing is also done in the rowSelect method of the table within the master component. It needs to be 
			 done here, initially, despite of this. The reason lies in the order of events within this application.
			 The first time a row in the products table is selected, the other child components have most probably not been instantiated, yet, 
			 and could hence not have registered to the event bus channel, either. */
			bus.publish(this.oEventBusPub.channel, this.oEventBusPub.event, {context: this.masterComponent.getSelection()});
		}
	}

	this.oCont.setComponent(oComp);
};
