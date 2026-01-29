#!/usr/bin/env python3
"""
Script to fix sprite alignment in a spritesheet.
Aligns all frames so the character's feet are at the same position.
"""

import json
from pathlib import Path
from PIL import Image

# Configuration
SPRITES_DIR = Path(__file__).parent.parent / "src" / "assets" / "sprites"
INPUT_IMAGE = SPRITES_DIR / "player.png"
INPUT_JSON = SPRITES_DIR / "player.json"
OUTPUT_IMAGE = SPRITES_DIR / "player_fixed.png"
OUTPUT_JSON = SPRITES_DIR / "player_fixed.json"

# Target frame size (all frames will be this size)
TARGET_WIDTH = 192
TARGET_HEIGHT = 192

# Anchor point for alignment (0.5, 1.0 = bottom center)
ANCHOR_X = 0.5  # Center horizontally
ANCHOR_Y = 1.0  # Bottom of frame


def find_content_bounds(img: Image.Image) -> tuple[int, int, int, int]:
    """Find the bounding box of non-transparent pixels."""
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    pixels = img.load()
    width, height = img.size

    min_x, min_y = width, height
    max_x, max_y = 0, 0

    for y in range(height):
        for x in range(width):
            if pixels[x, y][3] > 10:  # Alpha > 10 (not fully transparent)
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)

    if max_x < min_x:  # No content found
        return 0, 0, width, height

    return min_x, min_y, max_x + 1, max_y + 1


def main():
    print(f"Loading spritesheet from {INPUT_IMAGE}")
    print(f"Loading JSON from {INPUT_JSON}")

    # Load input
    spritesheet = Image.open(INPUT_IMAGE).convert('RGBA')
    with open(INPUT_JSON) as f:
        data = json.load(f)

    frames = data['frames']

    # Extract and analyze each frame
    frame_data = {}
    max_content_height = 0
    max_content_width = 0

    print("\nAnalyzing frames...")
    for name, info in frames.items():
        frame_rect = info['frame']
        x, y, w, h = frame_rect['x'], frame_rect['y'], frame_rect['w'], frame_rect['h']

        # Extract frame from spritesheet
        frame_img = spritesheet.crop((x, y, x + w, y + h))

        # Find actual content bounds
        bounds = find_content_bounds(frame_img)
        content_x, content_y, content_x2, content_y2 = bounds
        content_w = content_x2 - content_x
        content_h = content_y2 - content_y

        # Distance from content bottom to frame bottom
        feet_offset = h - content_y2

        frame_data[name] = {
            'original': info,
            'image': frame_img,
            'content_bounds': bounds,
            'content_size': (content_w, content_h),
            'feet_offset': feet_offset,
            'content_center_x': content_x + content_w // 2
        }

        max_content_height = max(max_content_height, content_h)
        max_content_width = max(max_content_width, content_w)

        print(f"  {name}: content {content_w}x{content_h}, feet_offset={feet_offset}")

    print(f"\nMax content size: {max_content_width}x{max_content_height}")
    print(f"Target frame size: {TARGET_WIDTH}x{TARGET_HEIGHT}")

    # Create new spritesheet with aligned frames
    num_frames = len(frames)
    cols = 4
    rows = (num_frames + cols - 1) // cols

    new_sheet_width = cols * TARGET_WIDTH
    new_sheet_height = rows * TARGET_HEIGHT

    new_spritesheet = Image.new('RGBA', (new_sheet_width, new_sheet_height), (0, 0, 0, 0))
    new_frames = {}

    print("\nCreating aligned spritesheet...")
    for i, (name, fdata) in enumerate(frame_data.items()):
        col = i % cols
        row = i // cols

        # Target position in new spritesheet
        target_x = col * TARGET_WIDTH
        target_y = row * TARGET_HEIGHT

        # Get original frame image
        frame_img = fdata['image']
        content_bounds = fdata['content_bounds']
        content_x, content_y, content_x2, content_y2 = content_bounds
        content_w = content_x2 - content_x
        content_h = content_y2 - content_y

        # Calculate position to place content so feet are at bottom center
        # Feet should be at: (TARGET_WIDTH * ANCHOR_X, TARGET_HEIGHT * ANCHOR_Y)
        anchor_pixel_x = int(TARGET_WIDTH * ANCHOR_X)
        anchor_pixel_y = int(TARGET_HEIGHT * ANCHOR_Y)

        # Content center X should align with anchor X
        content_center_x = fdata['content_center_x']

        # Place the original frame so that:
        # - The content's horizontal center aligns with anchor_pixel_x
        # - The content's bottom aligns with anchor_pixel_y
        paste_x = anchor_pixel_x - content_center_x
        paste_y = anchor_pixel_y - (content_y2)  # content_y2 is the bottom of content

        # Create new frame
        new_frame = Image.new('RGBA', (TARGET_WIDTH, TARGET_HEIGHT), (0, 0, 0, 0))
        new_frame.paste(frame_img, (paste_x, paste_y))

        # Paste into spritesheet
        new_spritesheet.paste(new_frame, (target_x, target_y))

        # Update JSON
        new_frames[name] = {
            "frame": {
                "x": target_x,
                "y": target_y,
                "w": TARGET_WIDTH,
                "h": TARGET_HEIGHT
            },
            "spriteSourceSize": {
                "x": 0,
                "y": 0,
                "w": TARGET_WIDTH,
                "h": TARGET_HEIGHT
            },
            "sourceSize": {
                "w": TARGET_WIDTH,
                "h": TARGET_HEIGHT
            }
        }

        print(f"  {name}: placed at ({target_x}, {target_y})")

    # Save outputs
    new_spritesheet.save(OUTPUT_IMAGE)
    print(f"\nSaved new spritesheet to {OUTPUT_IMAGE}")

    new_data = {
        "frames": new_frames,
        "meta": {
            "image": "player_fixed.png",
            "size": {
                "w": new_sheet_width,
                "h": new_sheet_height
            }
        }
    }

    with open(OUTPUT_JSON, 'w') as f:
        json.dump(new_data, f, indent=2)
    print(f"Saved new JSON to {OUTPUT_JSON}")

    print("\n✓ Done! To use the fixed sprites:")
    print("  1. Review player_fixed.png to make sure it looks correct")
    print("  2. Backup the originals: mv player.png player_original.png && mv player.json player_original.json")
    print("  3. Use the fixed ones: mv player_fixed.png player.png && mv player_fixed.json player.json")
    print("  4. Update player.ts to remove the manual offset adjustments")


if __name__ == "__main__":
    main()
