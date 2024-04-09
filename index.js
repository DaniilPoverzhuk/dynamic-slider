import { TYPES, OPTIONS_TYPE, OPTIONS } from "./constants.js";

import { getPropertyValue, getRandomColor } from "./utils.js";

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
    { label: "auto-play", checked: false },
    { label: "loop", checked: false },
    { label: "behavior", checked: false },
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

  clearInterval(interval); // обнуление setInterval

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
    }

    return option;
  });
}

function validation() {
  const [fieldShow, fieldSwipe, fieldAmount] = FORM.fields;

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

let slides = [];

const timeoutSlide = 2000;

const slidesContainerWidth = getPropertyValue(slidesContainer, "width");
let slideWidth = slidesContainerWidth / showSlides;

let step = swipeSlides * slideWidth;
let numberCurrentSlide = showSlides;

let position = 0;
let positionTouchXMove = 0;
let positionTouchXStart = 0;

let isTouched = false;
let isLoop = false;

let interval = null;

btnPrev.addEventListener("click", () => changeSlide("prev"));
btnNext.addEventListener("click", () => changeSlide("next"));

slidesContainer.addEventListener("touchstart", touchStart);
slidesContainer.addEventListener("touchend", touchEnd);
slidesContainer.addEventListener("touchmove", touchMove);

function initSlider() {
  deletePrevSlides();
  createSlides();
  checkButtons();
  setOptions();
}

function setAutoPlay() {
  interval = setInterval(() => {
    changeSlide("next");
  }, timeoutSlide);
}

function setOptions() {
  FORM.selectedOptions.forEach((option) => {
    if (option.checked) {
      setSelectedOptions(option);
    }
  });
}

function setSelectedOptions(option) {
  switch (option.label) {
    case OPTIONS_TYPE.AUTO_PLAY:
      setAutoPlay();
      break;
    case OPTIONS_TYPE.LOOP:
      isLoop = true;
      break;
    case OPTIONS_TYPE.BEHAVIOR:
      setBehavior();
      break;
  }
}

function setBehavior() {
  slides.forEach((slide) => slide.classList.add("behavior"));
}

function setPositionForSlide() {
  isTouched = false;

  slides.forEach(
    (slide) => (slide.style.transform = `translateX(${position}px)`)
  );
}

function checkButtons() {
  btnPrev.removeAttribute("disabled");
  btnNext.removeAttribute("disabled");

  if (numberCurrentSlide === showSlides) {
    return btnPrev.setAttribute("disabled", true);
  }

  if (isLoop) {
    return btnNext.removeAttribute("disabled");
  }

  if (numberCurrentSlide === amountSlides) {
    return btnNext.setAttribute("disabled", true);
  }
}

function changePosition(type) {
  if (type === "next") return changePositionByNext();

  if (type === "prev") changePositionByPrev();
}

// Начал делать фичу - loop

function changePositionByNext() {
  if (numberCurrentSlide === amountSlides) {
    numberCurrentSlide = showSlides;
    return (position = 0);
  }

  const expectedNumberSlide = numberCurrentSlide + swipeSlides;

  if (expectedNumberSlide <= amountSlides || isLoop) {
    if (expectedNumberSlide > amountSlides) {
      amountSlides *= 2;
      numberCurrentSlide = (amountSlides - showSlides) % swipeSlides;
      position -= step;
      return createSlides();
    }

    numberCurrentSlide += swipeSlides;
    return (position -= step);
  }

  const availableSwipes = amountSlides - numberCurrentSlide;

  numberCurrentSlide += availableSwipes;

  position -= getCustomStep(availableSwipes);
}

function changePositionByPrev() {
  if (numberCurrentSlide - showSlides - swipeSlides >= 0) {
    numberCurrentSlide -= swipeSlides;
    return (position += step);
  }

  const availableSwipes = Math.abs(
    numberCurrentSlide - showSlides - swipeSlides
  );

  numberCurrentSlide -= availableSwipes;

  position += getCustomStep(availableSwipes);
}

function changeSlide(type) {
  isTouched = false;

  changePosition(type);
  setPositionForSlide();
  checkButtons();
}

function createSlides() {
  for (let idx = 0; idx < amountSlides; idx++) {
    const slide = createSlide(slideWidth, idx + 1);
    slidesContainer.appendChild(slide);
  }

  slides = [...document.querySelectorAll(".slide")];
}

function createSlide(width, content) {
  const slide = document.createElement("div");

  slide.classList.add("slide");

  slide.style.backgroundColor = getRandomColor();
  slide.style.minWidth = `${width}px`;
  slide.style.transform = `translateX(${position}px)`;

  slide.textContent = content;

  return slide;
}

function deletePrevSlides() {
  if (slidesContainer.children.length) {
    for (let idx = slidesContainer.children.length - 1; idx >= 0; idx--) {
      slidesContainer.children.item(idx).remove();
    }
  }
}

function getCustomStep(numberSwipes) {
  return slideWidth * numberSwipes;
}

// Mobile

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

initSlider();
