import base64
import functools
import io
import os
import sys

sys.path.append(os.getcwd())

from openai import OpenAI
from PIL import Image

from config import settings

# GHIBLI_PROMPT = (
#     'Create a hand-drawn, painterly illustration inspired by Studio Ghibli\'s signature anime '
#     'style, evoking the warm, dreamlike atmosphere and rich storytelling found in its films.'
# )
GHIBLI_PROMPT = 'Restyle image in studio ghibli style, keep all details.'


@functools.lru_cache()
def get_openapi_client(api_key) -> OpenAI:
    return OpenAI(api_key=api_key)


if __name__ == '__main__':
    images_folder = 'frontend/images/2025_japan_src/'

    files_to_skip = [
        '20250408_173052_minified.jpg',
        '20250409_000712_minified.jpg',
        '20250412_002446_minified.jpg',
    ]
    client = get_openapi_client(settings.OPENAI_API_KEY)

    gen_limit = 50
    gen_count = 0
    filenames = sorted(os.listdir(images_folder))

    ghibli_origs = []
    for filename in filenames:
        if '_ghibli_orig' in filename:
            ghibli_origs.append(filename)
    ghibli_origs_set = set((name.replace('_ghibli_orig', '') for name in ghibli_origs))

    files_to_skip = set(files_to_skip) | ghibli_origs_set

    for filename in filenames:
        if 'minified' not in filename or 'ghibli' in filename or filename in files_to_skip:
            continue

        if gen_count > gen_limit:
            break

        name, ext = os.path.splitext(filename)

        im = Image.open(f'{images_folder}{filename}')
        if im.width >= im.height:
            ghibli_width = 1536
            ghibli_height = 1024
        else:
            ghibli_width = 1024
            ghibli_height = 1536
        size = f'{ghibli_width}x{ghibli_height}'

        with open(f'{images_folder}{filename}', 'rb') as f:
            ghiblified_image = client.images.edit(
                image=f,
                prompt=GHIBLI_PROMPT,
                model='gpt-image-1',
                quality='high',
                size=size,
            )
        gen_count += 1
        image_base64 = ghiblified_image.data[0].b64_json
        image_bytes = base64.b64decode(image_base64)

        with open(f'{images_folder}{name}_ghibli_orig{ext}', 'wb') as f:
            f.write(image_bytes)

        new_im = Image.open(io.BytesIO(image_bytes))
        new_width = round(im.width * 1.5)
        new_height = round(im.height * 1.5)
        if im.width >= im.height:
            w_start = 0
            w_end = ghibli_width
            h_start = round((ghibli_height - new_height) / 2)
            h_end = h_start + new_height
            if h_start < 0:
                h_start = 0
                h_end = ghibli_height
                intermediary_width = (im.width / im.height * new_im.height)
                w_start = round((new_im.width - intermediary_width) / 2)
                w_end = w_start + round(intermediary_width)
        else:
            h_start = 0
            h_end = ghibli_height
            w_start = round((ghibli_width - new_width) / 2)
            w_end = w_start + new_width
            if w_start < 0:
                w_start = 0
                w_end = ghibli_width
                intermediary_height = (im.height / im.width * new_im.width)
                h_start = round((new_im.height - intermediary_height) / 2)
                h_end = h_start + round(intermediary_height)

        (
            new_im
            .crop((w_start, h_start, w_end, h_end))
            .resize((im.width, im.height))
            .save(f'{images_folder}{name}_ghibli{ext}')
        )

        print('Saved:')
        print(f'  {images_folder}{name}_ghibli{ext}')
        print(f'  {images_folder}{name}_ghibli_orig{ext}')

    print('Success!!')
