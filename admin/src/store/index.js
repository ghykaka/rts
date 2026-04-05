import { createStore } from 'vuex'

export default createStore({
  state: {
    token: localStorage.getItem('admin_token') || '',
    userInfo: JSON.parse(localStorage.getItem('admin_user') || '{}')
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
      localStorage.setItem('admin_token', token)
    },
    SET_USER_INFO(state, user) {
      state.userInfo = user
      localStorage.setItem('admin_user', JSON.stringify(user))
    },
    LOGOUT(state) {
      state.token = ''
      state.userInfo = {}
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
    }
  },
  actions: {
    login({ commit }, { token, user }) {
      commit('SET_TOKEN', token)
      commit('SET_USER_INFO', user)
    },
    logout({ commit }) {
      commit('LOGOUT')
    }
  }
})
