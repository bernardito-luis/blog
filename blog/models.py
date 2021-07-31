import datetime

from pony.orm import Database, Required, Set, Optional

db = Database()


class Post(db.Entity):
    title = Required(str, max_len=255)
    created_at = Required(datetime.datetime, sql_default='CURRENT_TIMESTAMP')
    content = Optional(str)

    tags = Set('Tag')


class Tag(db.Entity):
    name = Required(str, unique=True, max_len=20)

    posts = Set('Post')


if __name__ == '__main__':
    print('creating db...')
    db.bind(provider='sqlite', filename='../database.sqlite', create_db=True)
    db.generate_mapping(create_tables=True)
else:
    db.bind(provider='sqlite', filename='../database.sqlite')
    db.generate_mapping()
