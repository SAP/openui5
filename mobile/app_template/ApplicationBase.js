jQuery.sap.declare("ApplicationBase");
jQuery.sap.require("sap.ui.base.ManagedObject");

(function(window, undefined){
	sap.ui.base.ManagedObject.extend("ApplicationBase", {
		
		metadata : {
			properties : {
				root : "string"
			}
		},
		
		constructor : function(oSettings) {
			
			sap.ui.base.ManagedObject.apply(this,arguments);
			
			// the init function is already called by managed object
			
			if (this.main) {
				jQuery(jQuery.proxy(this.main,this));
			}
			
			if (this.onBeforeExit) {
				jQuery(window).on('beforeunload', jQuery.proxy(this.onBeforeExit, this));
			}
			
			if (this.onExit) {
				jQuery(window).on('unload', jQuery.proxy(this.onExit, this));
			}
			
			if (this.onError) {
				window.onerror = jQuery.proxy(function(sMessage, sFile, iLine) {
					this.onError(sMessage, sFile, iLine);
				}, this);
			}
		}
	});
})(window);