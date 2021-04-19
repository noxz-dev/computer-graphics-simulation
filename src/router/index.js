import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '*',
    redirect: '/bezier'
  },
  {
    path: '/bezier',
    component: () => lazyLoadView(import('@/views/BezierView.vue'))
  },
  {
    path: '/quaternion',
    component: () => lazyLoadView(import('@/views/QuaternionView.vue'))
  },
  {
    path: '/particle',
    component: () => lazyLoadView(import('@/views/ParticlesystemView.vue'))
  }
]

function lazyLoadView(AsyncView) {
  const AsyncHandler = () => ({
    component: AsyncView,
    loading: require('@/views/_loading.vue'),
    delay: 400,
    error: require('@/views/_timeout.vue').default,
    timeout: 10000
  })

  return Promise.resolve({
    functional: true,
    render(h, { data, children }) {
      return h(AsyncHandler, data, children)
    }
  })
}

let router = new VueRouter({
  routes: routes,
  mode: 'history'
})

export default router
