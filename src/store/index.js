import { createStore } from 'vuex'

import principal,{PRINCIPAL_MUTATION_TYPE} from './principal'

const localStoragePlugin = (store) => {

  let principal = JSON.parse(localStorage.getItem(process.env.VUE_APP_LOCAL_STORAGE_PRINCIPAL_NAME));

  if (principal) {
    store.commit(PRINCIPAL_MUTATION_TYPE.SetPrincipal, principal);
  }

  store.subscribe((mutation) => {

    if (mutation.type === PRINCIPAL_MUTATION_TYPE.SetPrincipal) {
      localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_PRINCIPAL_NAME, JSON.stringify(mutation.payload));
    } else if (mutation.type === PRINCIPAL_MUTATION_TYPE.ClearPrincipal) {
      localStorage.removeItem(process.env.VUE_APP_LOCAL_STORAGE_PRINCIPAL_NAME);
    }

  });

}

export default createStore({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    principal:principal
  },
  plugins:[localStoragePlugin]
})
