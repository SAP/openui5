sap.ui.define(['sap/m/MessageToast', 'sap/ui/core/mvc/Controller', 'sap/ui/core/util/MockServer', 'sap/ui/model/json/JSONModel', 'sap/ui/model/odata/v2/ODataModel', 'jquery.sap.global', 'jquery.sap.script'],
	function(MessageToast, Controller, MockServer, JSONModel, ODataModel, jQuery/*, jQuerySapScript*/) {
	"use strict";

	var PageController = Controller.extend("sap.ui.core.sample.FieldGroupDataState.Page", {
	
		onInit: function (oEvent) {
			var that = this;
			this.mFieldGroups = {};
			this.addHighlightStyle();
			this.sMockServerBaseUri = "test-resources/sap/ui/core/demokit/sample/FieldGroupDataState/mockdata/";
			this.sServiceUri = "/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/";
			
			jQuery.sap.require("sap.ui.core.util.MockServer");

			this.oMockServer = new MockServer({rootUri : this.sServiceUri});
			
			// configure
			MockServer.config({
				autoRespond: true,
				autoRespondAfter: 0
			});
			this.oMockServer.simulate(this.sMockServerBaseUri + "metadata.xml", {
				sMockdataBaseUrl : this.sMockServerBaseUri,
				bGenerateMissingMockData : true
			});
			this.oMockServer.start();
				
			this.oModel = new ODataModel(this.sServiceUri, {defaultBindingMode:"TwoWay", refreshAfterChange:false});
			this.oModel.setChangeBatchGroups({});
			
			this.getView().setModel(this.oModel);
			this.oDataStateModel = new JSONModel({});
			
			this.getView().setModel(this.oDataStateModel,"DataState");
			this.getView().bindElement("/BusinessPartnerSet('0100000001')");
			this.getView().byId("FieldGroupView").setBusy(true);
			//init data state fields
			this.aFields = sap.ui.getCore().byFieldGroupId("BusinessPartner");
			sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);
			for (var i=0;i < this.aFields.length;i++) {
				this.initDataStateChange(this.aFields[i]);
			}
			this.bLoaded = false;
			this.registerFieldGroup("BusinessPartnerAddress",function(b) {
				that.validateAddress(b);
			});
			var f = function() {
				that.validateAddress();
				that.oModel.detachRequestCompleted(f);
				that.bLoaded = true;
				that.getView().byId("FieldGroupView").setBusy(false);
				that.enableMap();
			};
			
			this.oModel.attachRequestCompleted(f);
		},
		registerFieldGroup : function(sFieldGroupId, fnValidate) {
			this.mFieldGroups[sFieldGroupId] = fnValidate;
		},
		unregisterFieldGroup : function(sFieldGroupId) {
			delete this.mFieldGroups[sFieldGroupId];
		},
		validateAddress : function(bValidate) {
			var aAddressFields = sap.ui.getCore().byFieldGroupId("BusinessPartnerAddress"),
				bDirty = false,
				sCurrentFocusControlId = sap.ui.getCore().getCurrentFocusedControlId();
			for (var i=0;i<aAddressFields.length;i++) {
				var oControl = aAddressFields[i],
					oBinding = oControl.getBinding("value") || oControl.getBinding("selectedKey");
				if (oBinding) {
					var oDataState = oBinding.getDataState();
					if (oDataState.isDirty()) {
						bDirty = true;
						break;
					}
				}
			}
			if (!bDirty && (bValidate || this.bValidateGroup)) {
				this.enableMap();
				this.bValidateGroup = bValidate;
			} else {
				if (bValidate) {
					this.bValidateGroup = bValidate;
				}
				this.disableMap();
			}
		},
		initDataStateChange : function(oControl) {
			var oBinding = oControl.getBinding("value") || oControl.getBinding("selectedKey"),
				that = this;
			oControl.setBusyIndicatorDelay(0);
			oBinding.attachDataStateChange(function(oEvent) {
				MockServer.config({
					autoRespond: true,
					autoRespondAfter: 1000
				});
				var sName = oEvent.mParameters['name'],
					oDataState = oEvent.mParameters['dataState'];
				if (that.bLoaded) {
					oControl.setBusy(oDataState.isLaundering() && oDataState.isDirty());
					that.validateAddress();
				}
				that.applyDataStateChanged(oDataState); //visualize the data state changes on value
			});
		},
		onValidateFieldGroup : function(oEvent) {
			var that = this,
				aFieldGroups = oEvent.mParameters["fieldGroupIds"];
			setTimeout(function() {
				for (var i=0;i<aFieldGroups.length;i++) {
					var sFieldGroup = aFieldGroups[i];
					if (that.mFieldGroups[sFieldGroup]) {
						that.mFieldGroups[sFieldGroup](true);
					}
				}
			},100);
		},
		enableMap : function() {
			this.updateMap();
			document.getElementById(this.getView().getId() + '--map').style.opacity = "1";
		},
		disableMap : function() {
			document.getElementById(this.getView().getId() + '--map').style.opacity = "0.3";
		},
		updateMap : function() {
			L.mapbox.accessToken = 'pk.eyJ1IjoibWFkZGVsIiwiYSI6ImNpZjZtdTZkbjAwNmF1ZG0waDI1MjRiczQifQ.pcEy6lfSoeqVOy0y5v28zQ';
			if (!this.oMap) {
				this.oMap = L.mapbox.map(this.getView().getId() + '--map', 'mapbox.streets');
			}
			this.oMap.setView([40, -74.50], 16);
			if (this.oMarker && this.oMap) {
				this.oMap.removeLayer(this.oMarker);
			}
			var that = this,
				sCompany = this.getView().byId("CompanyName").getValue(),
				sSearch = this.getView().byId("Street").getValue().replace("ß","ss") + " " + this.getView().byId("Building").getValue() + " " + this.getView().byId("City").getValue() +  " " + this.getView().byId("Country").getSelectedItem().getText();
			L.mapbox.geocoder("mapbox.places").query(sSearch, function(a, oObject){
				that.oMarker = L.marker(oObject.latlng, {
				 	title: sCompany,
				    icon: L.mapbox.marker.icon({
				        'marker-color': '#E0AE00',
			            'marker-size': 'large',
			            'marker-symbol': 'star'
		           	}),
		            'url': 'http://en.wikipedia.org/wiki/Washington,_D.C.'
				});
				that.oMarker.addTo(that.oMap);
				that.oMap.panTo(oObject.latlng);
				document.getElementById(that.getView().getId() + '--map').style.opacity = "1";
			});
			
		},
		applyPropertyHighlight : function(aDataStates) {
			var that = this;
			setTimeout(function(){
				for (var i=0;i<aDataStates.length;i++) {
					var oPropText = that.getView().byId("property_" + aDataStates[i] + "_new");
					if (oPropText) {
						oPropText.addStyleClass("highlight").removeStyleClass("diminished");
					}
				}
			},1)
		},
		removePropertyHighlight: function() {
			var aDataStates = ["invalidValue", "value","originalValue","laundering","dirty"];
			for (var i=0;i<aDataStates.length;i++) {
				this.getView().byId("property_" + aDataStates[i] + "_new").removeStyleClass("highlight").addStyleClass("diminished");
			}
		},
		applyDataStateChanged: function(oDataState) {
			this.removePropertyHighlight();
			var aChangedProperties = [],
				that = this,
				oChanges = oDataState.getChanges();
			function applyMessages(sProperty) {
				if (sProperty === "messages" || sProperty == "controlMessages" || sProperty == "modelMessages") {
					var oMessageChange = oChanges[sProperty];
					for (var n in oMessageChange) {
						var aMessages = oMessageChange[n],
							aJSONMessages = [];
						if (aMessages) {
							for (var i = 0; i < aMessages.length;i++) {
								aJSONMessages.push({
									text: aMessages[i].getMessage(),
									type: aMessages[i].getType()
								});
							}
						}
						if (!that.oDataStateModel.getProperty("/" + sProperty)) {
							that.oDataStateModel.setProperty("/" + sProperty,{});
						}
						that.oDataStateModel.setProperty("/" + sProperty + "/" + n, aJSONMessages);
					}
					return true;
				} 
			};
			for (var n in oDataState.mProperties) {
					if (n in oChanges) {
						aChangedProperties.push(n);
						this.oDataStateModel.setProperty("/" + n,jQuery.extend({},oChanges[n]));
					} else {
						//clear old value
						//this.oDataStateModel.setProperty("/" + n + "/oldValue",null);
					}
			}
			if (oChanges['dirty']) {
				this.oDataStateModel.setProperty("/dirty",jQuery.extend({},oChanges['dirty']));
			}
			
			this.applyPropertyHighlight(aChangedProperties);
		},
		addHighlightStyle: function() {
			var oStyle = document.createElement("STYLE");
			oStyle.innerText = "@keyframes animationFrames{ 0% { background-color: #B664B9; } 100% { background-color: #F9F8F6;} }.diminished {color:#999 !important; background-color: #FFF; } .highlight { color:#B664B9!important; background-color:#FFF!important; animation: animationFrames ease-out 500ms;}";
			oStyle.setAttribute("type","text/css");
			document.getElementsByTagName("HEAD")[0].appendChild(oStyle);
		}
	});
	
return PageController;

});

