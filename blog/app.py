import falcon

from blog.views import PostsView, PostView, TagsView

app = application = falcon.App(cors_enable=True)  # TODO: remove CORS?

posts = PostsView()
app.add_route('/posts/', posts)

post = PostView()
app.add_route('/posts/{id:int}/', post)

tags = TagsView()
app.add_route('/tags/', tags)
