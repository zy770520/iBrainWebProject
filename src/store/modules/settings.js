export default {
    state: {
        navigationVisibility: {
            hardwareReg: true,
            softwareReg: true,
            touchSystem: true
        }
    },
    mutations: {
        SET_NAVIGATION_VISIBILITY(state, payload) {
            state.navigationVisibility = {
                ...state.navigationVisibility,
                ...payload
            }
        }
    },
    actions: {
        updateNavigationVisibility({ commit }, payload) {
            commit('SET_NAVIGATION_VISIBILITY', payload)
            // 可以在这里添加持久化存储逻辑
            localStorage.setItem('navigationVisibility', JSON.stringify(payload))
        }
    }
} 