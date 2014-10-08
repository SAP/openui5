/*!
 * ${copyright}
 */
jQuery.sap.declare("samples.components.config.Component");
jQuery.sap.require("sap.ui.core.UIComponent");

// new Component
sap.ui.core.UIComponent.extend("samples.components.config.Component", {

	metadata : {
		version : "1.0",
		config: {
			
			"samples.components.config.Component.config1": {
				
				"Key1-1": "Value1-1",
				"Key1-2": "value1-2"
				
			},
			
			"samples.components.config.Component.config2": {
				
				"Key3-1": "Value3-1",
				"Key3-2": "Value3-2"
				
			}
			
		}
	}
});

// create the component content, set the models
samples.components.config.Component.prototype.createContent = function() {

	var oLayout = new sap.ui.layout.VerticalLayout();
	oLayout.addContent(new sap.ui.commons.TextView({
		text: "samples.components.config.sap.Component",
		design: "H3"
	}));
	oLayout.addContent(new sap.ui.commons.Tree(this.createId("tree"), {
		title: "Configuration"
	}));
	this.createTreeNodes();
	return oLayout;
	
};

samples.components.config.Component.prototype.createTreeNodes = function() {
	
	function createChildren(oParentNode, oConfig) {
		jQuery.each(oConfig, function(sKey, oValue) {
			var bIsObject = typeof oValue === "object";
			var oNode = new sap.ui.commons.TreeNode({
				text: sKey + (bIsObject ? "" : "=" + oValue),
				expanded: false
			});
			if (bIsObject) {
				createChildren(oNode, oValue);
			}
			oParentNode.addNode(oNode);
		});
	}
	
	var oTree = this.byId("tree");
	oTree.destroyNodes();
	createChildren(oTree, this.getMetadata().getConfig());

};
