import { TYPES, OPTIONS_TYPE, OPTIONS } from "./constants.js";

let amountSlides = 6;
let showSlides = 3;
let swipeSlides = 2;

const maxAmountSlides = 100;

const btnSave = document.querySelector(".slider-form__button");
const options = document.querySelectorAll(".slider-form__list-item");

const FORM = {
  fields: [
    {
      type: "show",
      value: showSlides,
      isValid: true,
      error: "Enter valid value!",
      errorElem: document.querySelector('[data-type="show"] .error'),
      elem: document.querySelector('[data-type="show"]'),
    },
    {
      type: "swipe",
      value: swipeSlides,
      isValid: true,
      error: "Enter valid value!",
      errorElem: document.querySelector('[data-type="swipe"] .error'),
      elem: document.querySelector('[data-type="swipe"]'),
    },
    {
      type: "amount",
      value: amountSlides,
      isValid: true,
      error: "Enter valid value!",
      errorElem: document.querySelector('[data-type="amount"] .error'),
      elem: document.querySelector('[data-type="amount"]'),
    },
  ],
  selectedOptions: [
    { label: "auto-play", checked: false, isSetValue: false },
    { label: "loop", checked: false, isSetValue: false },
    { label: "behavior", checked: false, isSetValue: false },
  ],
};

btnSave.addEventListener("click", saveChanges);

options.forEach((option, idx) =>
  option.addEventListener("change", () => toggleOption(idx))
);

// form

function getStatusValidForm() {
  let result = true;

  for (let idx = 0; idx < FORM.fields.length; idx++) {
    const field = FORM.fields[idx];

    if (!field.isValid) {
      result = false;
      break;
    }
  }

  return result;
}

function setFieldsForm() {
  const fields = document.querySelectorAll(".slider-form__field");

  fields.forEach((field) => {
    const type = field.getAttribute("data-type");
    const input = field.querySelector("input");

    setDefaultValue(type, input);

    field.addEventListener("input", (event) =>
      setFieldValue(type, +event.target.value)
    );
  });
}

function setFieldValue(type, value) {
  const field = FORM.fields.find((field) => field.type === type);

  field.value = value;

  validation();
}

function setValue(type, value) {
  switch (type) {
    case TYPES.SHOW:
      showSlides = value;
      break;
    case TYPES.SWIPE:
      swipeSlides = value;
      break;
    case TYPES.AMOUNT:
      amountSlides = value;
      break;
  }

  slideWidth = slidesContainerWidth / showSlides;
  step = swipeSlides * slideWidth;
  numberCurrentSlide = showSlides;
  position = 0;
}

function setDefaultValue(type, input) {
  switch (type) {
    case TYPES.SHOW:
      input.value = showSlides;
      break;
    case TYPES.SWIPE:
      input.value = swipeSlides;
      break;
    case TYPES.AMOUNT:
      input.value = amountSlides;
      break;
  }
}

function setErrors() {
  FORM.fields.forEach((field) => {
    field.elem.classList.remove("error");

    if (!field.isValid) {
      field.elem.classList.add("error");
      field.errorElem.innerHTML = field.error;
    }
  });
}

function saveChanges(event) {
  event.preventDefault();

  if (getStatusValidForm()) {
    FORM.fields.forEach((field) => setValue(field.type, field.value));
    initSlider();
  }
}

function toggleOption(idx) {
  const item = OPTIONS[idx];

  FORM.selectedOptions = FORM.selectedOptions.map((option) => {
    if (option.label === item) {
      option.checked = !option.checked;

      if (!option.checked) {
        option.isSetValue = false;
      }
    }

    return option;
  });
}

