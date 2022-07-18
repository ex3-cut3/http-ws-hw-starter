export const texts = [
  "Text for typing #1",
  "Text for typing #2",
  "Text for typing #3",
  "Text for typing #4",
  "Text for typing #5",
  "Text for typing #6",
  "Text for typing #7",
];

export const getRandomText = () => {
  return texts[getRandomTextIndex()];
}

export const getRandomTextIndex = () => {
  return Math.floor(Math.random() * texts.length);
}

export default { texts };
