class ElementController {
  #CLASS_DICT = {
    selectableContainer: "bot-selectable-container",
    selectOverlay: "select-overlay",
    itemSelected: "bot-item-selected__manually",
    itemPredicted: "bot-item-selected__predicted",
    actionSelected: "bot-action-selected__manually",
    actionPredicted: "bot-action-selected__predicted",
  }

  #selectableItems = [];
  #selectedItems = [];
  #selectableActions = [];
  #selectedActions = [];

  #createSelectOverlay = (selectHandler) => {
    const div = document.createElement("div");
    div.classList.add(this.#CLASS_DICT.selectOverlay);
    div.onclick = selectHandler;
    return div;
  }

  #deleteSelectOverlay = (overlayElem) => {
    const parent = overlayElem.parentElement;
    parent.removeChild(overlayElem);
    parent.classList.remove(this.#CLASS_DICT.selectableContainer);
  }

  #findChildrenElemsWithPredicate = (parent, predicateFunc) => {
    let res = [];

    function traverse(elem) {
      if (predicateFunc(elem)) {
        res.push(elem);
        return;
      }
      for (const child of Array.from(elem.children)) {
        traverse(child);
      }
    }

    Array.from(parent.children).forEach(child => traverse(child));
    return res;
  }

  #makeElementsSelectable = (elems, selectHandler) => {
    elems.forEach((elem) => {
      elem.classList.add(this.#CLASS_DICT.selectableContainer);
      const overlay = this.#createSelectOverlay((event) => {
        event.stopPropagation();
        selectHandler(event);
      });
      elem.insertAdjacentElement("afterbegin", overlay);
    });
  }

  #predictNextSelectedItems = (selectedItems, selectableItems) => {
    if (selectedItems.length < 2) { return; }

    const template = selectedItems[0];
    selectableItems.forEach((elem) => {
      const overlay = elem.querySelector(`.${this.#CLASS_DICT.selectOverlay}`);
      this.#deleteSelectOverlay(overlay);
      if (elem.parentElement === template.parentElement) {
        elem.classList.add(this.#CLASS_DICT.itemPredicted);
        this.#selectedItems.push(elem);
      }
    });
    this.selectableItems = [];
  }

  #onItemSelect = (event) => {
    const selected = event.target.parentElement;
    this.#deleteSelectOverlay(event.target);
    selected.classList.add(this.#CLASS_DICT.itemSelected);
    this.#selectableItems.splice(this.#selectableItems.indexOf(selected), 1);
    this.#selectedItems.push(selected);
    if (this.#selectedItems.length < 2) {
      return;
    }
    this.#predictNextSelectedItems(this.#selectedItems, this.#selectableItems);
    browser.runtime.sendMessage({
      type: "itemsSelected",
      log: `${this.#selectedItems.length} items selected`
    });
  }

  #onActionSelect = (event) => {
    const selected = event.target.parentElement;
    this.#deleteSelectOverlay(event.target);
    this.#selectableActions.splice(this.#selectableActions.indexOf(selected), 1);

    const predicted = this.#selectableActions.filter((elem) => {
      const elemOverlay = elem.querySelector(`.${this.#CLASS_DICT.selectOverlay}`);
      elem.removeChild(elemOverlay);
      elem.classList.remove(this.#CLASS_DICT.selectableContainer);

      let res = elem.className === selected.className;
      res = res && elem.tagName === selected.tagName;
      return res;
    });
    this.#selectableActions = [];

    selected.classList.add(this.#CLASS_DICT.actionSelected);
    predicted.forEach((elem) => {
      elem.classList.add(this.#CLASS_DICT.actionPredicted);
    });
    this.#selectedActions.push(selected, ...predicted);
    browser.runtime.sendMessage({
      type: "actionsSelected",
      log: `${this.#selectedActions.length} actions selected`
    });
  }

  #revertSelection = (selectableArr, selectedArr, selectedClass, predictedClass) => {
    selectableArr.forEach((elem) => {
      const overlay = elem.querySelector(".select-overlay");
      if (overlay) {
        this.#deleteSelectOverlay(overlay);
      }
    });
    selectedArr.forEach((elem) => {
      elem.classList.remove(elem.classList.contains(selectedClass) ? selectedClass : predictedClass);
    });
  }

  #clearAddedStyles = () => {
    Object.values(this.#CLASS_DICT).forEach((className) => {
      const elems = document.body.querySelectorAll(`.${className}`);
      elems.forEach((elem) => {
        elem.classList.remove(className);
      });
    });
  }

  enableItemSelect = async () => {
    const elems = await document.body.querySelectorAll("input, button");
    elems.forEach((elem) => {
      if (elem.closest("#bot-extension")) {
        return;
      }

      const parent = elem.parentElement;
      if (!this.#selectableItems.includes(parent)) {
        this.#selectableItems.push(parent);
      }
    });
    this.#makeElementsSelectable(this.#selectableItems, this.#onItemSelect);
  }

  enableActionSelect = () => {
    this.#selectableActions = this.#selectedItems.flatMap((item) =>
      this.#findChildrenElemsWithPredicate(item, (elem) => !!elem.click)
    );
    this.#makeElementsSelectable(this.#selectableActions, this.#onActionSelect);
  }

  cancelItemSelect = () => {
    this.#revertSelection(
      this.#selectableItems,
      this.#selectedItems,
      this.#CLASS_DICT.itemSelected,
      this.#CLASS_DICT.itemPredicted
    );
    this.#selectableItems = [];
    this.#selectedItems = [];
  }

  cancelActionSelect = () => {
    this.#revertSelection(
      this.#selectableActions,
      this.#selectedActions,
      this.#CLASS_DICT.actionSelected,
      this.#CLASS_DICT.actionPredicted
    );
    this.#selectableActions = [];
    this.#selectedActions = [];
  }

  revertItemSelect = () => {
    this.cancelItemSelect();
    browser.runtime.sendMessage({type: "revertedLastSelection"});
  }

  revertActionSelect = () => {
    this.cancelActionSelect();
    browser.runtime.sendMessage({type: "revertedLastSelection"});
  }

  runActions = () => {
    const actionsNb = this.#selectedActions.length;
    this.#selectedActions.forEach((elem) => {
      elem.click();
    });
    this.#clearAddedStyles();
    this.#selectedItems = [];
    this.#selectedActions = [];
    browser.runtime.sendMessage({
      type: "actionsRan",
      log: `${actionsNb} actions selected`
    });
  }
}

const elemController = new ElementController();

const messageHandlerMap = {
  enableItemSelect: elemController.enableItemSelect,
  enableActionSelect: elemController.enableActionSelect,
  cancelItemSelect: elemController.cancelItemSelect,
  cancelActionSelect: elemController.cancelActionSelect,
  revertItemSelect: elemController.revertItemSelect,
  revertActionSelect: elemController.revertActionSelect,
  runActions: elemController.runActions,
}

browser.runtime.onMessage.addListener((message, _) => {
  if (Object.keys(messageHandlerMap).includes(message.type)) {
    messageHandlerMap[message.type]();
  }
});
