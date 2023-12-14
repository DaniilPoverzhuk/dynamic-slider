export const getPropertyValue = (elem, property) =>
  +window.getComputedStyle(elem)[property].slice(0, -2);

export const getRandomColor = () => {
  let result = "#";

  for (let i = 0; i < 6; i++) {
    const number = Math.round(Math.random() * 15);
    const hex = number.toString(16);

    result += hex;
  }

  return result;
};
