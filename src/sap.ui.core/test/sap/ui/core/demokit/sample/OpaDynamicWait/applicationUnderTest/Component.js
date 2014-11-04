jQuery.sap.declare("appUnderTest.Component");

sap.ui.core.UIComponent.extend("appUnderTest.Component", {

	init : function() {
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
		
		var oData = {
	    		root:{
	    			name: "root",
	    			0: {
	    				name: "item1",
	    				0: {
	    					name: "subitem1",
	    					0: {
	    						name: "subsubitem1"
	    					},
	    					1: {
	    						name: "subsubitem2"
	    					}
	    				},
	    				1: {
	    					name: "subitem2",
	    					0: {
	    						name: "subsubitem3"
	    					}
	    				}
	    				
	    			},
	    			1:{
	    				name: "item2",
	    				0: {
	    					name: "subitem3"
	    				}
	    			}
	    			
	    		}
	    };
		var oModel = new sap.ui.model.json.JSONModel(oData);
		this.setModel(oModel);
	},
	
	createContent : function () {
		return sap.ui.view({
			viewName : "view.Main",
			type : "XML"
		});
	}

});