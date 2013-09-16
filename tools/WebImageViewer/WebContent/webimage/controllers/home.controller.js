sap.ui.controller("webimage.controllers.home", {
	onInit: function() {
		this.oShell = this.byId("app_shell_container");
		// event bus navigation implemented
		var bus = sap.ui.getCore().getEventBus();
		bus.subscribe("nav", "to", this.navToHandler, this);

		if (document.location.hash) {
			var hash = document.location.hash.substr(1);
			if (hash == 'config') {
				this.byId('wi_config').setVisible(true);
			}
			bus.publish('nav', 'to', {
				name: hash
			});
		}
		var ctrl = this;
		jQuery(window).bind('hashchange', function() {
			var hash = document.location.hash.substr(1);
			if (hash == 'config') {
				ctrl.byId('wi_config').setVisible(true);
			}
			if (document.location.hash) {
				bus.publish('nav', 'to', {
					name: hash
				});
			}
		});
	},
	navToHandler: function(channeId, eventId, oParams) {
		this._setContentView(oParams.name, oParams.id, oParams.type, oParams.data);
		if (this.getView().byId("wi_" + oParams.name)) {
			this.oShell.setSelectedWorksetItem(this.getView().byId("wi_" + oParams.name).getId());
		}
	},

	onWorkItemSelected: function(evt) {
		// this._setContentView(evt.getParameter("key"));
		utils.storage.refresh();
		document.location.hash = evt.getParameter("key");
	},

	_setContentView: function(sName, sId, sType, oData) {
		if (sName) {
			sId = sId || sName;
			var viewPage = sap.ui.getCore().byId(sId);
			if (!viewPage) {
				viewPage = sap.ui.view({
					id: sId,
					viewName: "webimage.views." + sName,
					type: sType || "XML"
				});
			}
			if (oData) {
				viewPage.data(oData);
			}
			this.oShell.removeAllContent();
			this.oShell.setContent(viewPage);
		}
	},

});