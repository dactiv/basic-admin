import { createStore } from 'vuex'

import principal, {PRINCIPAL_MUTATION_TYPE} from './principal'
import locale, {LOCALE_MUTATION_TYPE} from './locale'

const storeSubscribeMethod = {
  [PRINCIPAL_MUTATION_TYPE.SetPrincipal](mutation) {
    localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_PRINCIPAL_NAME, JSON.stringify(mutation.payload));
  },
  [PRINCIPAL_MUTATION_TYPE.ClearPrincipal]() {
    localStorage.removeItem(process.env.VUE_APP_LOCAL_STORAGE_PRINCIPAL_NAME);
  },
  [LOCALE_MUTATION_TYPE.SetLocal](mutation) {
    localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_LOCALE_NAME, mutation.payload.id);
  }
};

const localStoragePlugin = (store) => {

  store.subscribe((mutation) => storeSubscribeMethod[mutation.type](mutation));

  let principal = JSON.parse(localStorage.getItem(process.env.VUE_APP_LOCAL_STORAGE_PRINCIPAL_NAME));

  if (principal) {
    store.commit(PRINCIPAL_MUTATION_TYPE.SetPrincipal, principal);
  }

  let localeId = localStorage.getItem(process.env.VUE_APP_LOCAL_STORAGE_LOCALE_NAME);

  if (localeId) {
    store.commit(LOCALE_MUTATION_TYPE.SetLocal, localeId * 1);
  }

}

export default createStore({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    principal:principal,
    locale:locale
  },
  plugins:[localStoragePlugin]
})
