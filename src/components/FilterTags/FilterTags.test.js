import React from "react";
import { MemoryRouter, Router } from "react-router";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { createMemoryHistory } from "history";
import FilterTags from "./FilterTags";

import dataDump from "../../testing/complete-redux-store-dump";

const mockStore = configureStore([]);

describe("FilterTags", () => {
  it("displays the filter panel when button clicked", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <FilterTags />
        </Provider>
      </MemoryRouter>
    );
    const button = ".p-contextual-menu__toggle";
    const panel = ".p-filter-panel";
    expect(wrapper.find(panel).hasClass("is-visible")).toEqual(false);
    wrapper.find(button).simulate("click");
    expect(wrapper.find(panel).hasClass("is-visible")).toEqual(true);
  });

  it("displays correct filter types as per model data", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <FilterTags />
        </Provider>
      </MemoryRouter>
    );
    expect(wrapper.exists('[data-test="owner"]')).toEqual(true);
    expect(wrapper.exists('[data-test="cloud"]')).toEqual(true);
    expect(wrapper.exists('[data-test="region"]')).toEqual(true);
    expect(wrapper.exists('[data-test="credential"]')).toEqual(true);
  });

  it("displays correct number of filter types as per model data", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <FilterTags />
        </Provider>
      </MemoryRouter>
    );
    expect(wrapper.find('[data-test="owner"] li').length).toBe(6);
    expect(wrapper.find('[data-test="cloud"] li').length).toBe(2);
    expect(wrapper.find('[data-test="region"] li').length).toBe(5);
    expect(wrapper.find('[data-test="credential"] li').length).toBe(8);
  });
});

describe("Filter pills", () => {
  it("display as selected when clicked", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <FilterTags />
        </Provider>
      </MemoryRouter>
    );

    const firstFilterButton =
      ".p-contextual-menu__dropdown__section .p-contextual-menu__dropdown__button";
    expect(
      wrapper.find(firstFilterButton).first().hasClass("is-selected")
    ).toEqual(false);
    wrapper.find(firstFilterButton).first().simulate("click");
    expect(
      wrapper.find(firstFilterButton).first().hasClass("is-selected")
    ).toEqual(true);
  });

  it("add to selected section when clicked", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <FilterTags />
        </Provider>
      </MemoryRouter>
    );
    const selectedSection = "[data-test='selected']";
    const firstFilterButton = ".p-contextual-menu__dropdown__button";
    const selectedActiveFilter = ".p-filter-tags__active-filter";
    wrapper.find(firstFilterButton).first().simulate("click");
    expect(wrapper.find(selectedSection)).toHaveLength(1);
    expect(wrapper.find(selectedActiveFilter)).toHaveLength(1);
  });

  it("remove from selected section when clicked", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <FilterTags />
        </Provider>
      </MemoryRouter>
    );
    const firstFilterButton = ".p-contextual-menu__dropdown__button";
    const selectedActiveFilter = ".p-filter-tags__active-filter";
    const selectedActiveFilterClose =
      ".p-filter-tags__active-filter .p-icon--close";
    expect(wrapper.find(selectedActiveFilter)).toHaveLength(0);
    wrapper.find(firstFilterButton).first().simulate("click");
    expect(wrapper.find(selectedActiveFilter)).toHaveLength(1);
    wrapper.find(selectedActiveFilterClose).first().simulate("click");
    expect(wrapper.find(selectedActiveFilter)).toHaveLength(0);
  });

  it("displays correct URL query params when adding/removing filters", () => {
    const history = createMemoryHistory();
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <Router initialEntries={["/models"]} history={history}>
          <FilterTags />
        </Router>
      </Provider>
    );
    const filterButton = ".p-contextual-menu__dropdown__button";
    const selectedActiveFilterClose =
      ".p-filter-tags__active-filter .p-icon--close";
    wrapper.find(filterButton).at(0).simulate("click");
    const searchParams = new URLSearchParams(history.location.search);
    expect(searchParams.get("activeFilters")).toEqual("cloud:aws");
    wrapper.find(selectedActiveFilterClose).at(0).simulate("click");
    const updatedSearchParams = new URLSearchParams(history.location.search);
    expect(updatedSearchParams.get("activeFilters")).toEqual(null);
  });

  it("displays correct URL query params when adding/removing multiple filters", () => {
    const history = createMemoryHistory();
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <Router initialEntries={["/models"]} history={history}>
          <FilterTags />
        </Router>
      </Provider>
    );
    const filterButton =
      ".p-contextual-menu__dropdown__section .p-contextual-menu__dropdown__button";
    const selectedActiveFilterClose =
      ".p-filter-tags__active-filter .p-icon--close";
    wrapper.find(filterButton).at(0).simulate("click");
    wrapper.find(filterButton).at(1).simulate("click");
    expect(history.location.search).toEqual(
      "?activeFilters=cloud%3Aaws,cloud%3Agoogle"
    );
    wrapper.find(selectedActiveFilterClose).at(0).simulate("click");
    expect(history.location.search).toEqual("?activeFilters=cloud%3Agoogle");
    wrapper.find(selectedActiveFilterClose).at(0).simulate("click");
    expect(history.location.search).toEqual("");
  });
});