function validation() {
  const fieldSwipe = FORM.fields.find((field) => field.type === "swipe");
  const fieldShow = FORM.fields.find((field) => field.type === "show");
  const fieldAmount = FORM.fields.find((field) => field.type === "amount");

  FORM.fields.forEach((field) => {
    switch (field.type) {
      case TYPES.SHOW:
        field.isValid = true;

        if (!field.value || field.value === 0) {
          return (field.isValid = false);
        }

        if (field.value >= 10) {
          field.isValid = false;
          return (field.error = "Don't mess around");
        }

        if (field.value + fieldSwipe.value > fieldAmount.value) {
          return (fieldAmount.isValid = false);
        }

        if (field.value < fieldSwipe.value) {
          field.isValid = false;
          fieldSwipe.isValid = false;
          return;
        }

        if (field.value >= fieldSwipe.value) {
          field.isValid = true;
          fieldSwipe.isValid = true;
        }

        break;
      case TYPES.SWIPE:
        field.isValid = true;

        if (!field.value || field.value === 0) {
          return (field.isValid = false);
        }

        if (field.value + fieldShow.value > fieldAmount.value) {
          return (fieldAmount.isValid = false);
        }

        if (field.value > fieldShow.value) {
          field.isValid = false;
          fieldShow.isValid = false;
        }

        if (field.value <= fieldShow.value) {
          field.isValid = true;
          fieldShow.isValid = true;
        }
        break;
      case TYPES.AMOUNT:
        field.isValid = true;

        if (!field.value || field.value === 0) {
          return (field.isValid = false);
        }

        if (field.value < fieldShow.value + fieldSwipe.value) {
          field.isValid = false;
        }

        if (field.value > maxAmountSlides) {
          field.isValid = false;
        }
        break;
    }
  });

  setErrors();
}

setFieldsForm();

// slider
const slidesContainer = document.querySelector(".slides");
const btnPrev = document.querySelector(".slider-button.prev");
const btnNext = document.querySelector(".slider-button.next");
const hideSlides = [];
let slides = [];

const timeoutSlide = 2000;
let interval = null;
let timeout = null;

const slidesContainerWidth = getPropertyValue(slidesContainer, "width");
let slideWidth = slidesContainerWidth / showSlides;

let step = swipeSlides * slideWidth;
let position = 0;
let numberCurrentSlide = showSlides;

let positionTouchXMove = 0;
let positionTouchXStart = 0;

let isTouched = false;

btnPrev.addEventListener("click", () => changeSlide("prev"));
btnNext.addEventListener("click", () => changeSlide("next"));

slidesContainer.addEventListener("touchstart", touchStart);
slidesContainer.addEventListener("touchend", touchEnd);
slidesContainer.addEventListener("touchmove", touchMove);

function initSlider(type) {
  deletePrevSlides();
  createSlides();
  checkButtons();

  slides = [...document.querySelectorAll(".slide")];

  setOptions(type);
}

function setSlidesTimeout() {
  interval = setInterval(() => {
    changeSlide("next");

    if (numberCurrentSlide === slides.length) {
      timeout = setTimeout(() => {
        position = 0;
        numberCurrentSlide = showSlides;

        setPositionForSlide();
        checkButtons();
        setSlidesTimeout();

        clearTimeout(timeout);
      }, timeoutSlide);

      clearInterval(interval);
    }
  }, timeoutSlide);
}

function setOptions(type) {
  FORM.selectedOptions.forEach((option) => {
    if (option.checked && !option.isSetValue) {
      setSelectedOptions(option);
    }

    if (!option.checked && type !== "mount") {
      setDeletedOption(option);
    }
  });
}

function setSelectedOptions(option) {
  switch (option.label) {
    case OPTIONS_TYPE.AUTO_PLAY:
      setSlidesTimeout();
      option.isSetValue = true;
      return;
    case OPTIONS_TYPE.LOOP:
      return;
    case OPTIONS_TYPE.BEHAVIOR:
      setBehavior();
      return;
  }
}

function setDeletedOption(option) {
  switch (option.label) {
    case OPTIONS_TYPE.AUTO_PLAY:
      clearInterval(interval);
      clearTimeout(timeout);

      option.isSetValue = false;
      return;
    case OPTIONS_TYPE.LOOP:
      return;
    case OPTIONS_TYPE.BEHAVIOR:
      setBehavior("delete");
      return;
  }
}

function setBehavior(type) {
  slides.forEach((slide) => {
    slide.classList.add("behavior");

    if (type === "delete") {
      slide.classList.remove("behavior");
    }
  });
}

