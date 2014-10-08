sap.ui.controller("sap.ui.layout.sample.Splitter.Splitter", {

iResizes : 0,
oSplitter : null,
oOptions : null,

onInit: function () {
},

onAfterRendering : function() {
	this.showLayoutOptions();
},

getSplitter : function() {
	if (!this.oSplitter) {
		this.oSplitter = this.byId("mainSplitter");
		this.oSplitter.attachResize(function(oEvent) {
			this.byId("eventStatus").setText(
				new Date().toLocaleString() + 
				" - Resize # " + (++this.iResizes)
			);
			this.showLayoutOptions();
		}, this);
	}
	
	return this.oSplitter;
},

getOptionsLayout : function() {
	if (!this.oOptions) {
		this.oOptions = this.byId("mainOptions");
	}
	
	return this.oOptions;
},


showLayoutOptions : function() {
	var oOptionsLayout = this.getOptionsLayout();
	var oSplitter = this.getSplitter();
	
	// Remove all Options
	oOptionsLayout.destroyContent();
	
	var aContentAreas = oSplitter.getContentAreas();
	for (var i = 0; i < aContentAreas.length; ++i) {
		var oContentArea = aContentAreas[i];
		var oLD = oContentArea.getLayoutData();
		if (!oLD) {
			oLD = new sap.ui.layout.SplitterLayoutData();
			oContentArea.setLayoutData(oLD);
		}
		
		var oOptions = new sap.ui.layout.HorizontalLayout();
		oOptions.addContent(
			new sap.ui.commons.TextView({ 
				text : "ContentArea #" + (i + 1)
			}).addStyleClass("optionTitle")
		);
		
		oOptions.addContent(new sap.ui.commons.TextView({ text : "Resizable: "}));
		oOptions.addContent(new sap.ui.commons.CheckBox({
			checked : oLD.getResizable(),
			change  : (function(oLayoutData) { return function(oEvent) {
				oLayoutData.setResizable(oEvent.getParameter("checked"));
			};})(oLD)
		}));
		
		oOptions.addContent(new sap.ui.commons.TextView({ text : "Size (CSS): " }));
		oOptions.addContent(new sap.ui.commons.TextField({
			value : oLD.getSize(),
			change  : (function(oLayoutData) { return function(oEvent) {
				oLayoutData.setSize(oEvent.getParameter("newValue"));
			};})(oLD)
		}));
		
		oOptions.addContent(new sap.ui.commons.TextView({ text : "Min-Size: (in px)" }));
		oOptions.addContent(new sap.ui.commons.TextField({
			value : oLD.getMinSize(),
			change  : (function(oLayoutData) { return function(oEvent) {
				oLayoutData.setMinSize(parseInt(oEvent.getParameter("newValue"), 10));
			};})(oLD)
		}));
		
		oOptionsLayout.addContent(oOptions);
	}
},

createExampleContent : function() {
	var oLd = new sap.ui.layout.SplitterLayoutData({
		resizable : true,
		size      : Math.random() > 0.5 ? "auto" : 50 + Math.floor(Math.random() * 300) + "px",
		maxSize   : Math.random() > 0.5 ? "0" : Math.floor(Math.random() * 100) + "px"
	});
	
	var oContent = new sap.ui.commons.Button({
		width: "100%",
		height: "100%",
		text : "Content!",
		layoutData: oLd
	});
	
	return oContent;
},

btnAddContentArea: function() {
	this.getSplitter().addContentArea(this.createExampleContent());
	this.showLayoutOptions();
},

btnRemoveContentArea: function() {
	var oSplitter = this.getSplitter();
	
	var oLastContentArea = oSplitter.getContentAreas().pop();
	oSplitter.removeContentArea(oLastContentArea);
	oLastContentArea.destroy();
	this.showLayoutOptions();
},

btnInvalidateSplitter: function() {
	this.getSplitter().invalidate();
},

btnChangeOrientation: function() {
	var sOr = this.getSplitter().getOrientation();
	this.getSplitter().setOrientation(
		sOr === sap.ui.core.Orientation.Vertical
		? sap.ui.core.Orientation.Horizontal
		: sap.ui.core.Orientation.Vertical
	);
}


});