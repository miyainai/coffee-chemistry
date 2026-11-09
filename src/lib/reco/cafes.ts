import type { Cafe } from "./types";

// Real Boston-area cafés (from the team's corpus). Ratings, review counts and hours are demo estimates.
export const DEFAULT_LOCATION = { lat: 42.3550, lng: -71.0654 }; // Boston Common

export const CAFES: Cafe[] = [
 {
  "id": "c1",
  "name": "Tatte Bakery & Café",
  "neighborhood": "Beacon Hill",
  "lat": 42.3584,
  "lng": -71.0707,
  "priceLevel": 3,
  "rating": 4.4,
  "reviews": 423,
  "openMin": 420,
  "closeMin": 1200,
  "tags": [
   "wifi",
   "seating",
   "groups",
   "cozy",
   "pastries",
   "aesthetic"
  ],
  "drinks": [
   {
    "name": "Halva Latte",
    "caffeine": "regular",
    "temp": "both",
    "tags": [
     "sweet",
     "creamy",
     "nutty",
     "specialty"
    ],
    "sweetness": 3,
    "unusual": true
   },
   {
    "name": "Seasonal latte",
    "caffeine": "regular",
    "temp": "both",
    "tags": [
     "spiced",
     "sweet",
     "creamy"
    ],
    "sweetness": 2
   }
  ],
  "reviewSnippets": [
   "Bright marble-and-brass bakery with gorgeous pastries; busy and social",
   "Get the halva latte: nutty, sesame-sweet, velvety"
  ]
 },
 {
  "id": "c2",
  "name": "Thinking Cup",
  "neighborhood": "Downtown / Boston Common",
  "lat": 42.354,
  "lng": -71.0636,
  "priceLevel": 2,
  "rating": 4.5,
  "reviews": 596,
  "openMin": 420,
  "closeMin": 1140,
  "tags": [
   "takeout",
   "fast service",
   "cozy"
  ],
  "drinks": [
   {
    "name": "Hot Chocolate",
    "caffeine": "decaf",
    "temp": "hot",
    "tags": [
     "chocolate"
    ],
    "sweetness": 3
   },
   {
    "name": "Cappuccino",
    "caffeine": "regular",
    "temp": "hot",
    "tags": [
     "creamy"
    ],
    "sweetness": 1
   }
  ],
  "reviewSnippets": [
   "Cozy, cramped and buzzy spot by the Common; great for a quick, indulgent stop",
   "Get the hot chocolate: rich, thick, dark-chocolate"
  ]
 },
 {
  "id": "c3",
  "name": "George Howell Coffee",
  "neighborhood": "Downtown Crossing",
  "lat": 42.3556,
  "lng": -71.0607,
  "priceLevel": 3,
  "rating": 4.6,
  "reviews": 769,
  "openMin": 420,
  "closeMin": 1140,
  "tags": [
   "wifi",
   "outlets",
   "seating",
   "laptop-friendly",
   "specialty",
   "aesthetic"
  ],
  "drinks": [
   {
    "name": "Single-Origin Pour Over",
    "caffeine": "high",
    "temp": "hot",
    "tags": [
     "pour-over",
     "bright",
     "specialty"
    ],
    "sweetness": 0
   },
   {
    "name": "Americano",
    "caffeine": "high",
    "temp": "both",
    "tags": [
     "black"
    ],
    "sweetness": 0
   }
  ],
  "reviewSnippets": [
   "Specialty roaster in a hotel lobby; airy, calm and serious about coffee",
   "Get the single-origin pour over: clean, floral, bright acidity"
  ]
 },
 {
  "id": "c4",
  "name": "Render Coffee",
  "neighborhood": "South End",
  "lat": 42.3437,
  "lng": -71.0786,
  "priceLevel": 2,
  "rating": 4.7,
  "reviews": 942,
  "openMin": 420,
  "closeMin": 1140,
  "tags": [
   "wifi",
   "outlets",
   "seating",
   "laptop-friendly"
  ],
  "drinks": [
   {
    "name": "Cortado",
    "caffeine": "regular",
    "temp": "hot",
    "tags": [
     "espresso",
     "sweet"
    ],
    "sweetness": 2
   },
   {
    "name": "Americano",
    "caffeine": "high",
    "temp": "both",
    "tags": [
     "black"
    ],
    "sweetness": 0
   }
  ],
  "reviewSnippets": [
   "Neighborhood favorite with a back patio; steady crowd of laptop regulars",
   "Get the cortado: balanced, caramel, smooth"
  ],
  "promoted": true,
  "offers": [
   {
    "text": "2-5 PM: Free refill for laptop work",
    "startMin": 840,
    "endMin": 1020,
    "purposes": [
     "work"
    ],
    "code": "BREW04"
   }
  ]
 },
 {
  "id": "c5",
  "name": "Gracenote Coffee",
  "neighborhood": "Leather District",
  "lat": 42.3507,
  "lng": -71.0582,
  "priceLevel": 2,
  "rating": 4.8,
  "reviews": 1115,
  "openMin": 420,
  "closeMin": 1140,
  "tags": [
   "takeout",
   "fast service",
   "specialty"
  ],
  "drinks": [
   {
    "name": "Espresso",
    "caffeine": "high",
    "temp": "hot",
    "tags": [
     "espresso",
     "chocolate"
    ],
    "sweetness": 0
   },
   {
    "name": "Pour over",
    "caffeine": "high",
    "temp": "hot",
    "tags": [
     "pour-over",
     "bright"
    ],
    "sweetness": 0
   }
  ],
  "reviewSnippets": [
   "Tiny standing-room espresso bar near South Station; in and out",
   "Get the espresso: syrupy, chocolate, cherry"
  ]
 },
 {
  "id": "c6",
  "name": "Pavement Coffeehouse",
  "neighborhood": "Fenway",
  "lat": 42.3437,
  "lng": -71.087,
  "priceLevel": 2,
  "rating": 4.3,
  "reviews": 1288,
  "openMin": 420,
  "closeMin": 1140,
  "tags": [
   "wifi",
   "outlets",
   "seating",
   "groups",
   "laptop-friendly"
  ],
  "drinks": [
   {
    "name": "Iced Americano",
    "caffeine": "high",
    "temp": "iced",
    "tags": [
     "black"
    ],
    "sweetness": 0
   },
   {
    "name": "Americano",
    "caffeine": "high",
    "temp": "both",
    "tags": [
     "black"
    ],
    "sweetness": 0
   }
  ],
  "reviewSnippets": [
   "Student-heavy hangout with bagels; long tables and lots of outlets",
   "Get the iced americano: bold, roasty, clean finish"
  ],
  "chain": "Pavement"
 },
 {
  "id": "c7",
  "name": "Caffè Vittoria",
  "neighborhood": "North End",
  "lat": 42.3638,
  "lng": -71.0546,
  "priceLevel": 2,
  "rating": 4.4,
  "reviews": 1461,
  "openMin": 480,
  "closeMin": 1440,
  "tags": [
   "seating",
   "cozy",
   "pastries"
  ],
  "drinks": [
   {
    "name": "Cappuccino",
    "caffeine": "regular",
    "temp": "hot",
    "tags": [
     "creamy"
    ],
    "sweetness": 1
   }
  ],
  "reviewSnippets": [
   "Old-world Italian café with antique espresso machines; romantic at night",
   "Get the cappuccino: classic, foamy, cocoa dusted"
  ],
  "offers": [
   {
    "text": "Weeknights after 9 PM: 2-for-1 cannoli",
    "startMin": 1260,
    "endMin": 1410,
    "purposes": [
     "catchup",
     "treat"
    ],
    "code": "BREW07"
   }
  ]
 },
 {
  "id": "c8",
  "name": "Caffè Paradiso",
  "neighborhood": "North End",
  "lat": 42.3637,
  "lng": -71.0549,
  "priceLevel": 2,
  "rating": 4.5,
  "reviews": 1634,
  "openMin": 420,
  "closeMin": 1440,
  "tags": [
   "seating",
   "cozy"
  ],
  "drinks": [
   {
    "name": "Espresso Macchiato",
    "caffeine": "high",
    "temp": "hot",
    "tags": [
     "espresso",
     "sweet"
    ],
    "sweetness": 2
   },
   {
    "name": "Cappuccino",
    "caffeine": "regular",
    "temp": "hot",
    "tags": [
     "creamy"
    ],
    "sweetness": 1
   }
  ],
  "reviewSnippets": [
   "Hanover Street institution for cannoli and espresso; loud and fun",
   "Get the espresso macchiato: strong, sweet, short"
  ]
 },
 {
  "id": "c9",
  "name": "Flour Bakery + Café",
  "neighborhood": "Fort Point",
  "lat": 42.3505,
  "lng": -71.0496,
  "priceLevel": 2,
  "rating": 4.6,
  "reviews": 407,
  "openMin": 420,
  "closeMin": 1140,
  "tags": [
   "wifi",
   "outlets",
   "seating",
   "pastries"
  ],
  "drinks": [
   {
    "name": "Latte",
    "caffeine": "regular",
    "temp": "both",
    "tags": [
     "creamy",
     "nutty"
    ],
    "sweetness": 1
   },
   {
    "name": "Seasonal latte",
    "caffeine": "regular",
    "temp": "both",
    "tags": [
     "spiced",
     "sweet",
     "creamy"
    ],
    "sweetness": 2
   }
  ],
  "reviewSnippets": [
   "Joanne Chang's beloved bakery; sticky buns and a busy lunch crowd",
   "Get the latte: mellow, milky, nutty"
  ]
 },
 {
  "id": "c10",
  "name": "Trident Booksellers & Café",
  "neighborhood": "Back Bay",
  "lat": 42.3487,
  "lng": -71.0858,
  "priceLevel": 2,
  "rating": 4.7,
  "reviews": 580,
  "openMin": 480,
  "closeMin": 1380,
  "tags": [
   "seating",
   "groups",
   "cozy"
  ],
  "drinks": [
   {
    "name": "Mocha",
    "caffeine": "regular",
    "temp": "both",
    "tags": [
     "chocolate"
    ],
    "sweetness": 3
   },
   {
    "name": "Cappuccino",
    "caffeine": "regular",
    "temp": "hot",
    "tags": [
     "creamy"
    ],
    "sweetness": 1
   }
  ],
  "reviewSnippets": [
   "Bookstore-meets-diner on Newbury St; open late and full of character",
   "Get the mocha: chocolatey, comforting"
  ]
 },
 {
  "id": "c11",
  "name": "Newsfeed Café at Boston Public Library",
  "neighborhood": "Copley",
  "lat": 42.3493,
  "lng": -71.0782,
  "priceLevel": 2,
  "rating": 4.8,
  "reviews": 753,
  "openMin": 540,
  "closeMin": 1140,
  "tags": [
   "wifi",
   "outlets",
   "quiet",
   "seating",
   "groups",
   "laptop-friendly"
  ],
  "drinks": [
   {
    "name": "Americano",
    "caffeine": "high",
    "temp": "both",
    "tags": [
     "black"
    ],
    "sweetness": 0
   }
  ],
  "reviewSnippets": [
   "Café inside the Boston Public Library Central branch; near the reading rooms",
   "Get the americano: smooth, medium body"
  ],
  "offers": [
   {
    "text": "3-5 PM: 20% off pastries",
    "startMin": 900,
    "endMin": 1020,
    "purposes": [
     "grab",
     "work",
     "catchup",
     "treat"
    ],
    "code": "BREW11"
   }
  ]
 },
 {
  "id": "c12",
  "name": "Broadsheet Coffee Roasters",
  "neighborhood": "Cambridge (Harvard / Inman)",
  "lat": 42.3746,
  "lng": -71.1094,
  "priceLevel": 2,
  "rating": 4.3,
  "reviews": 926,
  "openMin": 420,
  "closeMin": 1140,
  "tags": [
   "wifi",
   "outlets",
   "quiet",
   "seating",
   "laptop-friendly",
   "specialty"
  ],
  "drinks": [
   {
    "name": "Oat Flat White",
    "caffeine": "regular",
    "temp": "hot",
    "tags": [
     "creamy",
     "sweet"
    ],
    "sweetness": 2
   },
   {
    "name": "Americano",
    "caffeine": "high",
    "temp": "both",
    "tags": [
     "black"
    ],
    "sweetness": 0
   }
  ],
  "reviewSnippets": [
   "Minimal, sunny roastery café; calm weekday mornings",
   "Get the oat flat white: silky, toffee, light roast"
  ]
 },
 {
  "id": "c13",
  "name": "Diesel Café",
  "neighborhood": "Davis Square, Somerville",
  "lat": 42.3965,
  "lng": -71.1225,
  "priceLevel": 1,
  "rating": 4.4,
  "reviews": 1099,
  "openMin": 420,
  "closeMin": 1380,
  "tags": [
   "wifi",
   "outlets",
   "seating",
   "groups",
   "laptop-friendly"
  ],
  "drinks": [
   {
    "name": "Iced Chai",
    "caffeine": "light",
    "temp": "iced",
    "tags": [
     "spiced",
     "sweet",
     "creamy"
    ],
    "sweetness": 2
   },
   {
    "name": "Americano",
    "caffeine": "high",
    "temp": "both",
    "tags": [
     "black"
    ],
    "sweetness": 0
   }
  ],
  "reviewSnippets": [
   "Big, quirky, inclusive Somerville staple with a pool table; open late",
   "Get the iced chai: spiced, sweet, creamy"
  ],
  "offers": [
   {
    "text": "After 8 PM: Free cookie with any drink",
    "startMin": 1200,
    "endMin": 1380,
    "purposes": [
     "work"
    ],
    "code": "BREW13"
   }
  ]
 },
 {
  "id": "c14",
  "name": "Bloc 11 Café",
  "neighborhood": "Union Square, Somerville",
  "lat": 42.3793,
  "lng": -71.095,
  "priceLevel": 1,
  "rating": 4.5,
  "reviews": 1272,
  "openMin": 420,
  "closeMin": 1140,
  "tags": [
   "wifi",
   "outlets",
   "seating",
   "groups",
   "laptop-friendly"
  ],
  "drinks": [
   {
    "name": "Americano",
    "caffeine": "high",
    "temp": "both",
    "tags": [
     "black",
     "nutty"
    ],
    "sweetness": 0
   }
  ],
  "reviewSnippets": [
   "Converted bank with a vault room and garden patio; tons of seating",
   "Get the americano: bold, nutty, clean"
  ],
  "promoted": true,
  "offers": [
   {
    "text": "2-4 PM: $1 off any americano",
    "startMin": 840,
    "endMin": 960,
    "purposes": [
     "work"
    ],
    "code": "BREW14"
   }
  ]
 },
 {
  "id": "c15",
  "name": "1369 Coffee House",
  "neighborhood": "Central Square, Cambridge",
  "lat": 42.3651,
  "lng": -71.1036,
  "priceLevel": 1,
  "rating": 4.6,
  "reviews": 1445,
  "openMin": 420,
  "closeMin": 1140,
  "tags": [
   "wifi",
   "outlets",
   "seating",
   "laptop-friendly"
  ],
  "drinks": [
   {
    "name": "House Drip",
    "caffeine": "high",
    "temp": "hot",
    "tags": [
     "black"
    ],
    "sweetness": 0
   },
   {
    "name": "Americano",
    "caffeine": "high",
    "temp": "both",
    "tags": [
     "black"
    ],
    "sweetness": 0
   }
  ],
  "reviewSnippets": [
   "Long-running indie coffeehouse; relaxed, studenty, no frills",
   "Get the house drip: classic, roasty"
  ]
 },
 {
  "id": "c16",
  "name": "Dwelltime",
  "neighborhood": "Cambridge (Inman / East Cambridge)",
  "lat": 42.3727,
  "lng": -71.092,
  "priceLevel": 2,
  "rating": 4.7,
  "reviews": 1618,
  "openMin": 420,
  "closeMin": 1140,
  "tags": [
   "wifi",
   "outlets",
   "seating",
   "laptop-friendly",
   "pastries",
   "aesthetic"
  ],
  "drinks": [
   {
    "name": "Espresso Tonic",
    "caffeine": "high",
    "temp": "hot",
    "tags": [
     "espresso",
     "bright"
    ],
    "sweetness": 0,
    "unusual": true
   },
   {
    "name": "Americano",
    "caffeine": "high",
    "temp": "both",
    "tags": [
     "black"
    ],
    "sweetness": 0
   }
  ],
  "reviewSnippets": [
   "Roaster-run café with a bright, modern feel and good food",
   "Get the espresso tonic: bright, bubbly, citrusy"
  ]
 },
 {
  "id": "c17",
  "name": "Forge Baking Co.",
  "neighborhood": "Somerville",
  "lat": 42.385,
  "lng": -71.111,
  "priceLevel": 2,
  "rating": 4.8,
  "reviews": 391,
  "openMin": 420,
  "closeMin": 1140,
  "tags": [
   "seating",
   "pastries"
  ],
  "drinks": [
   {
    "name": "Cappuccino",
    "caffeine": "regular",
    "temp": "hot",
    "tags": [
     "espresso"
    ],
    "sweetness": 0
   },
   {
    "name": "Seasonal latte",
    "caffeine": "regular",
    "temp": "both",
    "tags": [
     "spiced",
     "sweet",
     "creamy"
    ],
    "sweetness": 2
   }
  ],
  "reviewSnippets": [
   "Bakery café with excellent bread and quiche; cozy weekend spot",
   "Get the cappuccino: rich, balanced"
  ]
 },
 {
  "id": "c18",
  "name": "Faro Café",
  "neighborhood": "Harvard Square",
  "lat": 42.3727,
  "lng": -71.117,
  "priceLevel": 2,
  "rating": 4.3,
  "reviews": 564,
  "openMin": 420,
  "closeMin": 1140,
  "tags": [
   "quiet",
   "takeout",
   "fast service",
   "cozy"
  ],
  "drinks": [
   {
    "name": "Cortado",
    "caffeine": "regular",
    "temp": "hot",
    "tags": [
     "espresso"
    ],
    "sweetness": 0
   },
   {
    "name": "Cappuccino",
    "caffeine": "regular",
    "temp": "hot",
    "tags": [
     "creamy"
    ],
    "sweetness": 1
   }
  ],
  "reviewSnippets": [
   "Cozy Harvard Square café and bookshop in the spirit of the old Café Pamplona",
   "Get the cortado: strong, spanish-style"
  ]
 },
 {
  "id": "c19",
  "name": "Café Madeleine",
  "neighborhood": "South End",
  "lat": 42.342,
  "lng": -71.0802,
  "priceLevel": 2,
  "rating": 4.4,
  "reviews": 737,
  "openMin": 420,
  "closeMin": 1140,
  "tags": [
   "takeout",
   "fast service",
   "cozy",
   "pastries"
  ],
  "drinks": [
   {
    "name": "Café au Lait",
    "caffeine": "regular",
    "temp": "hot",
    "tags": [
     "creamy"
    ],
    "sweetness": 1
   },
   {
    "name": "Seasonal latte",
    "caffeine": "regular",
    "temp": "both",
    "tags": [
     "spiced",
     "sweet",
     "creamy"
    ],
    "sweetness": 2
   }
  ],
  "reviewSnippets": [
   "Parisian-style pâtisserie; buttery croissants and macarons",
   "Get the café au lait: soft, milky, mellow"
  ]
 },
 {
  "id": "c20",
  "name": "Barismo 364",
  "neighborhood": "Arlington",
  "lat": 42.4149,
  "lng": -71.1563,
  "priceLevel": 2,
  "rating": 4.5,
  "reviews": 910,
  "openMin": 420,
  "closeMin": 1140,
  "tags": [
   "wifi",
   "outlets",
   "quiet",
   "seating",
   "laptop-friendly",
   "specialty"
  ],
  "drinks": [
   {
    "name": "Single-Origin Espresso",
    "caffeine": "high",
    "temp": "hot",
    "tags": [
     "espresso",
     "specialty"
    ],
    "sweetness": 0
   },
   {
    "name": "Americano",
    "caffeine": "high",
    "temp": "both",
    "tags": [
     "black"
    ],
    "sweetness": 0
   }
  ],
  "reviewSnippets": [
   "Local roaster's café on Mass Ave; quiet and coffee-focused",
   "Get the single-origin espresso: fruity, complex"
  ]
 },
 {
  "id": "c21",
  "name": "Sip Café",
  "neighborhood": "Financial District",
  "lat": 42.3563,
  "lng": -71.0555,
  "priceLevel": 2,
  "rating": 4.6,
  "reviews": 1083,
  "openMin": 420,
  "closeMin": 1140,
  "tags": [
   "takeout",
   "fast service"
  ],
  "drinks": [
   {
    "name": "Iced Latte",
    "caffeine": "regular",
    "temp": "iced",
    "tags": [
     "creamy"
    ],
    "sweetness": 1
   }
  ],
  "reviewSnippets": [
   "Glass kiosk in Post Office Square park; lovely outdoor seating",
   "Get the iced latte: smooth, refreshing"
  ]
 },
 {
  "id": "c22",
  "name": "Intelligentsia Coffee",
  "neighborhood": "Watertown",
  "lat": 42.3626,
  "lng": -71.1696,
  "priceLevel": 2,
  "rating": 4.7,
  "reviews": 1256,
  "openMin": 420,
  "closeMin": 1140,
  "tags": [
   "wifi",
   "outlets",
   "seating",
   "groups",
   "laptop-friendly",
   "specialty"
  ],
  "drinks": [
   {
    "name": "Black Cat Espresso",
    "caffeine": "high",
    "temp": "hot",
    "tags": [
     "espresso",
     "chocolate",
     "sweet"
    ],
    "sweetness": 2
   },
   {
    "name": "Americano",
    "caffeine": "high",
    "temp": "both",
    "tags": [
     "black"
    ],
    "sweetness": 0
   }
  ],
  "reviewSnippets": [
   "Chicago roaster's Watertown café with a big outdoor patio",
   "Get the black cat espresso: sweet, chocolatey, syrupy"
  ],
  "offers": [
   {
    "text": "3-5 PM: Free pastry with any pour over",
    "startMin": 900,
    "endMin": 1020,
    "purposes": [
     "work"
    ],
    "code": "BREW22"
   }
  ]
 },
 {
  "id": "c23",
  "name": "Bakey",
  "neighborhood": "Downtown / Boston Common",
  "lat": 42.3553,
  "lng": -71.0626,
  "priceLevel": 2,
  "rating": 4.8,
  "reviews": 1429,
  "openMin": 420,
  "closeMin": 1140,
  "tags": [
   "takeout",
   "fast service",
   "pastries"
  ],
  "drinks": [
   {
    "name": "Latte",
    "caffeine": "regular",
    "temp": "both",
    "tags": [
     "creamy",
     "nutty"
    ],
    "sweetness": 1
   },
   {
    "name": "Seasonal latte",
    "caffeine": "regular",
    "temp": "both",
    "tags": [
     "spiced",
     "sweet",
     "creamy"
    ],
    "sweetness": 2
   }
  ],
  "reviewSnippets": [
   "Modern bakery with standout babka and pastries",
   "Get the latte: smooth, nutty"
  ]
 },
 {
  "id": "c24",
  "name": "Caffè Nero",
  "neighborhood": "Back Bay",
  "lat": 42.3497,
  "lng": -71.079,
  "priceLevel": 2,
  "rating": 4.3,
  "reviews": 1602,
  "openMin": 420,
  "closeMin": 1140,
  "tags": [
   "wifi",
   "outlets",
   "seating",
   "groups",
   "laptop-friendly"
  ],
  "drinks": [
   {
    "name": "Americano",
    "caffeine": "high",
    "temp": "both",
    "tags": [
     "black"
    ],
    "sweetness": 0
   }
  ],
  "reviewSnippets": [
   "Reliable chain with cozy armchairs and long hours",
   "Get the americano: dark, italian roast"
  ]
 },
 {
  "id": "c25",
  "name": "Life Alive",
  "neighborhood": "Central Square, Cambridge",
  "lat": 42.3639,
  "lng": -71.1009,
  "priceLevel": 2,
  "rating": 4.4,
  "reviews": 375,
  "openMin": 420,
  "closeMin": 1140,
  "tags": [
   "wifi",
   "outlets",
   "seating",
   "groups",
   "laptop-friendly"
  ],
  "drinks": [
   {
    "name": "Golden Turmeric Latte",
    "caffeine": "decaf",
    "temp": "both",
    "tags": [
     "spiced",
     "creamy"
    ],
    "sweetness": 2,
    "unusual": true
   },
   {
    "name": "Americano",
    "caffeine": "high",
    "temp": "both",
    "tags": [
     "black"
    ],
    "sweetness": 0
   }
  ],
  "reviewSnippets": [
   "Colorful plant-forward café; bowls, smoothies and a calm upstairs",
   "Get the golden turmeric latte: earthy, warming, spiced"
  ],
  "promoted": true,
  "offers": [
   {
    "text": "2-5 PM: Free oat milk upgrade",
    "startMin": 840,
    "endMin": 1020,
    "purposes": [
     "grab",
     "work",
     "catchup",
     "treat"
    ],
    "code": "BREW25"
   }
  ]
 },
 {
  "id": "c26",
  "name": "Ula Café",
  "neighborhood": "Jamaica Plain",
  "lat": 42.3176,
  "lng": -71.1044,
  "priceLevel": 1,
  "rating": 4.5,
  "reviews": 548,
  "openMin": 420,
  "closeMin": 1140,
  "tags": [
   "wifi",
   "outlets",
   "seating",
   "groups",
   "laptop-friendly"
  ],
  "drinks": [
   {
    "name": "Americano",
    "caffeine": "high",
    "temp": "both",
    "tags": [
     "black"
    ],
    "sweetness": 0
   }
  ],
  "reviewSnippets": [
   "Spacious café in the old brewery complex; neighborhood living room",
   "Get the americano: bold, simple"
  ],
  "promoted": true,
  "offers": [
   {
    "text": "1-4 PM: Free refill for remote workers",
    "startMin": 780,
    "endMin": 960,
    "purposes": [
     "work"
    ],
    "code": "BREW26"
   }
  ]
 },
 {
  "id": "c27",
  "name": "Canto 6",
  "neighborhood": "Jamaica Plain",
  "lat": 42.3127,
  "lng": -71.1135,
  "priceLevel": 2,
  "rating": 4.6,
  "reviews": 721,
  "openMin": 420,
  "closeMin": 1140,
  "tags": [
   "takeout",
   "fast service",
   "pastries"
  ],
  "drinks": [
   {
    "name": "Cappuccino",
    "caffeine": "regular",
    "temp": "hot",
    "tags": [
     "creamy"
    ],
    "sweetness": 1
   },
   {
    "name": "Seasonal latte",
    "caffeine": "regular",
    "temp": "both",
    "tags": [
     "spiced",
     "sweet",
     "creamy"
    ],
    "sweetness": 2
   }
  ],
  "reviewSnippets": [
   "Tiny bakery with some of the city's best croissants; often a line",
   "Get the cappuccino: rich, foamy"
  ]
 },
 {
  "id": "c28",
  "name": "Emmi Bakery & Café",
  "neighborhood": "Charlestown",
  "lat": 42.377,
  "lng": -71.0617,
  "priceLevel": 2,
  "rating": 4.7,
  "reviews": 894,
  "openMin": 420,
  "closeMin": 1140,
  "tags": [
   "wifi",
   "outlets",
   "seating",
   "laptop-friendly",
   "pastries"
  ],
  "drinks": [
   {
    "name": "Latte",
    "caffeine": "regular",
    "temp": "both",
    "tags": [
     "sweet",
     "creamy"
    ],
    "sweetness": 2
   },
   {
    "name": "Americano",
    "caffeine": "high",
    "temp": "both",
    "tags": [
     "black"
    ],
    "sweetness": 0
   }
  ],
  "reviewSnippets": [
   "Neighborhood bakery-café in the former Sorelle space",
   "Get the latte: mellow, sweet"
  ],
  "promoted": true
 },
 {
  "id": "c29",
  "name": "Zumes Coffee House",
  "neighborhood": "Charlestown",
  "lat": 42.3787,
  "lng": -71.063,
  "priceLevel": 1,
  "rating": 4.8,
  "reviews": 1067,
  "openMin": 420,
  "closeMin": 1140,
  "tags": [
   "wifi",
   "outlets",
   "quiet",
   "seating",
   "laptop-friendly"
  ],
  "drinks": [
   {
    "name": "House Drip",
    "caffeine": "high",
    "temp": "hot",
    "tags": [
     "black"
    ],
    "sweetness": 0
   },
   {
    "name": "Americano",
    "caffeine": "high",
    "temp": "both",
    "tags": [
     "black"
    ],
    "sweetness": 0
   }
  ],
  "reviewSnippets": [
   "Long-standing indie coffeehouse with couches and a local crowd",
   "Get the house drip: smooth, classic"
  ]
 },
 {
  "id": "c30",
  "name": "Pavement Coffeehouse",
  "neighborhood": "Allston",
  "lat": 42.353,
  "lng": -71.132,
  "priceLevel": 1,
  "rating": 4.3,
  "reviews": 1240,
  "openMin": 420,
  "closeMin": 1140,
  "tags": [
   "wifi",
   "outlets",
   "seating",
   "groups",
   "laptop-friendly"
  ],
  "drinks": [
   {
    "name": "Iced Americano",
    "caffeine": "high",
    "temp": "iced",
    "tags": [
     "black"
    ],
    "sweetness": 0
   },
   {
    "name": "Americano",
    "caffeine": "high",
    "temp": "both",
    "tags": [
     "black"
    ],
    "sweetness": 0
   }
  ],
  "reviewSnippets": [
   "Big student-friendly outpost; bagels, outlets and long tables",
   "Get the iced americano: bold, roasty, clean finish"
  ],
  "chain": "Pavement"
 }
];
