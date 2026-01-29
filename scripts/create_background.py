#!/usr/bin/env python3
"""
Creates a pixel art background for a 2D platformer game.
"""

from PIL import Image, ImageDraw
import random

# Background size (wide for scrolling)
WIDTH = 1920
HEIGHT = 720
PIXEL_SIZE = 4  # Size of each "pixel" for retro look

def create_pixel_art_background():
    # Create image
    img = Image.new('RGB', (WIDTH, HEIGHT))
    draw = ImageDraw.Draw(img)

    # Sky gradient colors (dusk/evening theme to match "Dusk Adventures")
    sky_colors = [
        (25, 25, 60),    # Dark blue top
        (45, 45, 90),
        (70, 60, 110),
        (100, 70, 120),
        (140, 90, 130),
        (180, 120, 140),
        (200, 150, 160),  # Lighter bottom
    ]

    # Draw sky gradient
    section_height = HEIGHT // len(sky_colors)
    for i, color in enumerate(sky_colors):
        y1 = i * section_height
        y2 = (i + 1) * section_height
        draw.rectangle([0, y1, WIDTH, y2], fill=color)

    # Add stars
    random.seed(42)  # Consistent stars
    for _ in range(150):
        x = random.randint(0, WIDTH)
        y = random.randint(0, HEIGHT // 2)
        size = random.choice([1, 1, 1, 2])
        brightness = random.randint(180, 255)
        star_color = (brightness, brightness, brightness)
        draw.rectangle([x, y, x + size, y + size], fill=star_color)

    # Far mountains (darkest, background)
    mountain_color_far = (30, 30, 50)
    draw_mountains(draw, HEIGHT - 250, 80, 200, mountain_color_far, WIDTH)

    # Mid mountains
    mountain_color_mid = (40, 40, 65)
    draw_mountains(draw, HEIGHT - 180, 60, 150, mountain_color_mid, WIDTH)

    # Near mountains/hills
    mountain_color_near = (50, 50, 80)
    draw_mountains(draw, HEIGHT - 120, 40, 100, mountain_color_near, WIDTH)

    # Pixelate the image for retro look
    small = img.resize((WIDTH // PIXEL_SIZE, HEIGHT // PIXEL_SIZE), Image.NEAREST)
    img = small.resize((WIDTH, HEIGHT), Image.NEAREST)

    return img


def draw_mountains(draw, base_y, min_height, max_height, color, width):
    """Draw a mountain range."""
    random.seed(hash(color))  # Different seed per layer

    points = [(0, base_y + max_height)]  # Start at bottom left

    x = 0
    while x < width:
        # Random peak
        peak_x = x + random.randint(40, 120)
        peak_y = base_y - random.randint(min_height, max_height)

        # Valley after peak
        valley_x = peak_x + random.randint(40, 120)
        valley_y = base_y - random.randint(0, min_height // 2)

        points.append((peak_x, peak_y))
        points.append((valley_x, valley_y))

        x = valley_x

    points.append((width, base_y + max_height))  # End at bottom right
    points.append((0, base_y + max_height))  # Close polygon

    draw.polygon(points, fill=color)


def main():
    print("Creating pixel art background...")
    img = create_pixel_art_background()

    output_path = "/home/mattia/Progetti/dusksadventures/dusk-adventures/src/assets/images/background.png"
    img.save(output_path)
    print(f"Saved to {output_path}")


if __name__ == "__main__":
    main()
