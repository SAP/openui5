sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/ComponentContainer",
  "sap/ui/base/Object",
  "sap/ui/thirdparty/jquery",
  "sap/ui/core/Component",
  "sap/ui/core/mvc/XMLView"
], function(Controller, JSONModel, ComponentContainer, BaseObject, jQuery) {
  "use strict";
  // Note: the HTML page 'ComponentManifestFirst.html' loads this module via data-sap-ui-on-init

  /*global sinon */
  sap.ui.loader.config({
	  paths: {
		  ["samples"]: "./samples"
	  }
  });


  //***** Manifest **************************************
  // the data model for different manifest entries
  var mModel = {
	  "manifests": {
		  "m1":{
			  "key": "m1",
			  "name": "Manifest (Resource Roots + Dependencies)",
			  "content": {
				  "_version": "0.1.0",
				  "sap.app": {
					  "_version": "1.2.0",
					  "id": "samples.components.button",
					  "text": "Taken from Dynamic Manifest 1"
				  },
				  "sap.ui5": {
					  "resourceRoots": {
						  "foo": "foo",
						  "bar": "/../bar"
					  },
					  "dependencies": {
						  "libs": {
							  "sap.ui.ux3": {}
						  }
					  }
				  }
			  }
		  },
		  "m2":{
			  "key": "m2",
			  "name": "Manifest (Extensibility)",
			  "content": {
				  "_version": "0.1.0",
				  "sap.app": {
					  "_version": "1.2.0",
					  "id": "samples.manifestfirst.sap",
					  "text": "Taken from Manifest 3"
				  },
				  "sap.ui5": {
					  "dependencies": {
						  "libs": {
							  "sap.m": {}
						  }
					  },
					  "extends": {
						  "extensions": {
							  "sap.ui.viewReplacements": {
								  "samples.manifestfirst.sap.view.Main": {
									  "viewName": "samples.manifestfirst.customer.view.Main",
									  "type": "XML"
								  }
							  }
						  }
					  }
				  }
			  }
		  },
		  "m3":{
			  "key": "m3",
			  "name": "Default Manifest for Manifest First",
			  "content": {
				  "name": "samples.manifestfirst.customer.Component",
				  "sap.app": {
					  "id": "samples.manifestfirst.customer",
					  "applicationVersion": {
						  "version": "1.0.0"
					  },
					  "text":"Text taken from ManifestFirst"
				  },
				  "sap.ui5": {
					  "rootView": "samples.manifestfirst.customer.view.Main"
				  }
			  }
		  }
	  },
	  "selectedManifestKey": "m3",
	  "mode": 0,
	  "async": true
  };



  //************* Config UI & LOGIC *******************************************

  var MyController = Controller.extend("MyController", {
	  onLoadComponent() {
		  if (oComp && BaseObject.isObjectA(oComp, "sap.ui.core.Component")) {
			  oComp.destroy();
			  oCompCont.destroy();
		  }
		  initComponents();
	  },
	  selectChange(oEvent) {
		  selectManifest(oEvent.getSource().getSelectedKey());
	  }
  });

  // View Creation
  var oManifestModel = new JSONModel(mModel);
  var oMainView = new sap.ui.xmlview({
	  controller: new MyController(),
	  viewContent: jQuery("#viewSource").html()
  });
  oMainView.setModel(oManifestModel);
  oMainView.placeAt("Area");

  // Add Code Style to Coding Areas
  oMainView.byId("ManifestArea").addStyleClass("CodingArea");
  oMainView.byId("CodeArea").addStyleClass("CodingArea");

  oMainView.byId("InputLayoutForm");

  //***************************************************************************
  var oComp;
  var oCompCont;
  var oServer;
  var oUrls = {};

  function initFakeServer(sUrl) {
	  // use the fake server to load manifest from the model above
	  oServer = sinon.fakeServer.create();

	  oServer.xhr.useFilters = sUrl == undefined ? false : true;

	  if (sUrl == undefined) {
		  oServer.xhr.restore();
	  }

	  oUrls[sUrl] = true;
	  oServer.xhr.addFilter(function(method, url) {
		  return oUrls[url] == true ? false : true;
	  });

	  oServer.autoRespond = sUrl == undefined ? false : true;


	  oServer.respondWith("GET", sUrl, //./samples/manifestfirst/customer/manifest.json
		  [
			  200,
			  {
				  "Content-Type": "application/json"
			  },
			  oMainView.byId("ManifestArea").getValue()
		  ]
	  );
  }

  function initComponents() {

	  var manifirst = true;

	  var iMode = oManifestModel.getProperty("/mode");
	  switch (iMode) {
		  case 0:
			  initFakeServer();
			  manifirst = true;
			  break;
		  case 1:
			  initFakeServer("./samples/manifestfirst/customer/manifest.json");
			  manifirst = true;
			  break;
		  case 2:
			  initFakeServer("anylocation/manifest.json");
			  manifirst = false;
			  break;
		  default:
			  manifirst = false;
	  }

	  var oConfig = {
		  manifestUrl: manifirst ? undefined : "anylocation/manifest.json",
		  async: mModel.async,
		  manifestFirst: manifirst ? true : undefined,
		  name: manifirst ? "samples.manifestfirst.customer" : undefined
	  };

	  // Show component config on UI
	  oMainView.byId("CodeArea").setValue(JSON.stringify(jQuery.extend(true, {}, oConfig), null, 2));

	  oComp = sap.ui.component(oConfig);

	  if (oComp instanceof Promise) {
		  oComp.then(function(oComponent){
			  placeComponent(oComponent);
			  oComp = oComponent;
		  },
		  function(err){
			  throw Error(err);
		  });
	  } else {
		  placeComponent(oComp);
	  }
  }

  function placeComponent(oComponentForPlacement) {
	  oCompCont = new ComponentContainer({
			  component: oComponentForPlacement
		  });
	  oMainView.byId("ResultPanel").addContent(oCompCont);
  }

  //***************************************************************************

  function selectManifest(sManifestId) {
	  var oManifest = mModel.manifests[sManifestId].content;
	  var sManifest = JSON.stringify(oManifest, null, 2);
	  oMainView.byId("ManifestArea").setValue(sManifest);
  }
  selectManifest(mModel.selectedManifestKey);


  //***************************************************************************
});