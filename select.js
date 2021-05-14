//Works as the library for the select box, replace the in-built select of the browser and create manually all of its elements
//We have a label for the select, and we will create as a sibling a div container with two children, a span that will have the label of the current element and an ul list with all the info
export default class Select {
  constructor(element) {
    this.element = element;
    this.options = getFormattedOptions(element.querySelectorAll("option"));
    this.customElement = document.createElement("div");
    this.labelElement = document.createElement("span");
    this.optionsCustomElement = document.createElement("ul");
    setupCustomElement(this);

    //Hidding the original built-in select element
    element.style.display = "none";
    //Adding the new element to the setup
    element.after(this.customElement);
  }

  //return the current item of the list
  get selectedOption() {
    return this.options.find((option) => option.selected);
  }

  //return the index from the current item of the list
  get selectedOptionIndex() {
    return this.options.indexOf(this.selectedOption);
  }

  //Select process, save the selected item value and add the selected css class and fix the view into this element. Also drop the info and selected class from the previous element
  selectValue(value) {
    //Find the new element value
    const newSelectedOption = this.options.find((option) => {
      return option.value === value;
    });

    //Unselected the previous one and delete the selected css class
    const prevSelectedOption = this.selectedOption;
    prevSelectedOption.selected = false;
    prevSelectedOption.element.selected = false;
    this.optionsCustomElement
      .querySelector(`[data-value="${prevSelectedOption.value}"]`)
      .classList.remove("selected");

    //Select the new one, add the selected css class, append the value to the select item, and center the view on it
    newSelectedOption.selected = true;
    newSelectedOption.element.selected = true;
    this.labelElement.innerText = newSelectedOption.label;
    const newCustomElement = this.optionsCustomElement.querySelector(
      `[data-value="${newSelectedOption.value}"]`
    );
    newCustomElement.classList.add("selected");
    newCustomElement.scrollIntoView({ block: "nearest" });
  }
}

//Setup for the list's classes and the attaching of the elements to the select dropdown list
function setupCustomElement(select) {
  select.customElement.classList.add("customSelect__container");
  select.customElement.tabIndex = 0; //Fix for the focus css element

  select.labelElement.classList.add("customSelect__value"); //The current element of the list, or the first if is the 1st time after loading
  select.labelElement.innerText = select.selectedOption.label;
  select.customElement.append(select.labelElement);

  select.optionsCustomElement.classList.add("customSelect__options");
  select.options.forEach((option) => {
    const optionElement = document.createElement("li");
    optionElement.classList.add("customSelect__option");
    optionElement.classList.toggle("select", option.selected);
    optionElement.innerText = option.label;
    optionElement.dataset.value = option.value;

    //Save the new element of the list that is clicked and close the liste
    optionElement.addEventListener("click", () => {
      select.selectValue(option.value);
      select.optionsCustomElement.classList.remove("show");
    });

    select.optionsCustomElement.append(optionElement);
  });
  select.customElement.append(select.optionsCustomElement);

  //Show the list of items when the element is clicked by toggling the css class show
  select.labelElement.addEventListener("click", () => {
    select.optionsCustomElement.classList.toggle("show");
    select.selectValue(select.options[select.selectedOptionIndex].value); //This fix the current index at opening, when the list have been moving with the arrow keys in the meantime the box was closed
  });

  //Close the list when an outside DOM part is clicked and lose the focus
  select.customElement.addEventListener("blur", () => {
    select.optionsCustomElement.classList.toggle("show");
  });

  //Vars for create the debounce timeout when try to search inside the list
  let debounceTimeout;
  let searchTerm = "";

  //Keyboard listeners and interactions
  select.customElement.addEventListener("keydown", (e) => {
    switch (e.code) {
      case "Space":
        select.optionsCustomElement.classList.toggle("show");
        select.selectValue(select.options[select.selectedOptionIndex].value); //This fix the current index at opening, when the list have been moving with the arrow keys in the meantime the box was closed
        break;
      case "ArrowUp":
        const prevOption = select.options[select.selectedOptionIndex - 1];
        if (prevOption) {
          select.selectValue(prevOption.value);
        }
        break;
      case "ArrowDown":
        const nextOption = select.options[select.selectedOptionIndex + 1];
        if (nextOption) {
          select.selectValue(nextOption.value);
        }
        break;
      case "Enter":
      case "Escape":
        select.optionsCustomElement.classList.remove("show");
        break;
      default:
        clearTimeout(debounceTimeout);
        searchTerm += e.key;
        debounceTimeout = setTimeout(() => {
          searchTerm = "";
        }, 500);

        const searchedOption = select.options.find((option) => {
          return option.label.toLowerCase().startsWith(searchTerm);
        });
        if (searchedOption) {
          select.selectValue(searchedOption.value);
        }
    }
  });
}

//Format the options and data attached to the element
function getFormattedOptions(optionElements) {
  return [...optionElements].map((optionElement) => {
    return {
      value: optionElement.value,
      label: optionElement.label,
      selected: optionElement.selected,
      element: optionElement,
    };
  });
}
