import json

import falcon
from falcon.request import Request
from falcon.response import Response
from pony.orm import db_session

from blog.models import Post


class PostsView:
    def on_get(self, req: Request, resp: Response) -> None:
        posts = {
            'data': [
                {
                    'id': 1,
                    'preview': (
                        '<b>01.01</b><br>'
                        'Запись первая'
                    ),
                },
                {
                    'id': 2,
                    'preview': (
                        '<b>02.01</b><br>'
                        'Запись вторая'
                    ),
                },
                {
                    'id': 3,
                    'preview': (
                        '<b>03.01</b><br>'
                        'Запись третья'
                    ),
                },
            ],
        }

        resp.text = json.dumps(posts, ensure_ascii=False)
        resp.status = falcon.HTTP_200


class PostView:
    def on_get(self, req: Request, resp: Response, id: int) -> None:
        with db_session:
            # TODO: get_or_404
            post = Post.get(id=id)

        serialized_post = {
            'id': post.id,
            'created_at': post.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'title': post.title,
            'content': post.content,
        }

        resp.text = json.dumps(serialized_post, ensure_ascii=False)
        resp.status = falcon.HTTP_200


class TagsView:
    def on_get(self, req: Request, resp: Response) -> None:
        tags = {
            'data': [
                'Правдивые истории',
                'Путешествия',
                'Программизмы',
            ],
        }

        resp.text = json.dumps(tags, ensure_ascii=False)
        resp.status = falcon.HTTP_200
