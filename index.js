import { colors } from "./constants.js";

let amountSlides = 6;
let showSlides = 2;
let swipeSlides = 2;

// form

const FORM = {
  fields: [
    {
      type: "show",
      value: 0,
      isValid: false,
      error: "Enter valid value!",
      errorElem: document.querySelector('[data-type="show"] .error'),
      elem: document.querySelector('[data-type="show"]'),
    },
    {
      type: "swipe",
      value: 0,
      isValid: false,
      error: "Enter valid value!",
      errorElem: document.querySelector('[data-type="swipe"] .error'),
      elem: document.querySelector('[data-type="swipe"]'),
    },
    {
      type: "amount",
      value: 0,
      isValid: false,
      error: "Enter valid value!",
      errorElem: document.querySelector('[data-type="amount"] .error'),
      elem: document.querySelector('[data-type="amount"]'),
    },
  ],
};

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
    case "show":
      showSlides = value;
      break;
    case "swipe":
      swipeSlides = value;
      break;
    case "amount":
      amountSlides = value;
      break;
  }

  slideWidth = slidesContainerWidth / showSlides;
  step = swipeSlides * slideWidth;
  numberCurrentSlide = showSlides;
  position = 0;
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

function validation() {
  const fieldSwipe = FORM.fields.find((field) => field.type === "swipe");
  const fieldShow = FORM.fields.find((field) => field.type === "show");

  FORM.fields.forEach((field) => {
    switch (field.type) {
      case "show":
        field.isValid = true;

        if (!field.value || field.value === 0) {
          return (field.isValid = false);
        }

        if (field.value < fieldSwipe.value) {
          field.isValid = false;
          fieldSwipe.isValid = false;
        }

        if (field.value >= fieldSwipe.value) {
          field.isValid = true;
          fieldSwipe.isValid = true;
        }

        break;
      case "swipe":
        field.isValid = true;

        if (!field.value || field.value === 0) {
          return (field.isValid = false);
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
      case "amount":
        field.isValid = true;

        if (!field.value || field.value === 0) {
          return (field.isValid = false);
        }

        if (field.value < fieldShow + fieldSwipe) {
          field.isValid = false;
        }
        break;
    }
  });

  setErrors();

  if (getStatusValidForm()) {
    FORM.fields.forEach((field) => setValue(field.type, field.value));
    initSlider();
  }
}

setFieldsForm();

// slider
const slidesContainer = document.querySelector(".slides");
const btnPrev = document.querySelector(".slider-button.prev");
const btnNext = document.querySelector(".slider-button.next");
const slides = [];

const slidesContainerWidth = getPropertyValue(slidesContainer, "width");
let slideWidth = slidesContainerWidth / showSlides;

let step = swipeSlides * slideWidth;
let position = 0;
let numberCurrentSlide = showSlides;

btnPrev.addEventListener("click", () => changeSlide("prev"));
btnNext.addEventListener("click", () => changeSlide("next"));

function initSlider() {
  if (slidesContainer.children.length) {
    for (let idx = slidesContainer.children.length - 1; idx >= 0; idx--) {
      slidesContainer.children.item(idx).remove();
    }
  }

  if (!slidesContainer.children.length) {
    for (let idx = 0; idx < amountSlides; idx++) {
      createSlide(slideWidth, idx + 1);
    }
  }

  slides.push(...document.querySelectorAll(".slide"));

  checkButtons();
}

function getPropertyValue(elem, property) {
  return +window.getComputedStyle(elem)[property].slice(0, -2);
}

function getRandomColor() {
  return colors[Math.round(Math.random() * (colors.length - 1))];
}

function checkButtons() {
  if (numberCurrentSlide === showSlides) {
    return btnPrev.setAttribute("disabled", true);
  }

  if (numberCurrentSlide === amountSlides) {
    return btnNext.setAttribute("disabled", true);
  }

  btnPrev.removeAttribute("disabled");
  btnNext.removeAttribute("disabled");
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
  changePosition(type);
  setPositionForSlide();
  checkButtons();
}

function createSlide(width, idx) {
  const slide = document.createElement("div");

  slide.classList.add("slide");

  slide.style.backgroundColor = getRandomColor();
  slide.style.minWidth = `${width}px`;

  slide.innerHTML = idx;

  slidesContainer.appendChild(slide);
}

function setPositionForSlide() {
  for (let idx = 0; idx < slides.length; idx++) {
    const slide = slides[idx];
    slide.style.transform = `translateX(${position}px)`;
  }
}

initSlider();
