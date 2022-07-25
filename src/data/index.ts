export const texts = [
  "Text for typing #1",
  "Text for typing #2",
  "Text for typing #3",
  "Text for typing #4",
  "Text for typing #5",
  "Text for typing #6",
  "Text for typing #7",
  "It's a bit cloudy outside now, but there's just a wonderful atmosphere at the Lviv Arena: engines are roaring, spectators are smiling, and riders are barely perceptibly nervous and preparing their iron horses for the race. And I, Escape Enterovych, will comment on this whole event for you, and I am glad to greet you with the words Good day to you, ladies фтв gentlemen!",
  "There is not much left to the finish line and it seems that Oleg from the Atom team can cross it first on his white BMW. The second place can go to Ivan or Andrii. But let's wait for the finish line.",
  "You may think the task is too difficult, but it is not. In fact, this is a simple task and all you need is to reuse the previous homework and “screw” a small module to it that will read and process the race state."
];

export const getRandomText = () => {
  return texts[getRandomTextIndex()];
}

export const getRandomTextIndex = () => {
  return Math.floor(Math.random() * texts.length);
}

export default { texts };
