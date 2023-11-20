sap.ui.define(["sap/ui/Device", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/model/json/JSONModel", "./BaseController"], function (sap_ui_Device, Filter, FilterOperator, JSONModel, __BaseController) {
  "use strict";
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }

  var browser = sap_ui_Device["browser"];

  var BaseController = _interopRequireDefault(__BaseController);

  /**
   * @namespace sap.m.sample.TsTodos.webapp.controller
   */
  var App = BaseController.extend("sap.m.sample.TsTodos.webapp.controller.App", {
    onInit: function _onInit() {
      this.searchFilters = [];
      this.tabFilters = [];
      this.setModel(new JSONModel({
        isMobile: browser.mobile,
        filterText: undefined
      }), "view");
    },
    addTodo: function _addTodo() {
      var model = this.getModel();
      var todos = model.getProperty("/todos").map(function (todo) {
        return Object.assign({}, todo);
      });
      todos.push({
        title: model.getProperty("/newTodo"),
        completed: false
      });
      model.setProperty("/todos", todos);
      model.setProperty("/newTodo", "");
    },
    clearCompleted: function _clearCompleted() {
      var model = this.getModel();
      var todos = model.getProperty("/todos").map(function (todo) {
        return Object.assign({}, todo);
      });
      var i = todos.length;

      while (i--) {
        var todo = todos[i];

        if (todo.completed) {
          todos.splice(i, 1);
        }
      }

      model.setProperty("/todos", todos);
    },
    updateItemsLeftCount: function _updateItemsLeftCount() {
      var model = this.getModel();
      var todos = model.getProperty("/todos") || [];
      var itemsLeft = todos.filter(function (todo) {
        return !todo.completed;
      }).length;
      model.setProperty("/itemsLeftCount", itemsLeft);
    },
    onSearch: function _onSearch(event) {
      var model = this.getModel();
      var input = event.getSource(); // First reset current filters

      this.searchFilters = []; // add filter for search

      this.searchQuery = input.getValue();

      if (this.searchQuery && this.searchQuery.length > 0) {
        model.setProperty("/itemsRemovable", false);
        var filter = new Filter("title", FilterOperator.Contains, this.searchQuery);
        this.searchFilters.push(filter);
      } else {
        model.setProperty("/itemsRemovable", true);
      }

      this._applyListFilters();
    },
    onFilter: function _onFilter(event) {
      // First reset current filters
      this.tabFilters = []; // add filter for search

      this.filterKey = event.getParameter("item").getKey(); // eslint-disable-line default-case

      switch (this.filterKey) {
        case "active":
          this.tabFilters.push(new Filter("completed", FilterOperator.EQ, false));
          break;

        case "completed":
          this.tabFilters.push(new Filter("completed", FilterOperator.EQ, true));
          break;

        case "all":
        default: // Don't use any filter

      }

      this._applyListFilters();
    },
    _applyListFilters: function _applyListFilters() {
      var list = this.byId("todoList");
      var binding = list.getBinding("items");
      binding.filter(this.searchFilters.concat(this.tabFilters), "todos");
      var i18nKey;

      if (this.filterKey && this.filterKey !== "all") {
        if (this.filterKey === "active") {
          i18nKey = "ACTIVE_ITEMS";
        } else {
          // completed items: filterKey = "completed"
          i18nKey = "COMPLETED_ITEMS";
        }

        if (this.searchQuery) {
          i18nKey += "_CONTAINING";
        }
      } else if (this.searchQuery) {
        i18nKey = "ITEMS_CONTAINING";
      }

      var filterText;

      if (i18nKey) {
        var resourceModel = this.getView().getModel("i18n");
        var resourceBundle = resourceModel.getResourceBundle();
        filterText = resourceBundle.getText(i18nKey, [this.searchQuery]);
      }

      this.getModel("view").setProperty("/filterText", filterText);
    }
  });
  return App;
});