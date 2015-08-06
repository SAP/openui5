sap.ui.define(['sap/m/MessageToast', 'sap/ui/core/mvc/Controller','sap/ui/model/json/JSONModel', 'jquery.sap.global', 'jquery.sap.script'],
	function(MessageToast, Controller, JSONModel, jQuery/*, jQuerySapScript*/) {
	"use strict";

	var PageController = Controller.extend("sap.ui.core.sample.DataState.Page", {
		
		addRefreshDataStateMethod : function (oControl) {
			//experimental override of existing control
			var that = this;
			oControl.refreshDataState = function(sName,oDataState) {
				if (sName === "value") {
					that.applyDataStateChanged(oDataState); //visualize the data state changes on value
					//handle data state updated here
					this.propagateMessages(sName, oDataState.getMessages());
				}
			};
		},
		onInit: function (oEvent) {
			this.addHighlightStyle();
			
			this.oSampleDataModel = new SimulatedServerModel();
			
//			this.oSampleDataModel.attachPropertyChangeDelayed(this.onPropertyChangeDelayed,this);
//			this.oSampleDataModel.attachLaunderingChange(this.onLaunderingChange,this);
//			this.oSampleDataModel.attachOriginalValueChange(this.onOriginalValueChange, this);
			this.oSampleDataModel.setDelay(0);
			
			this.getView().setModel(this.oSampleDataModel,"SampleData");
			this.oDataStateModel = new JSONModel({});
			
			this.getView().setModel(this.oDataStateModel,"EmailDataState");
			this.getView().bindElement("/");
			//override experimental refreshDataState method on Email Input 
			this.addRefreshDataStateMethod(this.getView().byId("Email"));
			
			var oEmailType = new sap.ui.model.type.String();
			oEmailType.setConstraints({contains:"@"});
			this.getView().byId("Email").bindProperty("value",{path:"SampleData>/Email",type:oEmailType});
			sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);
			
			this.onReset();
		},
		onPropertyChangeDelayed : function() {
			this.applyStateMessage("(data send....)");
		},
		onLaunderingChange : function() {
			this.applyStateMessage("(data received... reset laundring)");
		},
		onOriginalValueChange : function() {
			var that = this;
			this.applyStateMessage("(data received... apply original value)");
			setTimeout(
				function() {
					that.applyStateMessage("");
				},1000);
		},
		
		onMsgStripClose : function (oEvt) {
			oEvt.oSource.setVisible(false);
		},
		
		
		onDelay : function (oEvt) {
			var oButton = oEvt.oSource;
			if (this.oSampleDataModel.getDelay()) {
				this.oSampleDataModel.setDelay(0);
				oButton.setType("Default");
				oButton.setText("Client");
				oButton.setTooltip("Simulates a Client Model behavior");
				this.applyStateMessage("");
			} else {
				this.oSampleDataModel.setDelay(1000);
				oButton.setType("Emphasized");
				oButton.setText("Server");
				oButton.setTooltip("Simulates a Server Model behavior");
				this.applyStateMessage("");
			}
		},
		onValidate : function (oEvt) {
			this.oSampleDataModel.setMessages({});
			var oButton = oEvt.oSource;
			oButton.setType("Accept");
			var that = this;
			function applyMessage() {
				if (that.oSampleDataModel.getProperty("/Email").indexOf("@sap.com")===-1) {
					that.oSampleDataModel.setMessages({"/Email":[new sap.ui.core.message.Message({message:"Mail Address outside company",type:"Warning"})]});
				} else {
					that.oSampleDataModel.setMessages({"/Email":[new sap.ui.core.message.Message({message:"Mail Address within company",type:"Success"})]});
				}
			};
			if (this.oSampleDataModel.getDelay()) {
				this.oSampleDataModel.submit("/Email");
				setTimeout(function() {
					applyMessage();
					oButton.setType("Default");
				},this.oSampleDataModel.getDelay());
			} else {
				oButton.setType("Default");
				applyMessage();
			}
		},
		onReset : function (oEvt) {
			this.oSampleDataModel.setMessages({});
			this.oSampleDataModel.setData({
				"Email": "neill.jackson@sample.com"
			});		
		},
		onSubmit : function (oEvt) {
			var oButton = oEvt.oSource;
			oButton.setType("Accept");
			this.oSampleDataModel.setMessages({"/Email":[]});
			this.oSampleDataModel.submit("/Email");
			if (this.oSampleDataModel.getDelay()) {
				setTimeout(function() {
					oButton.setType("Default");
				},this.oSampleDataModel.getDelay()*2);
			} else {
				oButton.setType("Default");
			}
		},
		onRequest : function (oEvt) {
			var oButton = oEvt.oSource,
				that = this
			oButton.setType("Accept");
			this.oSampleDataModel.setMessages({});
			if (this.oSampleDataModel.getDelay()) {
				var that = this;
				this.applyStateMessage("(data send....)");
				this.oSampleDataModel.setLaundering("/Email",true);
				this.oSampleDataModel.refresh();
				setTimeout(function(){
					that.applyStateMessage("(data received... apply original value)");
					that.oSampleDataModel.setLaundering("/Email",false);
					that.oSampleDataModel.refresh();
					setTimeout(
							function() {
								oButton.setType("Default");
								that.applyStateMessage("");
							},1000);
				},this.oSampleDataModel.getDelay());
				
				setTimeout(function(){
					
					that.oSampleDataModel.setData({
						"Email": "akte@akte.akte"
					});	
				},this.oSampleDataModel.getDelay());
			} else {
				oButton.setType("Default");
				this.oSampleDataModel.setData({
					"Email": "akte@akte.akte"
				});
			}
		},
		applyStateMessage : function(sState) {
			var oMessage = this.getView().byId("StateMessage");
			if (!this.oSampleDataModel.getDelay()) {
				oMessage.setText("Currently Simulating a Client Model (no laundering handling, limited dirty handling)");
				oMessage.setTooltip("Client Models have no laundering or dirty state handling as they apply changed data directly to the model and do not wait for server responses.");
			} else {
				oMessage.setText("Currently Simulating a Server Model " + sState);
				oMessage.setTooltip("Server Models can have laundering or dirty state handling.");
			}
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
			var aDataStates = ["invalidValue", "value","internalValue","originalValue","originalInternalValue","laundering","dirty"];
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
				if (!applyMessages(n)) {
					if (n in oChanges) {
						aChangedProperties.push(n);
						this.oDataStateModel.setProperty("/" + n,jQuery.extend({},oChanges[n]));
					} else {
						//clear old value
						this.oDataStateModel.setProperty("/" + n + "/oldValue",null);
					}
				}
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
	
	//Create a simulated server model for a JSON Model
	var SimulatedServerModel = JSONModel.extend("SimulatedServerModel", /** @lends sap.ui.model.json.JSONModel.prototype */ {
		constructor : function(oData) {
			JSONModel.apply(this, arguments);
			this.iDelay = 0;
			this.mLaunderingData = {};
			this.mOriginalData = {};
		}
	});
	//allow a delay
	SimulatedServerModel.prototype.setDelay = function(iDelay) {
		this.iDelay = iDelay;
	}
	SimulatedServerModel.prototype.getDelay = function() {
		return this.iDelay;
	}
	
	//override set property to allow delay
	SimulatedServerModel.prototype.setProperty = function(sPath, sValue, oContext) {
		if (this.iDelay) {
			//store the original value of the model
			this.setOriginalValue(sPath, this.getProperty(sPath, oContext), oContext);
			this.firePropertyChangeDelayed();
		}
		this.refresh();
		sap.ui.model.json.JSONModel.prototype.setProperty.call(this, sPath, sValue, oContext);
	}
	SimulatedServerModel.prototype.submit = function(sPath, oContext) {
		if (this.getOriginalProperty(sPath, oContext) === this.getProperty(sPath, oContext)) {
			//do nothing as the value is not dirty
			return;
		}
		if (this.iDelay) {
			var that = this;
			this.setLaundering(sPath, true, oContext);
			setTimeout(function(){
				//delete laundering after delay
				that.setLaundering(sPath, false, oContext);
				that.fireLaunderingChange();
				that.refresh();
			},this.iDelay);
			setTimeout(function(){
				that.resetOriginalValue(sPath, oContext);
				that.fireOriginalValueChange();
				that.refresh();
			},this.iDelay + this.iDelay);
		};
		this.refresh();
	};
	//simulate the original property
	SimulatedServerModel.prototype.getOriginalProperty = function(sPath, oContext) {
		var sResolved = this.resolve(sPath, oContext);
		if (this.mOriginalData && (sResolved in this.mOriginalData)) {
			return this.mOriginalData[sResolved];
		}
		return this.getProperty(sPath, oContext);
	};
	
	//simulate the laundering state
	SimulatedServerModel.prototype.isLaundering = function(sPath, oContext) {
		var sResolved = this.resolve(sPath, oContext);
		if (this.mLaunderingData && (sResolved in this.mLaunderingData)) {
			return true;
		}
		return false;
	};
	//reset the original value
	SimulatedServerModel.prototype.resetOriginalValue = function(sPath, oContext) {
		var sResolved = this.resolve(sPath, oContext);
		delete this.mOriginalData[sResolved];
	};
	
	//set the original value
	SimulatedServerModel.prototype.setOriginalValue = function(sPath, oValue, oContext) {
		var sResolved = this.resolve(sPath, oContext);
		if (!this.mOriginalData[sResolved]) {
			this.mOriginalData[sResolved] = oValue;
		}
	};
	//set the laundering state
	SimulatedServerModel.prototype.setLaundering = function(sPath, bValue, oContext) {
		var sResolved = this.resolve(sPath, oContext);
		if (!bValue && this.mLaunderingData[sResolved]) {
			delete this.mLaunderingData[sResolved];
		} else {
			this.mLaunderingData[sResolved] = bValue;
		}
	};
	SimulatedServerModel.prototype.attachPropertyChangeDelayed = function(func,object) {
		this.attachEvent("PropertyChangeDelayed",func,object);
	}
	SimulatedServerModel.prototype.attachLaunderingChange = function(func,object) {
		this.attachEvent("LaunderingChange",func,object);
	};
	SimulatedServerModel.prototype.attachOriginalValueChange = function(func,object) {
		this.attachEvent("OriginalValueChange",func,object);
	};
	SimulatedServerModel.prototype.firePropertyChangeDelayed = function() {
		this.fireEvent("PropertyChangeDelayed");
	}
	SimulatedServerModel.prototype.fireLaunderingChange = function() {
		this.fireEvent("LaunderingChange");
	};
	SimulatedServerModel.prototype.fireOriginalValueChange = function() {
		this.fireEvent("OriginalValueChange");
	};
	
return PageController;

});

