sap.ui.define([
  "sap/m/MessageStrip",
  "sap/m/Link",
  "sap/m/Page",
  "sap/m/App"
], function(MessageStrip, Link, Page, App) {
  "use strict";
  // Note: the HTML page 'MessageStrip.html' loads this module via data-sap-ui-on-init

  // This page is used for visualtesting

  var oMCInformation = new MessageStrip("mcontainer1" , {
	  type: "Information",
	  text: "You have configured Windows Internet Explorer to block unsigned ActiveX controls.",
	  link: new Link({
		  text: "Learn more",
		  href: "http://www.sap.com/",
		  target: "_blank"
	  })
  });

  var oMCSuccess = new MessageStrip("mcontainer2",{
	  type: "Success",
	  showIcon : true,
	  text: "We have received your enquiry and will respond to you within 24 hours." +
		  "For urgent enquiries please call us on one of the telephone numbers below.",
	  link: new Link({
		  text: "Learn more",
		  href: "http://www.sap.com/",
		  target: "_blank"
	  })
  });

  var oMCWarningExpand = new MessageStrip("mcontainer3",{
	  type: "Warning",
	  showIcon : true,
	  text: "This page might not behave as expected because Windows Internet Explorer " +
		  "isn't configured to load unsigned ActiveX controls. Allow this page to install an unsigned " +
		  "ActiveX Control? Doing so from untrusted sources may harm your computer." +
		  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas consequat sagittis tortor," +
		  "quis suscipit urna ornare ut. Donec semper auctor turpis"
  });

  var oMCError = new MessageStrip("mcontainer4",{
	  type: "Error",
	  showIcon : true,
	  text: "This page cannot load an unsigned ActiveX control.",
	  link: new Link({
		  text: "Learn more",
		  href: "http://www.sap.com/",
		  target: "_blank"
	  })
  });

  var oMCInformationIC = new MessageStrip("mcontainer5",{
	  type: "Information",
	  showIcon: true,
	  showCloseButton: true,
	  text: "You have configured Windows Internet Explorer to block unsigned ActiveX controls.",
	  link: new Link({
		  text: "SAP CE",
		  href: "http://www.sap.com/",
		  target: "_blank"
	  })
  });

  var oMCInformationLong = new MessageStrip("mcontainer6",{
	  type: "Information",
	  showCloseButton: true,
	  text: "Very long text: Lorem ipsum dolor sit amet, consectetur adipisicing elit." +
	  "Ex libero maxime quasi qui veniam? Alias ducimus laborum porro quidem quo velit?" +
	  "Cumque est in iusto, magnam minus quis tempora tenetur? Adipisci aliquid atque doloribus " +
	  "error expedita hic necessitatibus nesciunt nobis non odit quas, quos ratione reiciendis repellendus " +
	  "sapiente suscipit tempore voluptas. Aut cupiditate, est iusto provident saepe voluptatum." +
	  "A autem excepturi fugit iure reprehenderit. Aut autem dolor eaque esse exercitationem, expedita facilis," +
	  "fugiat incidunt iure iusto magni minima mollitia odit perferendis possimus provident quaerat quo " +
	  "repellendus temporibus ullam unde velit, vero voluptates! A aliquam aspernatur dolorem dolorum fuga " +
	  "harum omnis quos sed totam voluptas. Accusamus alias atque commodi cumque dicta, dignissimos dolore error " +
	  "et facilis impedit in iste maiores nemo neque nobis, odit optio placeat provident quia totam voluptas " +
	  "voluptate voluptates. Architecto blanditiis culpa eveniet expedita harum, iure molestias nam qui sint tenetur!"
  });

  var oMCWarning = new MessageStrip("mcontainer7", {
	  type: "Warning",
	  showIcon : true,
	  text: "This page might not behave as expected because Windows Internet Explorer " +
		  "isn't configured to load unsigned ActiveX controls.Allow this page to install an unsigned " +
		  "ActiveX Control? Doing so from untrusted sources may harm your computer.",
	  link: new Link({
		  text: "Learn more",
		  href: "http://www.sap.com/",
		  target: "_blank"
	  })
  });

  var oMCWarningWithFormattedText = new MessageStrip({
	  type: "Warning",
	  enableFormattedText: true,
	  showIcon: true,
	  text: "<strong>Warning:</strong> This page might not behave as expected because Windows Internet Explorer " +
			  "isn't <em><u>configured to load unsigned</u></em> <a href='http://www.sap.com/' target='_blank'>ActiveX</a> controls.Allow this page to install an unsigned " +
			  "ActiveX Control? <em><strong>Doing so from untrusted sources</strong> may harm your computer.</em>" +
			  "<a href='http://www.sap.com/' target='_blank'>Learn more</a>"
  });

  var oPageNoLayout = new Page("no-layout", {
	  title:"Several MessageStrip controls with no layout",
	  titleLevel: "H1",
	  content: [
		  oMCInformation,
		  oMCSuccess,
		  oMCWarningExpand,
		  oMCError,
		  oMCInformationIC,
		  oMCInformationLong,
		  oMCWarning,
		  oMCWarningWithFormattedText
	  ]
  }).addStyleClass("sapUiContentPadding");

  var oApp = new App("myApp", {
	  initialPage: "no-layout",
	  pages: [oPageNoLayout]
  });

  oApp.placeAt("content");
});