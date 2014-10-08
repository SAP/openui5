sap.ui.jsview("samples.components.ext.sap.Sub4", {

	getControllerName : function(){
		return "samples.components.ext.sap.Sub4";
	},
	createContent : function(oController) {
		var that = this;
		var ext1, ext2, ext3, ext4, ext5;
		var fnCreateDefaultContent = function(){
			return new sap.ui.commons.TextView(that.createId("defaultContentTextView"), {text: "Extension point 1: Default Content"});
		};
		var ext1 = sap.ui.extensionpoint(this, "extension41", fnCreateDefaultContent);
		var ext2 = new sap.ui.layout.VerticalLayout({
			content: [
			          new sap.ui.commons.Button({text: "I am preceding the extension point"}),
			          sap.ui.extensionpoint(this, "extension42" /*, has no default content*/),
			          new sap.ui.commons.Button({text: "I am following the extension point"})
			         ]
		});
		var ext3 = new sap.ui.layout.VerticalLayout();
		sap.ui.extensionpoint(this, "extension43", null,  ext3, "content");
		
		var fnCreateDefaultContent2 = function(){
			return [
			        new sap.ui.commons.TextView(that.createId("iShouldBeDestroyed1"), {text: "Extension point 44: Default Content"}),
			        new sap.ui.commons.TextView(that.createId("iShouldBeDestroyed2"), {text: "Extension point 44: Second Default Content"})
			        ];
		}
		var ext4 = sap.ui.extensionpoint(this, "extension45", fnCreateDefaultContent2);

		var fnCreateDefaultContent3 = function(){
			return [new sap.ui.commons.TextView(that.createId("defaultContentTextView2"), {text: "Extension point 667: Default Content"}),
			 new sap.ui.commons.TextView(that.createId("defaultContentTextView3"), {text: "Extension point 667: Second Default Content"})
			];
		};
		var ext5 = sap.ui.extensionpoint(this, "extension667", fnCreateDefaultContent3);

		var oLayout = new sap.ui.layout.VerticalLayout("Layout1", {
			content: [
			           new sap.ui.commons.TextView({text: "SAP View 'Sub4' - the text after this one is hidden by customizing: "}),
			           new sap.ui.commons.TextView("customizableText1", {text: "This text is made invisible by customization"}),
			           ext1, 
			           ext2, 
			           ext3,
			           ext4,
			           ext5
			          ]
		});

		return oLayout;
	}
});
