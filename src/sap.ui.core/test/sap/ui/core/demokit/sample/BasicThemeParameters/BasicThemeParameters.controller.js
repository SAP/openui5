sap.ui.controller("sap.ui.core.sample.BasicThemeParameters.BasicThemeParameters", {
	
// #####################################################
//
// Entire controller code is only for sample display
// 
// #####################################################
	
	onInit: function(){
		
		this.oModel = null;
		
		// needed for reload of sample on view change
		this.getView().attachAfterRendering(function(){
			this.beforeShow();
		}, this);
		
		sap.ui.getCore().attachThemeChanged(this._reloadModel, this);
		this._reloadModel();
	},
	
	// style and rename sample display
	beforeShow: function(evt){
		var $SampleElems = jQuery('.ParamSample');
		$SampleElems.each(function(i,e){
			e.style.background = e.innerHTML;
			e.style.color = e.innerHTML;
			e.title = e.innerHTML;
		});
	},
	
	paramFormatter: function(sValue){
		return "@"+sValue;
	},
	
	_reloadModel: function(oEvent){
		var sPath = jQuery.sap.getModulePath("sap.ui.core.sample.BasicThemeParameters", "/parameters.json");
		this.oModel = new sap.ui.model.json.JSONModel(sPath);
		this.oModel.attachRequestCompleted(function(){
			var oDat = this.oModel.getData().params;
			for (var i in oDat){
				this.oModel.setProperty("/params/" + i + "/value", sap.ui.core.theming.Parameters.get(oDat[i].name));
			}
			// don`t use theme parameters in models or bind them to your view!!
			// this is only used here for sample display and should not be implemented in productive apps
			this.getView().setModel(this.oModel);
			jQuery.sap.delayedCall(0, this, function(){
				this.beforeShow();
			});
		},this);
	}
});