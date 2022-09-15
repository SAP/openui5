import { browser } from "sap/ui/Device";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import JSONModel from "sap/ui/model/json/JSONModel";
import UI5Event from "sap/ui/base/Event";
import BaseController from "./BaseController"
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import ListBinding from "sap/ui/model/ListBinding";
import FilterType from "sap/ui/model/FilterType";
import Input from "sap/m/Input";
import List from "sap/m/List";

type Todo = {
	title: string,
	completed: boolean
}

/**
 * @namespace sap.m.sample.TsTodos.webapp.controller
 */
export default class App extends BaseController {
	searchFilters: Filter[];
	tabFilters: Filter[];
	searchQuery: string;
	filterKey: ("active" | "completed" | "all");

	public onInit(): void {
		this.searchFilters = [];
		this.tabFilters = [];

		this.setModel(new JSONModel({
			isMobile: browser.mobile,
			filterText: undefined
		}), "view");
	}

	/**
	 * Adds a new todo item to the bottom of the list.
	 */
	public addTodo(): void {
		const model = this.getModel();
		const todos: Todo[] = model.getProperty("/todos").map((todo: Todo) => Object.assign({}, todo));

		todos.push({
			title: model.getProperty("/newTodo"),
			completed: false
		});

		model.setProperty("/todos", todos);
		model.setProperty("/newTodo", "");
	}

	/**
	 * Removes all completed items from the todo list.
	 */
	public clearCompleted(): void {
		const model = this.getModel();
		const todos: Todo[] = model.getProperty("/todos").map((todo: Todo) => Object.assign({}, todo));

		let i = todos.length;
		while (i--) {
			const todo = todos[i];
			if (todo.completed) {
				todos.splice(i, 1);
			}
		}

		model.setProperty("/todos", todos);
	}

	/**
	 * Updates the number of items not yet completed
	 */
	public updateItemsLeftCount(): void {
		const model = this.getModel();
		const todos: Todo[] = model.getProperty("/todos") || [];

		const itemsLeft = todos.filter((todo: Todo) => !todo.completed).length;

		model.setProperty("/itemsLeftCount", itemsLeft);
	}

	/**
	 * Trigger search for specific items. The removal of items is disabled as long as the search is used.
	 * @param {UI5Event} event Input changed event
	 */
	public onSearch(event: UI5Event) {
		const model = this.getModel();
		const input = event.getSource() as Input;

		// First reset current filters
		this.searchFilters = [];

		// add filter for search
		this.searchQuery = input.getValue();
		if (this.searchQuery && this.searchQuery.length > 0) {
			model.setProperty("/itemsRemovable", false);
			const filter = new Filter("title", FilterOperator.Contains, this.searchQuery);
			this.searchFilters.push(filter);
		} else {
			model.setProperty("/itemsRemovable", true);
		}

		this._applyListFilters();
	}

	public onFilter(event: UI5Event) {
		// First reset current filters
		this.tabFilters = [];

		// add filter for search
		this.filterKey = event.getParameter("item").getKey();

		// eslint-disable-line default-case
		switch (this.filterKey) {
			case "active":
				this.tabFilters.push(new Filter("completed", FilterOperator.EQ, false));
				break;
			case "completed":
				this.tabFilters.push(new Filter("completed", FilterOperator.EQ, true));
				break;
			case "all":
			default:
			// Don't use any filter
		}

		this._applyListFilters();
	}

	public _applyListFilters(): void {
		const list = this.byId("todoList") as List;
		const binding = list.getBinding("items") as ListBinding;

		binding.filter(this.searchFilters.concat(this.tabFilters), "todos" as FilterType);

		let i18nKey;
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

		let filterText;
		if (i18nKey) {
			const resourceModel = this.getView().getModel("i18n") as ResourceModel;
			const resourceBundle = resourceModel.getResourceBundle() as ResourceBundle;
			filterText = resourceBundle.getText(i18nKey, [this.searchQuery]);
		}

		this.getModel("view").setProperty("/filterText", filterText);
	}
}