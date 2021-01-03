export const getUsers = () =>
  fetch("https://jsonplaceholder.typicode.com/users").then((res) => res.json());

export const getTodos = () =>
  fetch("https://jsonplaceholder.typicode.com/todos").then((res) => res.json());
