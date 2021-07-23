const Posts = {
  template: `
    <div class="posts">
      <div v-if="loading" class="loading position-absolute">
      </div>

      <div v-if="error" class="error">
        <p v-html="error"></p>
      </div>

      <div v-if="posts" class="content">
        <div v-for="post in posts" class="post-preview my-4">
          <div class="post-preview-header row justify-content-between">
            <h3 class="col-4"><router-link :to="{ name: 'post', params: {id: post.id} }">
              {{ post.title }}
            </router-link></h3>
            <div class="post-preview-date col-4 text-end">
              {{ post.created_at }}
            </div>
          </div>
          <p v-html="post.preview"></p>
          <hr>
        </div>
      </div>

      <nav aria-label="..." v-if="pagination_data">
        <ul class="pagination justify-content-center">
          <li v-for="page_data in pagination_data" class="page-item" :class="page_data.status_class">
            <router-link
              class="page-link" :to="{ name: 'posts', query: page_data.query_params }"
              tabindex="-1"
            >
              {{ page_data.text }}
            </router-link>
          </li>
        </ul>
      </nav>
    </div>
  `,
  data() {
    return {
      loading: false,
      posts: null,
      error: null,
      pagination_data: null,
    }
  },
  created () {
    this.fetchData()
  },
  watch: {
    '$route': 'fetchData'
  },
  methods: {
    fetchData () {
      this.error = this.null = null
      this.loading = true

      const page = this.$route.query.page || "1"
      let tag_param = ''
      if (this.$route.query.tag) {
        tag_param = `&tag=${this.$route.query.tag}`
      }
      let posts_url = `/api/posts/?page=${page}${tag_param}`

      const original_elem = this
      axios.get(posts_url)
        .then(response => {
          original_elem.posts = response['data'].data
          original_elem.loading = false

          const page = response['data'].meta.page
          const total_pages = response['data'].meta.total_pages
          if (total_pages > 1) {
            let pagination_data = []
            const hide_middle_pages = total_pages > 7
            let base_query_params = {}
            if (original_elem.$route.query.tag) {
              base_query_params.tag = original_elem.$route.query.tag
            }
            if (page == 1) {
              pagination_data.push({
                'text': 'Ближе',
                'status_class': 'disabled',
                'query_params': {},
              })
              pagination_data.push({
                'text': page,
                'status_class': 'active',
                'query_params': {page: page, ...base_query_params},
              })
            } else {
              pagination_data.push({
                'text': 'Ближе',
                'status_class': '',
                'query_params': {page: page-1, ...base_query_params},
              })
              pagination_data.push({
                'text': 1,
                'status_class': '',
                'query_params': {page: 1, ...base_query_params},
              })
            }
            if (hide_middle_pages && page >= 4) {
              pagination_data.push({
                'text': '...',
                'status_class': 'disabled',
                'query_params': {},
              })
              pagination_data.push({
                'text': page-1,
                'status_class': '',
                'query_params': {page: page-1, ...base_query_params},
              })
              pagination_data.push({
                'text': page,
                'status_class': 'active',
                'query_params': {page: page, ...base_query_params},
              })
            } else {
              for (let cur_page = 2; cur_page <= page; cur_page++) {
                pagination_data.push({
                  'text': cur_page,
                  'status_class': (cur_page == page)?'active':'',
                  'query_params': {page: cur_page, ...base_query_params},
                })
              }
            }
            if (page != total_pages) {
              pagination_data.push({
                'text': page+1,
                'status_class': '',
                'query_params': {page: page+1, ...base_query_params},
              })
            }
            if (hide_middle_pages && page <= (total_pages-3)) {
              pagination_data.push({
                'text': '...',
                'status_class': 'disabled',
                'query_params': {},
              })
              pagination_data.push({
                'text': total_pages,
                'status_class': '',
                'query_params': {page: total_pages, ...base_query_params},
              })
            } else {
              for (let cur_page = page+2; cur_page <= total_pages; cur_page++) {
                pagination_data.push({
                  'text': cur_page,
                  'status_class': '',
                  'query_params': {page: cur_page, ...base_query_params},
                })
              }
            }
            pagination_data.push({
              'text': 'Дальше',
              'status_class': (total_pages == page)?'disabled':'',
              'query_params': {page: page+1, ...base_query_params},
            })
            original_elem.pagination_data = pagination_data
          } else {
            original_elem.pagination_data = null
          }


        })
        .catch(error => {
          if (error.response.status == 404) {
            original_elem.loading = false
            original_elem.error = 'Ничего не найдено :('
          } else {
            original_elem.loading = false
            original_elem.error = 'Что-то пошло не так :('
          }
        })
    },
  },
}

const Post = {
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
      axios.get("/api/posts/" + fetchId + "/")
        .then(response => {
          original_elem.post = response['data']
          original_elem.loading = false
        })
        .catch(error => {
          if (error.response.status == 404) {
            original_elem.loading = false
            original_elem.error = 'Ничего не найдено :('
          } else {
            original_elem.loading = false
            original_elem.error = 'Что-то пошло не так :('
          }
        })
    },
  },
}

const TagsNavigation = {
  template: `
    <div class="">
      <div class="mt-5 position-fixed">
        <div class="tags">
          <div v-if="loading" class="loading">
            Loading...
          </div>

          <div v-if="error" class="error">
            <p v-html="error"></p>
          </div>

          <div v-if="tags">
            <div v-for="tag in tags">
                <router-link
                  :to="{ name: 'posts', query: { tag: tag.name } }"
                  v-bind:class = "(tag.name == selected_tag_name)?'selected-tag post-tag':'post-tag'"
                >
                  {{ tag.name }}
                </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  watch: {
    '$route.query.tag': function (tag_name) {
      this.selected_tag_name = tag_name
    }
  },
  data() {
    return {
      loading: false,
      tags: null,
      error: null,
      selected_tag_name: null,
    }
  },
  created () {
    this.fetchData()
  },
  methods: {
    fetchData () {
      this.error = this.null = null
      this.loading = true
      const original_elem = this
      axios.get("/api/tags/")
        .then(response => {
          original_elem.tags = response['data'].data
          original_elem.loading = false
        })
        .catch(error => {
          if (error.response.status == 404) {
            original_elem.loading = false
            original_elem.error = 'Ничего не найдено :('
          } else {
            original_elem.loading = false
            original_elem.error = 'Что-то пошло не так :('
          }
        })
    },
  },
}

const routes = [
  { path: '/', name: 'posts', components: { default: Posts, TagsNavigation } },
  { path: '/posts/:id//', name: 'post', components: { default: Post, TagsNavigation } },
]

const router = new VueRouter({
  mode: 'history',
  routes
})

const app = new Vue({
  router
}).$mount('#app')
