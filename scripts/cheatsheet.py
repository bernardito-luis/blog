from blog.models import *

p = Post(title='Симулятор пенсионера или как ходится в горах без подготовки')

p.tags.add(Tag[1])  # Правдивые истории
p.tags.add(Tag[2])  # Путешествия
p.tags.add(Tag[3])  # Задачки
p.tags.remove(Tag[3])  # Задачки

p.context = '''story of my life'''

db.commit()  # Запись в базу
