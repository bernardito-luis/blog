from blog.models import *

p = Post(title='Возможно Япония')

p.tags.add(Tag[1])  # Правдивые истории
p.tags.add(Tag[2])  # Путешествия
p.tags.add(Tag[3])  # Задачки
p.tags.remove(Tag[3])  # Задачки

p.content = '''story of my life'''

db.commit()  # Запись в базу