function setPositionForSlide() {
  isTouched = false;

  for (let idx = 0; idx < slides.length; idx++) {
    const slide = slides[idx];

    console.log(slide);
    slide.style.transform = `translateX(${position}px)`;
  }
}

function getPropertyValue(elem, property) {
  return +window.getComputedStyle(elem)[property].slice(0, -2);
}

function getRandomColor() {
  let result = "#";

  for (let i = 0; i < 6; i++) {
    const number = Math.round(Math.random() * 15);
    const hex = number.toString(16);

    result += hex;
  }

  return result;
}

function isAvailableTouch(type) {
  if (numberCurrentSlide === showSlides && type === "prev") {
    return false;
  }

  if (numberCurrentSlide === slides.length && type === "next") {
    return false;
  }

  return true;
}

function touchStart(event) {
  positionTouchXStart = event.changedTouches[0].clientX;
  isTouched = true;
}

function touchEnd() {
  if (!isAvailableTouch("prev")) {
    position = 0;
    setPositionForSlide();
    return;
  }

  if (!isAvailableTouch("next")) {
    position = (slides.length - showSlides) * slideWidth * -1;
    setPositionForSlide();
    return;
  }
}

function touchMove(event) {
  if (isTouched) {
    positionTouchXMove = event.changedTouches[0].clientX;
    const scrolledPosition = positionTouchXStart - positionTouchXMove;

    const isAvailableTouchNext = () =>
      positionTouchXStart > positionTouchXMove && isAvailableTouch("next");

    if (!isAvailableTouch("prev") && scrolledPosition < 0) {
      position += 15;
      setPositionForSlide();
    }

    if (!isAvailableTouch("next") && scrolledPosition > 0) {
      position -= 15;
      setPositionForSlide();
    }

    if (Math.abs(scrolledPosition) >= slideWidth / 2) {
      if (isAvailableTouchNext()) {
        return changeSlide("next");
      }

      if (isAvailableTouch("prev")) {
        return changeSlide("prev");
      }
    }
  }
}

function checkButtons() {
  btnPrev.removeAttribute("disabled");
  btnNext.removeAttribute("disabled");

  if (numberCurrentSlide === showSlides) {
    return btnPrev.setAttribute("disabled", true);
  }

  if (numberCurrentSlide === amountSlides) {
    return btnNext.setAttribute("disabled", true);
  }
}

function checkPosition(type) {
  if (type === "next") {
    if (numberCurrentSlide > amountSlides) {
      const difference = amountSlides - (numberCurrentSlide - swipeSlides);
      const step = difference * slideWidth;

      numberCurrentSlide -= swipeSlides - difference;
      position -= step;

      return false;
    }

    return true;
  }

  if (type === "prev") {
    const isSliderWithRemains = () =>
      numberCurrentSlide + swipeSlides === amountSlides &&
      (amountSlides - showSlides) % swipeSlides;

    if (isSliderWithRemains()) {
      const difference = (amountSlides - showSlides) % swipeSlides;
      const step = difference * slideWidth;

      numberCurrentSlide = amountSlides - difference;
      position += step;

      return false;
    }

    return true;
  }
}

function changePosition(type) {
  if (type === "prev") {
    numberCurrentSlide -= swipeSlides;
    return checkPosition("prev") && (position += step);
  }

  if (type === "next") {
    numberCurrentSlide += swipeSlides;
    return checkPosition("next") && (position -= step);
  }
}

function changeSlide(type) {
  isTouched = false;

  changePosition(type);
  setPositionForSlide();
  checkButtons();
}

function createSlides() {
  if (!slidesContainer.children.length) {
    for (let idx = 0; idx < amountSlides; idx++) {
      createSlide(slideWidth, idx + 1);
    }
  }
}

function createSlide(width, idx) {
  const slide = document.createElement("div");

  slide.classList.add("slide");

  slide.style.backgroundColor = getRandomColor();
  slide.style.minWidth = `${width}px`;

  slide.innerHTML = idx;

  slidesContainer.appendChild(slide);
}

function deletePrevSlides() {
  if (slidesContainer.children.length) {
    for (let idx = slidesContainer.children.length - 1; idx >= 0; idx--) {
      slidesContainer.children.item(idx).remove();
    }
  }
}

initSlider("mount");
