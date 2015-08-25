sap.ui.define(['sap/m/MessageToast', 'sap/ui/core/mvc/Controller', 'sap/ui/core/util/MockServer', 'sap/ui/model/json/JSONModel', 'sap/ui/model/odata/v2/ODataModel', 'jquery.sap.global', 'jquery.sap.script'],
	function(MessageToast, Controller, MockServer, JSONModel, ODataModel, jQuery/*, jQuerySapScript*/) {
	"use strict";

	var PageController = Controller.extend("sap.ui.core.sample.DataStateOData.Page", {
	
		onInit: function (oEvent) {
			var that = this;
			this.addHighlightStyle();
			this.sMockServerBaseUri = "test-resources/sap/ui/core/demokit/sample/DataStateOData/mockdata/";
			this.sServiceUri = "/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/";
			
			jQuery.sap.require("sap.ui.core.util.MockServer");

			this.oMockServer = new MockServer({rootUri : this.sServiceUri});
			// configure
			MockServer.config({
				autoRespond: true,
				autoRespondAfter: 2000
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
			this.getView().bindElement("/ProductSet('HT-1000')");
			
			var oNameType = new sap.ui.model.type.String();
			oNameType.setConstraints({maxlength:15});
			
			this.getView().byId("Name").bindProperty("value",{path:"Name",type:oNameType});
			sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);
			this.getView().byId("Name").getBinding("value").attachDataStateChange(function(oEvent) {
				var sName = oEvent.mParameters['name'];
				var oDataState = oEvent.mParameters['dataState'];
				that.applyDataStateChanged(oDataState); //visualize the data state changes on value
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

