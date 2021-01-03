import Vue from "vue";
import Vuex from "vuex";
import { pipe, andThen, otherwise } from "ramda";
import { curry2, PromiseAll, pickMap, mergeByKey } from "./helpers";
import * as api from "./api";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    users: [],
    error: null
  },
  getters: {
    users: (state) => state.users,
    error: (state) => state.error
  },
  mutations: {
    SET_USERS: (state, users) => {
      state.users = users;
    },
    SET_ERROR: (state, error) => {
      state.error = `Error : ${error}`;
    }
  },
  actions: {
    /* Get users and merge them with their todos based on ids */
    getUsers(context) {
      /* Curry commit with 2 args so we can do commit("SET_USERS")(users) */
      const commit = curry2(context.commit);

      /* Returns a function that merges todos with the supplied objects list,
         matched by 2nd argument
      */
      const attachTodos = mergeByKey(
        "todos",
        (user, todo) => user.id === todo.userId
      );

      /* Extract relevant fields */
      const extractUserFields = pickMap([
        "id",
        "name",
        "email",
        "website",
        "todos"
      ]);

      /* We can make a pipeline reusable */
      const getUsers = {
        pipeline: [
          PromiseAll,
          andThen(attachTodos),
          andThen(extractUserFields)
        ],
        from: [api.getUsers(), api.getTodos()]
      };

      pipe(
        ...getUsers.pipeline,
        andThen(commit("SET_USERS")),
        otherwise(commit("SET_ERROR"))
      )(getUsers.from);
    }
  }
});

export default store;
