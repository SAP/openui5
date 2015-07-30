/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/commons/TextView', 'sap/ui/commons/Tree', 'sap/ui/commons/TreeNode', 'sap/ui/core/UIComponent', 'sap/ui/layout/VerticalLayout'],
	function(jQuery, TextView, Tree, TreeNode, UIComponent, VerticalLayout) {
	"use strict";


	// new Component
	var Component = UIComponent.extend("samples.components.config.Component", {

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
	Component.prototype.createContent = function() {

		var oLayout = new VerticalLayout();
		oLayout.addContent(new TextView({
			text: "samples.components.config.sap.Component",
			design: "H3"
		}));
		oLayout.addContent(new Tree(this.createId("tree"), {
			title: "Configuration"
		}));
		this.createTreeNodes();
		return oLayout;
	
	};

	Component.prototype.createTreeNodes = function() {
	
		function createChildren(oParentNode, oConfig) {
			jQuery.each(oConfig, function(sKey, oValue) {
				var bIsObject = typeof oValue === "object";
				var oNode = new TreeNode({
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


	return Component;

});
