// 0. If using a module system (e.g. via vue-cli), import Vue and VueRouter
// and then call `Vue.use(VueRouter)`.

// 1. Define route components.
// These can be imported from other files
const Foo = {
  template: '<div>foo</div>',
  // beforeRouteUpdate (to, from, next) {
  //   console.log('xxxxxxxxx')
  //   console.log(this)
  //   next()
  // },
  beforeRouteEnter (to, from, next) {
    console.log('zzzzzzzzzzzzzzzzzzzzz')
    // console.log(to, from, next)

    next(vm => {
      console.log(vm)
    })
  },
}
const Bar = {
  template: `
      <div class="post">
        <div v-if="loading" class="loading">
          Loading...
        </div>
    
        <div v-if="error" class="error">
          {{ error }}
        </div>
    
        <div v-if="post" class="content">
          <h2>{{ post.title }}</h2>
          <p v-html="post.content"></p>
        </div>
      </div>
  `,
  data() {
    return {
      loading: false,
      post: null,
      error: null,
    }
  },
  created () {
    console.log('call right after created?')
    this.fetchData()
  },
  watch: {
    '$route': 'fetchData'
  },
  methods: {
    fetchData () {
      this.error = this.null = null
      this.loading = true
      const fetchId = this.$route.params.id
      const original_elem = this
      axios.get("/api/posts/2/")
        .then(response => {
          console.log(response['data'])
          original_elem.post = response['data']
          original_elem.loading = false
        })
    },
  },
}

// 2. Define some routes
// Each route should map to a component. The "component" can
// either be an actual component constructor created via
// `Vue.extend()`, or just a component options object.
// We'll talk about nested routes later.
const routes = [
  { path: '/foo', component: Foo },
  { path: '/bar', component: Bar }
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = new VueRouter({
  mode: 'history',
  routes // short for `routes: routes`
})

// 4. Create and mount the root instance.
// Make sure to inject the router with the router option to make the
// whole app router-aware.
const app = new Vue({
  router
}).$mount('#app')

// Now the app has started!
