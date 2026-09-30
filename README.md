# Preston VPN

A P2P-based VPN extension for Chromium-based browsers (Chrome, Edge, Brave, etc.).

## Features

- **P2P Architecture**: Uses peer-to-peer networking instead of centralized VPN servers
- **Kill Switch**: Blocks all internet traffic if the VPN connection drops
- **No Account Required**: No sign-in needed to use the VPN
- **No Rotating Proxies**: Users select a fixed exit node location
- **Strict No-Logs Policy**: IP addresses are immediately deleted when VPN is disabled or removed
- **WebRTC Leak Protection**: Prevents IP leakage through WebRTC
- **DNS Leak Protection**: Blocks DNS prefetch and preconnect requests

## Supported Locations

The following P2P exit nodes are available:

| Country | Cities |
|---------|--------|
| United Kingdom | London |
| Ireland | Dublin |
| France | Paris, Rennes |
| Germany | Frankfurt, Berlin, Munich |
| Australia | Melbourne, Perth, Sydney, Darwin |
| Austria | Vienna, Salzburg |
| Belgium | Brussels, Antwerp |
| Italy | Rome, Tuscany |
| Japan | Tokyo, Osaka |
| Taiwan | Taipei, Tainan |
| Hong Kong | Hong Kong Island, Kowloon |
| India | New Delhi, Mumbai, Agra |
| Saudi Arabia | Riyadh, Jeddah |
| Uzbekistan | Tashkent, Andijan |
| Kyrgyzstan | Bishkek, Aydarken, Gulcho |
| New Zealand | Wellington |
| Sudan | Kauda, Rabak |
| Nigeria | Lagos, Kano |
| South Africa | Cape Town, Johannesburg |
| Egypt | Cairo, Giza |
| Morocco | Rabat |
| Argentina | Buenos Aires, Rosario, Santa Rosa |
| Peru | Lima |
| Mexico | Mexico City, Monterrey, Chihuahua |
| Canada | Vancouver, Ontario |
| El Salvador | Apopa, Colon |
| Honduras | San Pedro Sula, La Paz |
| Brazil | Sao Paulo, Rio de Janeiro, Curitiba |
| Uruguay | Montevideo |
| Paraguay | Asuncion, Ciudad del Este |
| Norway | Oslo, Tonsberg, Sandefjord |
| Sweden | Stockholm, Solna, Laholm |
| Qatar | Doha, Mebaireek |
| Kuwait | Kuwait City |
| Pakistan | Islamabad, Lahore |

## Installation

1. Clone the repository
2. Open Chrome/Edge and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked" and select the extension directory
5. The Preston VPN icon will appear in the toolbar

## Usage

1. Click the Preston VPN icon in your browser toolbar
2. Select a P2P location from the dropdown menu
3. Toggle the VPN switch to connect
4. Enable the Kill Switch for extra protection
5. Disconnect when done - all data is immediately purged

## No-Logs Policy

Preston VPN follows a strict no-logs policy:
- No browsing history is stored
- No connection timestamps are recorded
- No session data is kept
- The IP address is only used transiently during an active connection
- All data is immediately deleted when the VPN is disabled or removed

## Requirements

- Chromium-based browser (Chrome 88+, Edge 90+, Brave, etc.)
- Manifest V3 support

## License

Apache License 2.0