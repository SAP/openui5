sap.ui.define([
		'sap/m/MessageBox',
		'sap/ui/core/mvc/Controller'
	], function(MessageBox, Controller) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.MessageBoxInfo.C", {

		showTextInfo: function(oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.show("Information", {
				icon: MessageBox.Icon.INFORMATION,
				title: "Information",
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				id: "messageBoxId1",
				defaultAction: MessageBox.Action.NO,
				details: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?",
				styleClass: bCompact? "sapUiSizeCompact" : "",
				contentWidth: "100px"
			});
		},

		showFormattedTextInfo: function(oEvent) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.show("Information", {
				icon: MessageBox.Icon.INFORMATION,
				title: "Information",
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				id: "messageBoxId2",
				defaultAction: MessageBox.Action.NO,
				details: '<h1>Header 1</h1>' +
						'<h3>Header 3</h3>\n' +
						'<p><a href="//www.sap.com" target="_top" style="color:green; font-weight:600;">link to sap.com</a> - opens in a new window.' +
						'<ul>' +
						'<li>&lt;ul&gt; - &lt;li&gt;</li>' +
						'<li>Span <span class="foo">span class="foo"</span> &bull; <strong>strong</strong> &bull; <em>em</em> &bull; <u>u</u></li>' +
						'<li style="background-color: rgb(255, 255, 255);">white background</li>' +
						'</ul>' +
						'<pre>pre: abc\n        def\n           ghi</pre>\n' +
						'<dl><dt>dl - dt - de:</dt><dd>Definition list <code>&lt;dl&gt;</code> of terms <code>&lt;dt&gt;</code> and descriptions <code>&lt;dd&gt;</code></dd>' +
						'<br><cite>Cite: a reference to a source</cite>',
				styleClass: bCompact? "sapUiSizeCompact" : "",
				contentWidth: "100px"
			});
		},

		showJSONInfo: function(oEvent) {
			var JSON = {
							glossary: {
								title: 'example glossary',
							}
						};
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			sap.m.MessageBox.show("Error message", {
				icon: sap.m.MessageBox.Icon.ERROR,
				title: "Error",
				actions: [sap.m.MessageBox.Action.OK],
				id: "messageBoxId1",
				defaultAction: sap.m.MessageBox.Action.OK,
				details: JSON,
				styleClass: bCompact? "sapUiSizeCompact" : "",
				contentWidth: "100px"

			});
		}

	});


	return CController;

});
