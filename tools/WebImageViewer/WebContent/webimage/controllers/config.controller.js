sap.ui.controller('webimage.controllers.config', {

	onInit: function() {},

	onBeforeRendering: function() {
		utils.storage.loadConfigs();
	},

	addNewPathHandle: function() {
		var data = sap.ui.getCore().getModel().getData();
		if (!data.storeMapping) {
			data.storeMapping = [];
		}
		data.storeMapping.push({
			tokenName: "",
			imageStorePath: ""
		});
		sap.ui.getCore().getModel().updateBindings();
		this.byId('path_table').setSelectedIndex(data.storeMapping.length - 1);
		// this.byId('apply_btn').setEnabled(false);
	},
	verifyName: function(evt) {
		var n = evt.mParameters.newValue;
		var names = sap.ui.getCore().getModel().getData().storeMapping,
			my = evt.oSource.getBindingContext().getObject(),
			ok = true;
		var re = /(^\s+$)|([#$?=+])/;
		if (re.test(n)) {
			ok = false;
		} else {
			$.each(names, function() {
				if (this != my && this.tokenName == n) {
					ok = false;
				}
				return ok;
			});
		}
		if (ok) {
			var data = sap.ui.getCore().getModel().getData();
			data.applyMapping.push(my);
		} else {
			sap.ui.commons.MessageBox.show("Sorry, Token Name validation failed!", sap.ui.commons.MessageBox.Icon.WARNING, "WARN", [sap.ui.commons.MessageBox.Action.OK]);
			evt.oSource.setValue('');
		}
	},
	verifyPath: function(evt) {
		var n = evt.mParameters.newValue;
		var names = sap.ui.getCore().getModel().getData().storeMapping,
			my = evt.oSource.getBindingContext().getObject(),
			ok = true;
		var re = /(^\s+$)|([#$?=+])/;
		if (re.test(n)) {
			ok = false;
		}
		if (ok) {
			var data = sap.ui.getCore().getModel().getData();
			data.applyMapping.push(my);
		} else {
			sap.ui.commons.MessageBox.show("Sorry, Image Store Path validation failed!", sap.ui.commons.MessageBox.Icon.WARNING, "WARN", [sap.ui.commons.MessageBox.Action.OK]);
			evt.oSource.setValue('');
		}
	},
	applyChangeHandle: function() {
		utils.storage.applyStoreConfig(function() {
			utils.storage.loadConfigs();
		});
	},

	discardChangeHandle: function() {
		sap.ui.commons.MessageBox.show("Discard Changes ?", sap.ui.commons.MessageBox.Icon.QUESTION, "DISCARD", [sap.ui.commons.MessageBox.Action.YES, sap.ui.commons.MessageBox.Action.NO], function(r) {
			if (r === "YES") {
				utils.storage.loadConfigs();
			}
		}, sap.ui.commons.MessageBox.Action.YES);
	},

	deletePathHandle: function() {
		var data = sap.ui.getCore().getModel().getData().storeMapping;
		var indices = this.byId('path_table').getSelectedIndices();
		var newData = [];
		$.each(data, function(i) {
			indices.indexOf(i) < 0 && newData.push(this);
		});

		sap.ui.getCore().getModel().getData().storeMapping = newData;
		sap.ui.getCore().getModel().getData().applyMapping = newData.slice();
		delete data;
		sap.ui.getCore().getModel().updateBindings();
		this.byId('path_table').clearSelection();
	}

});