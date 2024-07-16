sap.ui.define(["sap/ui/core/IconPool", "sap/m/SearchField", "sap/ui/core/Control"], function(IconPool, SearchField, Control) {
	"use strict";

	try {
		sap.ui.getCore().loadLibrary("sap.m");
	} catch (e) {
		undefined/*jQuery*/.sap.log.error("This test page requires the library 'sap.m' which is not available.");
		throw (e);
	}


	window.createTestSearchField = function (sId, fOnSearch){
		var oSF =  new SearchField(sId, {
			search: fOnSearch || function(){},
			width: "100%"
		});
		oSF.addStyleClass("sapUiSizeCompact");
		oSF.addStyleClass("MyTestSearchField");
		return oSF;
	};

	window.sLorem = "Lorem ipsum dolor sit amet, consetetur " +
	"sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et " +
	"dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam " +
	"et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea " +
	"takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit " +
	"amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor " +
	"invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. " +
	"At vero eos et accusam et justo duo dolores et ea rebum. Stet clita " +
	"kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit " +
	"amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed " +
	"diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam " +
	"erat, sed diam voluptua. At vero eos et accusam et justo duo dolores " +
	"et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est " +
	"Lorem ipsum dolor sit amet. Duis autem vel eum iriure dolor in " +
	"hendrerit in vulputate velit esse molestie consequat, vel illum dolore " +
	"eu feugiat nulla facilisis at vero eros et accumsan et iusto odio " +
	"dignissim qui blandit praesent luptatum zzril delenit augue duis " +
	"dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, " +
	"consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt " +
	"ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim " +
	"veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl " +
	"ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in " +
	"hendrerit in vulputate velit esse molestie consequat, vel illum dolore " +
	"eu feugiat nulla facilisis at vero eros et accumsan et iusto odio " +
	"dignissim qui blandit praesent luptatum zzril delenit augue duis " +
	"dolore te feugait nulla facilisi.\n\n Nam liber tempor cum soluta nobis eleifend option congue nihil " +
	"imperdiet doming id quod mazim placerat facer possim assum. Lorem " +
	"ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy " +
	"nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. " +
	"Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper " +
	"suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem " +
	"vel eum iriure dolor in hendrerit in vulputate velit esse molestie " +
	"consequat, vel illum dolore eu feugiat nulla facilisis. At vero eos et " +
	"accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, " +
	"no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum " +
	"dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod " +
	"tempor invidunt ut labore et dolore magna aliquyam erat, sed diam " +
	"voluptua. At vero eos et accusam et justo duo dolores et ea rebum. " +
	"Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum " +
	"dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing " +
	"elitr, At accusam aliquyam diam diam dolore dolores duo eirmod eos " +
	"erat, et nonumy sed tempor et et invidunt justo labore Stet clita ea " +
	"et gubergren, kasd magna no rebum. sanctus sea sed takimata ut vero " +
	"voluptua. est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, " +
	"consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut " +
	"labore et dolore magna aliquyam erat. Consetetur sadipscing elitr, sed " +
	"diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam " +
	"erat, sed diam voluptua. At vero eos et accusam et justo duo dolores " +
	"et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est " +
	"Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur " +
	"sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et " +
	"dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam " +
	"et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea " +
	"takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit " +
	"amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor " +
	"invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.\n\n At vero eos et accusam et justo duo dolores et ea rebum. Stet " +
	"clita kasd gubergren, no sea takimata sanctus. Lorem ipsum dolor sit " +
	"amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor " +
	"invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. " +
	"At vero eos et accusam et justo duo dolores et ea rebum. Stet clita " +
	"kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit " +
	"amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed " +
	"diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam " +
	"erat, sed diam voluptua. At vero eos et accusam et justo duo dolores " +
	"et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est " +
	"Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur " +
	"sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et " +
	"dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam " +
	"et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea " +
	"takimata sanctus est Lorem ipsum dolor sit amet. Duis autem vel eum " +
	"iriure dolor in hendrerit in vulputate velit esse molestie consequat, " +
	"vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan " +
	"et iusto odio dignissim qui blandit praesent luptatum zzril delenit " +
	"augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit " +
	"amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod " +
	"tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim " +
	"ad minim veniam, quis nostrud exerci tation ullamcorper suscipit " +
	"lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum " +
	"iriure dolor in hendrerit in vulputate velit esse molestie consequat, " +
	"vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan " +
	"et iusto odio dignissim qui blandit praesent luptatum zzril delenit " +
	"augue duis dolore te feugait nulla facilisi.\n\n At vero eos et accusam et justo duo dolores et ea rebum. Stet " +
	"clita kasd gubergren, no sea takimata sanctus. Lorem ipsum dolor sit " +
	"amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor " +
	"invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. " +
	"At vero eos et accusam et justo duo dolores et ea rebum. Stet clita " +
	"kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit " +
	"amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed " +
	"diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam " +
	"erat, sed diam voluptua. At vero eos et accusam et justo duo dolores " +
	"et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est " +
	"Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur " +
	"sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et " +
	"dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam " +
	"et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea " +
	"takimata sanctus est Lorem ipsum dolor sit amet. Duis autem vel eum " +
	"iriure dolor in hendrerit in vulputate velit esse molestie consequat, " +
	"vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan " +
	"et iusto odio dignissim qui blandit praesent luptatum zzril delenit " +
	"augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit " +
	"amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod " +
	"tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim " +
	"ad minim veniam, quis nostrud exerci tation ullamcorper suscipit " +
	"lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum " +
	"iriure dolor in hendrerit in vulputate velit esse molestie consequat, " +
	"vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan " +
	"et iusto odio dignissim qui blandit praesent luptatum zzril delenit " +
	"augue duis dolore te feugait nulla facilisi.\n\n At vero eos et accusam et justo duo dolores et ea rebum. Stet " +
	"clita kasd gubergren, no sea takimata sanctus. Lorem ipsum dolor sit " +
	"amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor " +
	"invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. " +
	"At vero eos et accusam et justo duo dolores et ea rebum. Stet clita " +
	"kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit " +
	"amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed " +
	"diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam " +
	"erat, sed diam voluptua. At vero eos et accusam et justo duo dolores " +
	"et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est " +
	"Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur " +
	"sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et " +
	"dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam " +
	"et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea " +
	"takimata sanctus est Lorem ipsum dolor sit amet. Duis autem vel eum " +
	"iriure dolor in hendrerit in vulputate velit esse molestie consequat, " +
	"vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan " +
	"et iusto odio dignissim qui blandit praesent luptatum zzril delenit " +
	"augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit " +
	"amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod " +
	"tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim " +
	"ad minim veniam, quis nostrud exerci tation ullamcorper suscipit " +
	"lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum " +
	"iriure dolor in hendrerit in vulputate velit esse molestie consequat, " +
	"vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan " +
	"et iusto odio dignissim qui blandit praesent luptatum zzril delenit " +
	"augue duis dolore te feugait nulla facilisi.\n\n At vero eos et accusam et justo duo dolores et ea rebum. Stet " +
	"clita kasd gubergren, no sea takimata sanctus. Lorem ipsum dolor sit " +
	"amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor " +
	"invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. " +
	"At vero eos et accusam et justo duo dolores et ea rebum. Stet clita " +
	"kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit " +
	"amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed " +
	"diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam " +
	"erat, sed diam voluptua. At vero eos et accusam et justo duo dolores " +
	"et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est " +
	"Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur " +
	"sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et " +
	"dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam " +
	"et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea " +
	"takimata sanctus est Lorem ipsum dolor sit amet. Duis autem vel eum " +
	"iriure dolor in hendrerit in vulputate velit esse molestie consequat, " +
	"vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan " +
	"et iusto odio dignissim qui blandit praesent luptatum zzril delenit " +
	"augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit " +
	"amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod " +
	"tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim " +
	"ad minim veniam, quis nostrud exerci tation ullamcorper suscipit " +
	"lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum " +
	"iriure dolor in hendrerit in vulputate velit esse molestie consequat, " +
	"vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan " +
	"et iusto odio dignissim qui blandit praesent luptatum zzril delenit " +
	"augue duis dolore te feugait nulla facilisi.\n\n";

	Control.extend("SearchFieldPlaceHolder", {
		metadata : {
			events: {
				"search" : {}
			}
		},

		renderer: function(rm, ctrl){
			rm.write("<div");
			rm.write(">Placeholder for a SearchField Control</div>");
		},

		onclick: function(evt){
			this.fireSearch();
		}
	});

	Control.extend("CurtainContent", {
		metadata : {
			properties: {
				"text" : "string",
				"headerHidden" : "boolean"
			},
			aggregations: {
				"content" : {type : "sap.ui.core.Control", multiple : true}
			}
		},

		renderer: function(rm, ctrl){
			rm.write("<div");
			rm.addClass("CurtainContent");
			rm.write("><header");
			rm.addClass("_sapUiUfdShellSubHdr");
			rm.write(">");
			rm.write("</header><div>");
			var aContent = ctrl.getContent();
			for (var i = 0; i < aContent.length; i++){
				rm.renderControl(aContent[i]);
			}
			rm.write("</div></div>");
		},

		setHeaderHidden: function(bHidden){
			this.setProperty("headerHidden", !!bHidden, true);
			this.$().toggleClass("CurtainContentHeaderHidden", !!bHidden);
		}
	});

	undefined/*jQuery*/(function(){
		undefined/*jQuery*/("head").append("<link type='text/css' rel='stylesheet' href='resources/ShellTestPage.css'>");
	});


	var sLogo = undefined/*jQuery*/.sap.getUriParameters().get("logo");
	if (sLogo){
		sLogo = "images/" + sLogo;
	} else {
		sLogo = undefined/*jQuery*/.sap.getModulePath("sap.ui.core", '/') + "mimes/logo/sap_50x26.png";
	}

	window.sLogo = sLogo;
});