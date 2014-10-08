/*Factory for a unified Options Page on all testpages which uses the Shell*/

/* eslint-disable no-unused-vars */
/* This file is only used to declare the function */

function getShellOptionsPanel(oShell, aAdditionalContent, bVertical){
	var c = sap.ui.commons; /* shorthand */
	var aContent = [];
	
	function _getHeaderItems(){
		var aItems = [];
		for (var key in sap.ui.ux3.ShellHeaderType) {
			aItems.push({text: key});
		}
		return aItems;
	}

	function _getDesignItems(){
		var aItems = [];
		for (var key in sap.ui.ux3.ShellDesignType) {
			aItems.push({text: key});
		}
		return aItems;
	}
	
	function addContent(aNewContent){
		aContent.push(bVertical ? new c.layout.VerticalLayout({content: aNewContent}) : new c.layout.HorizontalLayout({content: aNewContent}));
	}
	
	function getLabelledControl(sLabel, oControl){
		return new c.layout.HorizontalLayout({
			content: [
					new c.Label({
						text: sLabel + ":",
						width: "95px"
					}),
					oControl
				]
			});
	}
	
	addContent([
		new c.Button({
			text: "Show/Hide Tools",
			press: function(){
				oShell.setShowTools(!oShell.getShowTools());
		}}),
		new c.Button({
			text: "Show/Hide Pane",
			press: function(){
				oShell.setShowPane(!oShell.getShowPane());
		}}),
		new c.Button({
			text: "Add Notification Message",
			press: function(){
				var oNotifier = oShell.getNotificationBar().getMessageNotifier();
				oNotifier.addMessage(new sap.ui.core.Message({
					text : "Hello",
					timestamp : (new Date()).toUTCString()
				}));
		}}),
		new c.Button({
			text: "Remove Notification Message",
			press: function(){
				var oNotifier = oShell.getNotificationBar().getMessageNotifier();
				if (oNotifier.getMessages().length > 0) {
					oNotifier.getMessages()[0].destroy();
				}
		}}),
		new c.ToggleButton({
			text: "Toggle Full Height",
			pressed: oShell.getFullHeightContent(),
			press: function(){
				oShell.setFullHeightContent(!oShell.getFullHeightContent());
		}}),
		new c.ToggleButton({
			text: "Toggle Content Padding",
			pressed: oShell.getApplyContentPadding(),
			press: function(){
				oShell.setApplyContentPadding(!oShell.getApplyContentPadding());
		}}),
		new c.ToggleButton({
			text: "Toggle Header Access (Overlay)",
			pressed: oShell.getAllowOverlayHeaderAccess(),
			press: function(){
				oShell.setAllowOverlayHeaderAccess(!oShell.getAllowOverlayHeaderAccess());
		}})
	]);
	
	addContent([
				getLabelledControl("Header", new c.DropdownBox({
					value: oShell.getHeaderType(),
					items: _getHeaderItems(),
					change:function(oEvent){
						oShell.setHeaderType(oEvent.getParameter("newValue"));
						// A change of design may lead to a change of sizes, which in turn can lead to
						// bugs in controls that use sizes to position elements (like the NavBar-arow)
						oShell.rerender();
				}})),
				getLabelledControl("Design", new c.DropdownBox({
					value: oShell.getDesignType(),
					items: _getDesignItems(),
					change:function(oEvent){
						oShell.setDesignType(oEvent.getParameter("newValue"));
						// A change of design may lead to a change of sizes, which in turn can lead to
						// bugs in controls that use sizes to position elements (like the NavBar-arow)
						oShell.rerender();
				}}))
	]);
	
	addContent([
				getLabelledControl("Right Offset", new c.TextField({
					value: sap.ui.ux3.Shell._SHELL_OFFSET_RIGHT,
					change:function(oEvent){
						var val = parseFloat(oEvent.getParameter("newValue"));
						oShell.setOffsetRight(val, function() {
							jQuery.sap.log.info("Offset changed");
						}, "outerSideBar");
						this.setValue(sap.ui.ux3.Shell._SHELL_OFFSET_RIGHT);
				}})),
				getLabelledControl("Pane Width", new c.TextField({
					value: oShell.getPaneWidth(),
					change:function(oEvent){
						var val = parseInt(oEvent.getParameter("newValue"), 10);
						oShell.setPaneWidth(val);
						this.setValue(oShell.getPaneWidth());
				}}))
	]);

	
	var oPanel = new c.Panel({
		title : new c.Title({
			text: "Shell Settings"
		}),
		areaDesign: "Transparent"
	});
	oPanel.addStyleClass("TestShellOptionsPanel");
	
	if (aAdditionalContent && aAdditionalContent.length > 0) {
		addContent(aAdditionalContent);
	}
	for (var i = 0; i < aContent.length; i++) {
		oPanel.addContent(aContent[i]);
	}

	return oPanel;
}
/* eslint-enable no-unused-vars */
