export const USERNAME_TERM = 'username';
export const USERNAMES_TERM = 'usernames';

export const templateTerm = (term: string): string => {
  return `{${term}}`;
}

export const userGreetings = [
    `Nice to meet you, ${templateTerm(USERNAME_TERM)}!`,
  `Welcome, ${templateTerm(USERNAME_TERM)}?`,
  `What's up, ${templateTerm(USERNAME_TERM)}?`
];

export const usersIntroducing = [
  `Praise our warrior - ${templateTerm(USERNAMES_TERM)}!`
];

export const userLeft = [
  `${templateTerm(USERNAMES_TERM)} left us!`,
];

export const gameStartsSoon = [
  "Here we go!",
  "Let's get ready to demolish!!!",
  "We are about to start!",
]