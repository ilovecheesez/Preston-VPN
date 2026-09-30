# Preston VPN Icon Generator
# Generates PNG icons for the extension using pure Python (no external deps)

import os
import struct
import zlib

def chunk(chunk_type, data):
    chunk_len = len(data)
    crc_data = chunk_type + data
    crc = zlib.crc32(crc_data) & 0xffffffff
    return struct.pack(">I", chunk_len) + data + struct.pack(">I", crc)

def create_vpn_icon(width, height, output_path):
    # PNG signature
    png = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    png += chunk(b'IHDR', ihdr_data)
    
    # Build pixel data
    raw_data = b''
    cx, cy = width // 2, height // 2
    for y in range(height):
        raw_data += b'\x00'  # filter byte
        for x in range(width):
            # Calculate distance from center
            dx = abs(x - cx)
            dy = abs(y - cy)
            
            # Shield shape approximation
            is_shield = (dx < cx * 0.85) and (dy < cy * 0.85) and (dx + dy < cx + cy * 0.7)
            
            # Check if inside the shield
            if is_shield:
                # Draw a checkmark or keyhole pattern
                is_accent = False
                # Simple keyhole shape
                if dx < 3 and dy > cy * 0.3:
                    is_accent = True
                if dy > cy * 0.5 and dx < 4:
                    is_accent = True
                
                if is_accent:
                    raw_data += bytes((0xff, 0xff, 0xff))  # White accent
                else:
                    raw_data += bytes((0x16, 0x21, 0x3e))  # Dark blue
            else:
                raw_data += bytes((0x0f, 0x34, 0x60))  # Blue background
    
    compressed = zlib.compress(raw_data, 9)
    png += chunk(b'IDAT', compressed)
    png += chunk(b'IEND', b'')
    
    with open(output_path, 'wb') as f:
        f.write(png)
    
    print(f"Created: {output_path}")

if __name__ == "__main__":
    icons_dir = os.path.join(os.path.dirname(__file__), "icons")
    os.makedirs(icons_dir, exist_ok=True)
    
    sizes = [16, 32, 48, 128]
    for size in sizes:
        path = os.path.join(icons_dir, f"icon{size}.png")
        create_vpn_icon(size, size, path)
    
    print("\nAll icons generated successfully!")