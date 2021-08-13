import { createStore } from 'vuex'

import principal, {PRINCIPAL_MUTATION_TYPE} from '@/store/principal'
import locale, {LOCALE_MUTATION_TYPE} from '@/store/locale'

const storeSubscribeMethod = {
  [PRINCIPAL_MUTATION_TYPE.SetPrincipal](mutation) {
    sessionStorage.setItem(process.env.VUE_APP_SESSION_STORAGE_PRINCIPAL_NAME, JSON.stringify(mutation.payload));
  },
  [PRINCIPAL_MUTATION_TYPE.ClearPrincipal]() {
    sessionStorage.removeItem(process.env.VUE_APP_SESSION_STORAGE_PRINCIPAL_NAME);
  },
  [LOCALE_MUTATION_TYPE.SetLocal](mutation) {
    localStorage.setItem(process.env.VUE_APP_LOCAL_STORAGE_LOCALE_NAME, mutation.payload.id);
  }
};

const storagePlugin = (store) => {

  store.subscribe((mutation) => storeSubscribeMethod[mutation.type](mutation));

  let principal = JSON.parse(sessionStorage.getItem(process.env.VUE_APP_SESSION_STORAGE_PRINCIPAL_NAME));

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
  plugins:[storagePlugin]
})
