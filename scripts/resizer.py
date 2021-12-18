import os
import sys

from PIL import Image


if __name__ == '__main__':
    images_folder = 'frontend/images/2020_caucasus/'
    minimum_width = 1024

    for filename in os.listdir(images_folder):
        if 'minified' in filename:
            print(f'Files in folder {images_folder} have been already minified.')
            sys.exit(1)

    for filename in os.listdir(images_folder):
        im = Image.open(f'{images_folder}{filename}')
        if im.width <= minimum_width:
            continue

        name, extension = filename.rsplit('.')
        new_filename = f'{images_folder}{name}_minified.{extension}'
        minifier = minimum_width / im.width
        new_im = im.resize((minimum_width, round(im.height * minifier)))
        new_im.save(new_filename)
        print('saved', new_filename)
    print('Success!!')
