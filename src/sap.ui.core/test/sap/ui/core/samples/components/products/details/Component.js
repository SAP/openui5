/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/UIComponent', 'sap/ui/core/library', 'sap/ui/core/mvc/View', 'sap/ui/model/resource/ResourceModel', 'sap/ui/table/Table'],
	function(UIComponent, coreLibrary, View, ResourceModel, Table) {
	"use strict";


	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = coreLibrary.mvc.ViewType;

	// new Component
	var Component = UIComponent.extend("samples.components.products.details.Component", {

		metadata : {
			version : "1.0",
			dependencies : {
				version : "1.8",
				libs : [ "sap.ui.core" ]
			},
			properties: {
				eventBusSubscription: {name: "eventBusSubscription", type: "object", defaultValue: {channel: "contextChanged", event: "contextChanged"}},
				i18nBundle: {name: "geti18nBundle", type: "string", defaultValue: "samples.components.products.details.i18n.messagebundle"},
				model: { name: "model", type: "Object", defaultValue: null}
			}
		}
	});

	Component.prototype.init = function(){
		UIComponent.prototype.init.apply(this);
	};

	/*
	* sets model for internationalization files and subscribes to the event bus for binding context changes
	*/
	Component.prototype.createContent = function(){
		this.view = sap.ui.view({id:this.createId("myView"),viewName:"samples.components.products.details.view.Details",type:ViewType.JS});
		this.view.setModel(new ResourceModel({bundleName: this.getProperty("i18nBundle")}), "texts");
		var oSubscription = this.getEventBusSubscription();
		oSubscription.fn = this.onContextChanged;
		sap.ui.getCore().getEventBus().subscribe(oSubscription.channel, oSubscription.event, oSubscription.fn, this);
		return this.view;
	};

	/*
	 * handler for context change - passes according context to the controller of the displayed view
	 */
	Component.prototype.onContextChanged = function(sChannelId, sEventId, oContext) {
		this.view.getController().onContextChanged(oContext.context, this.view);
	};

	/*
	 * propagates the model from the component to the view
	 */
	Component.prototype.setModel = function(oModel, sName) {
		this.view.setModel(oModel, sName);
		return this;
	};

	/*
	 * if there is a different event bus channel and event provided from other components that should trigger
	 *  the onContextChanged method, these can be set here.
	 */
	Component.prototype.setEventBusSubscription = function(oSub){
		var oBus = sap.ui.getCore().getEventBus();
		var oSubscription = this.getProperty("eventBusSubscription");
		if (oSubscription !== oSub && oSub instanceof Object){
			oBus.unsubscribe(oSubscription.channel, oSubscription.event, oSubscription.fn, this);
			oSubscription.channel = oSub.channel;
			oSubscription.event = oSub.event;
			oBus.subscribe(oSubscription.channel, oSubscription.event, oSubscription.fn, this);
			this.setProperty("eventBusSubscription", oSubscription);
		}
		return this;
	};

	return Component;

});
