#!/usr/bin/env python3
"""
Preston VPN Icon Generator
Generates valid PNG icons for the browser extension.
"""

import os
import struct
import zlib


def create_valid_png(width, height, output_path):
    """Create a valid PNG file with proper chunks."""
    
    # PNG signature
    signature = b'\x89PNG\r\n\x1a\n'
    
    # Build IHDR chunk data
    # Width (4 bytes), Height (4 bytes), Bit depth (1), Color type (1=grayscale), Compression (0), Filter (0), Interlace (0)
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    
    # Calculate CRC for IHDR
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff
    
    # Build IHDR chunk
    ihdr_chunk = struct.pack(">I", 13)  # Length of data
    ihdr_chunk += b'IHDR'
    ihdr_chunk += ihdr_data
    ihdr_chunk += struct.pack(">I", ihdr_crc)
    
    # Build image data (raw)
    raw_data = b''
    for y in range(height):
        raw_data += b'\x00'  # Filter byte for each row
        for x in range(width):
            # Calculate color based on position (VPN shield pattern)
            cx, cy = width // 2, height // 2
            dx = abs(x - cx) / cx if cx > 0 else 0
            dy = abs(y - cy) / cy if cy > 0 else 0
            
            # Create a shield-like shape
            is_shield = (dx < 0.85) and (dy < 0.85) and (dx + dy < 1.4)
            
            if is_shield:
                # Dark blue for shield body
                r, g, b = 0x1a, 0x1a, 0x2e
            else:
                # Dark background
                r, g, b = 0x0f, 0x34, 0x60
            
            raw_data += bytes([r, g, b])
    
    # Compress image data
    compressed = zlib.compress(raw_data, 9)
    
    # IDAT chunk
    idat_crc = zlib.crc32(b'IDAT' + compressed) & 0xffffffff
    idat_chunk = struct.pack(">I", len(compressed))
    idat_chunk += b'IDAT'
    idat_chunk += compressed
    idat_chunk += struct.pack(">I", idat_crc)
    
    # IEND chunk
    iend_crc = zlib.crc32(b'IEND' + b'') & 0xffffffff
    iend_chunk = struct.pack(">I", 0)
    iend_chunk += b'IEND'
    iend_chunk += struct.pack(">I", iend_crc)
    
    # Combine all chunks
    png_data = signature + ihdr_chunk + idat_chunk + iend_chunk
    
    # Write to file
    with open(output_path, 'wb') as f:
        f.write(png_data)
    
    return True


def create_small_icon(size, output_path):
    """Create a small icon with a simplified design."""
    
    # PNG signature
    signature = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    ihdr_data = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff
    ihdr_chunk = struct.pack(">I", 13) + b'IHDR' + ihdr_data + struct.pack(">I", ihdr_crc)
    
    # Image data
    raw_data = b''
    cx, cy = size // 2, size // 2
    
    for y in range(size):
        raw_data += b'\x00'  # Filter byte
        for x in range(size):
            dx = abs(x - cx) / cx if cx > 0 else 0
            dy = abs(y - cy) / cy if cy > 0 else 0
            
            # Shield shape
            is_shield = (dx < 0.85) and (dy < 0.85) and (dx + dy < 1.4)
            
            if is_shield:
                # Accent color (red/pink) for shield body
                r, g, b = 0xe9, 0x45, 0x60
            else:
                # Dark background
                r, g, b = 0x1a, 0x1a, 0x2e
            
            raw_data += bytes([r, g, b])
    
    # Compress and write
    compressed = zlib.compress(raw_data, 9)
    idat_crc = zlib.crc32(b'IDAT' + compressed) & 0xffffffff
    idat_chunk = struct.pack(">I", len(compressed)) + b'IDAT' + compressed + struct.pack(">I", idat_crc)
    
    # IEND
    iend_crc = zlib.crc32(b'IEND' + b'') & 0xffffffff
    iend_chunk = struct.pack(">I", 0) + b'IEND' + struct.pack(">I", iend_crc)
    
    png_data = signature + ihdr_chunk + idat_chunk + iend_chunk
    
    with open(output_path, 'wb') as f:
        f.write(png_data)
    
    return True


if __name__ == "__main__":
    icons_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "icons")
    os.makedirs(icons_dir, exist_ok=True)
    
    # Generate icons
    icons = {
        16: "icon16.png",
        32: "icon32.png",
        48: "icon48.png",
        128: "icon128.png"
    }
    
    print("Generating Preston VPN icons...")
    for size, filename in icons.items():
        path = os.path.join(icons_dir, filename)
        create_small_icon(size, path)
        print(f"  Created: {path} ({size}x{size})")
    
    print("\nAll icons generated successfully!")