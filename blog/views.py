import collections
import json
from typing import Optional

import falcon
from falcon.request import Request
from falcon.response import Response
from falcon.errors import HTTPNotFound
from pony.orm import db_session, select, left_join
from pony.orm import ObjectNotFound

from blog.models import Post, Tag


def get_preview(content: str) -> str:
    if '<cut>' not in content and len(content) < 500:
        return content
    elif '<cut>' not in content:
        return '<i>Всё самое интересное внутри ^_^</i>'
    else:
        return content[:content.index('<cut>')]


def get_posts_meta(
    filter_tag: Optional[str], page: int, per_page: int, total_pages: int, posts_count: int,
):
    tag_get_param = ''
    if filter_tag:
        tag_get_param = f'&tag={filter_tag}'
    previous_url = None
    if page > 1:
        previous_url = f'/posts/?page={page - 1}&per_page={per_page}{tag_get_param}'
    next_url = None
    if page < total_pages:
        next_url = f'/posts/?page={page + 1}&per_page={per_page}{tag_get_param}'
    last_url = f'/posts/?page={total_pages}&per_page={per_page}{tag_get_param}'

    return {
        'previous_url': previous_url,
        'next_url': next_url,
        'last_url': last_url,
        'page': page,
        'per_page': per_page,
        'total_pages': total_pages,
        'total_count': posts_count,
    }


def get_posts_and_count(filter_tag: Optional[str]):
    with db_session:
        posts = select(p for p in Post)
        if filter_tag:
            posts = posts.filter(lambda p: filter_tag in p.tags.name)
        posts_count = posts.count()
    return posts, posts_count


def get_posts_data(page: int, per_page: int, filter_tag: Optional[str]):
    with db_session:

        limit = per_page
        offset = (page - 1) * per_page
        posts = select(p for p in Post)
        if filter_tag:
            posts = posts.filter(lambda p: filter_tag in p.tags.name)
        posts = posts[offset:offset + limit]

        tags_posts = left_join(
            (tag, post)
            for tag in Tag for post in tag.posts
            if post in posts
        )
        post_to_tags = collections.defaultdict(list)
        for tag, post in tags_posts:
            post_to_tags[post].append({
                'id': tag.id,
                'name': tag.name,
            })

    data = []
    for post in posts:
        data.append(
            {
                'id': post.id,
                'created_at': post.created_at.strftime('%d.%m.%Y'),
                'title': post.title,
                'preview': get_preview(post.content),
                'tags': post_to_tags.get(post, []),
            },
        )

    return data


class PostsView:
    def on_get(self, req: Request, resp: Response) -> None:
        page = req.params.get('page')
        if page:
            page = int(page)
        else:
            page = 1
        per_page = int(req.params.get('per_page', '10'))
        filter_tag = req.params.get('tag')

        posts, posts_count = get_posts_and_count(filter_tag)
        total_pages, rem = divmod(posts_count, per_page)
        if rem:
            total_pages += 1

        if page > total_pages:
            raise HTTPNotFound()

        response_content = {
            'data': get_posts_data(page, per_page, filter_tag),
            'meta': get_posts_meta(
                filter_tag, page, per_page, total_pages, posts_count),
        }

        resp.text = json.dumps(response_content, ensure_ascii=False)
        resp.status = falcon.HTTP_200


class PostView:
    def on_get(self, req: Request, resp: Response, id: int) -> None:
        with db_session:
            try:
                post = Post[id]
            except ObjectNotFound:
                raise HTTPNotFound()

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
        with db_session:
            tags = select(t for t in Tag)[:]

        tags_data = []
        for tag in tags:
            tags_data.append({
                'name': tag.name,
            })
        tags = {
            'data': tags_data,
        }

        resp.text = json.dumps(tags, ensure_ascii=False)
        resp.status = falcon.HTTP_200
