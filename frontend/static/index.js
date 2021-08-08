const Posts = {
  template: `
    <div class="posts">
      <div v-if="loading" class="loading position-absolute">
      </div>

      <div v-if="error" class="error">
        <p v-html="error"></p>
      </div>

      <div v-if="posts">
        <div v-for="post in posts" class="post-preview my-4">
          <div class="post-preview-header row justify-content-between">
            <h3 class="col-8"><router-link :to="{ name: 'post', params: {id: post.id} }">
              {{ post.title }}
            </router-link></h3>
            <div class="post-preview-date col-4 text-end">
              {{ post.created_at }}
            </div>
          </div>
          <div v-html="post.preview" class="post-preview-content text-justify"></div>
          <div class="post-tags mt-1" v-if="post.tags.length > 0">
            <i>Метки:</i>
            <router-link
              v-for="tag in post.tags"
              :to="{ name: 'posts', query: { tag: tag.name } }"
              class = "post-tag"
            >
              {{ tag.name }}
            </router-link>
          </div>
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
    document.title = 'generous wind'
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
      <div class="post mt-4">
        <div v-if="loading" class="loading">
          Loading...
        </div>

        <div v-if="error" class="error">
          {{ error }}
        </div>

        <div v-if="post" class="content mb-5">
          <div class="post-header row">
            <div class="col-lg-9 col-sm-12">
              <h2>{{ post.title }}</h2>
            </div>
            <div class="post-date col-lg-3 col-md-12 text-end">
              <div class="col-lg-12 col-md-1 col-2">{{ post.created_time }}</div>
              <div class="col-lg-12 col-md-1 col-2">{{ post.created_date }}</div>
            </div>
            <div class="post-tags" v-if="post.tags.length > 0">
              <span>Метки:</span>
              <router-link
                v-for="tag in post.tags"
                :to="{ name: 'posts', query: { tag: tag } }"
                class = "post-tag"
              >
                {{ tag }}
              </router-link>
            </div>
          </div>
          <hr>
          <div v-html="post.content" class="post-content text-justify"></div>
          <hr>
          <div class="post-tags" v-if="post.content.length > 2200 && post.tags.length > 0">
            <span>Метки:</span>
            <router-link
              v-for="tag in post.tags"
              :to="{ name: 'posts', query: { tag: tag } }"
              class = "post-tag"
            >
              {{ tag }}
            </router-link>
          </div>
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
          document.title = response['data'].title
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

const About = {
  template: `
    <div class="about mt-4">
      <h2>Немного о блоге и об авторе</h2>
      <div class="mt-3">
        <img src="/images/about.jpg">
        <div class="content">
          Меня зовут Макс, круглый год я пишу программки, но иногда выбираюсь в отпуск.
          В отпусках я обычно веду что-то вроде дневника.
          Собственно, в этом блоге собраны записки о таких путешествиях.
          Технических подробностей в них немного, зато описаны некоторые курьезные случаи,
          приключившиеся со мной и моими друзьями.
          Большинство путешествий - или поход, или поездка заграницу с нетривиальным маршрутом.
          Могут попадаться посты и на другие тематики, но их меньшинство.
        </div>
      </div>
    </div>
  `,
}

const routes = [
  { path: '/', name: 'posts', components: { default: Posts, TagsNavigation } },
  { path: '/about/', name: 'about', components: { default: About, TagsNavigation } },
  { path: '/posts/:id//', name: 'post', components: { default: Post, TagsNavigation } },
]

const router = new VueRouter({
  mode: 'history',
  routes,
  scrollBehavior (to, from, savedPosition) {
    return { x: 0, y: 0 }
  }
})

const app = new Vue({
  router
}).$mount('#app')
