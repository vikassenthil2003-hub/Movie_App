const path = require('path');
const fs = require('fs');

// 1. Resolve and load .env safely
const potentialEnvPaths = [
  path.resolve(__dirname, '../backend/.env'),
  path.resolve(__dirname, './backend/.env'),
  path.resolve(process.cwd(), 'backend/.env'),
  path.resolve(process.cwd(), '.env'),
];

for (const envPath of potentialEnvPaths) {
  if (fs.existsSync(envPath)) {
    try {
      const dotenvModule = require(path.resolve(__dirname, '../backend/node_modules/dotenv'));
      dotenvModule.config({ path: envPath });
    } catch {
      try {
        require('dotenv').config({ path: envPath });
      } catch (err) {}
    }
    break;
  }
}

// 2. Resolve mongoose safely
let mongoose;
try {
  mongoose = require(path.resolve(__dirname, '../backend/node_modules/mongoose'));
} catch {
  mongoose = require('mongoose');
}

const Movie = require(path.resolve(__dirname, '../backend/src/models/Movie'));
const Theatre = require(path.resolve(__dirname, '../backend/src/models/Theatre'));
const Screen = require(path.resolve(__dirname, '../backend/src/models/Screen'));
const Show = require(path.resolve(__dirname, '../backend/src/models/Show'));
const Coupon = require(path.resolve(__dirname, '../backend/src/models/Coupon'));
const User = require(path.resolve(__dirname, '../backend/src/models/User'));

const { getLocalDateString } = require(path.resolve(__dirname, '../backend/src/utils/dateUtils'));

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cineverse_ai';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB at:', mongoUri);

    // 1. Clean existing demo data
    console.log('[Seed] Cleaning old movies, theatres, screens, shows, coupons...');
    await mongoose.connection.collection('movies').drop().catch(() => {});
    await Promise.all([
      Movie.deleteMany({}),
      Theatre.deleteMany({}),
      Screen.deleteMany({}),
      Show.deleteMany({}),
      Coupon.deleteMany({}),
    ]);

    // 2. Insert Theatres (Chennai, Bengaluru, Coimbatore, Salem, Madurai)
    console.log('[Seed] Inserting demonstration cinema halls with GeoJSON coordinates...');
    const theatresData = [
      {
        name: 'CineVerse Grand IMAX (Demo)',
        brand: 'CineVerse IMAX',
        address: 'Express Avenue Mall, Whites Road, Royapettah',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pinCode: '600014',
        location: {
          type: 'Point',
          coordinates: [80.2612, 13.0583], // [lng, lat]
        },
        amenities: ['IMAX Laser', 'Dolby Atmos 7.1', 'Recliner Seats', '4K Laser Projection', 'Food & Beverage', 'Parking', 'Wheelchair Accessible'],
        rating: 4.8,
        reviewCount: 340,
        contactPhone: '+91 44 2855 1200',
        isDemoData: true,
      },
      {
        name: 'CineVerse Luxe Nexus (Demo)',
        brand: 'CineVerse Luxe',
        address: 'Nexus Vijaya Mall, Arcot Road, Vadapalani',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pinCode: '600026',
        location: {
          type: 'Point',
          coordinates: [80.2098, 13.0515],
        },
        amenities: ['Dolby Atmos', 'Recliner Seats', 'Gourmet Dining', 'Valet Parking'],
        rating: 4.6,
        reviewCount: 280,
        contactPhone: '+91 44 2480 3400',
        isDemoData: true,
      },
      {
        name: 'CineVerse Galaxy Koramangala (Demo)',
        brand: 'CineVerse Galaxy',
        address: '80 Feet Road, 4th Block, Koramangala',
        city: 'Bengaluru',
        state: 'Karnataka',
        pinCode: '560034',
        location: {
          type: 'Point',
          coordinates: [77.6271, 12.9352],
        },
        amenities: ['Dolby Atmos', '4K Projection', 'Recliner Seats', 'Parking'],
        rating: 4.7,
        reviewCount: 410,
        contactPhone: '+91 80 4110 5000',
        isDemoData: true,
      },
      {
        name: 'CineVerse Prozone (Demo)',
        brand: 'CineVerse Cinemas',
        address: 'Prozone Mall, Sathy Road, Saravanampatti',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pinCode: '641035',
        location: {
          type: 'Point',
          coordinates: [76.9942, 11.0545],
        },
        amenities: ['Dolby 7.1', 'Recliner Seats', 'Food Court', 'Parking'],
        rating: 4.5,
        reviewCount: 190,
        contactPhone: '+91 422 660 7000',
        isDemoData: true,
      },
      {
        name: 'CineVerse ARRS Multiplex (Demo)',
        brand: 'CineVerse Cinemas',
        address: 'Omalur Main Road, Meyyanur',
        city: 'Salem',
        state: 'Tamil Nadu',
        pinCode: '636004',
        location: {
          type: 'Point',
          coordinates: [78.1460, 11.6643],
        },
        amenities: ['Dolby Atmos', '4K Laser', 'Parking', 'Snack Bar'],
        rating: 4.4,
        reviewCount: 150,
        contactPhone: '+91 427 244 5500',
        isDemoData: true,
      },
      {
        name: 'CineVerse Milan Emall (Demo)',
        brand: 'CineVerse Cinemas',
        address: 'KK Nagar, Madurai',
        city: 'Madurai',
        state: 'Tamil Nadu',
        pinCode: '625020',
        location: {
          type: 'Point',
          coordinates: [78.1408, 9.9252],
        },
        amenities: ['Dolby Atmos', 'Recliner Seats', 'Cafeteria', 'Parking'],
        rating: 4.5,
        reviewCount: 180,
        contactPhone: '+91 452 439 8800',
        isDemoData: true,
      },
    ];

    const insertedTheatres = await Theatre.insertMany(theatresData);
    console.log(`[Seed] Inserted ${insertedTheatres.length} demonstration theatres.`);

    // 3. Create Demonstration Users (Admin, Theatre Staff, Customer)
    console.log('[Seed] Ensuring demonstration user accounts (Customer, Admin, Theatre)...');
    const { ensureAllDemoAccounts } = require('../backend/src/utils/bootstrapAdmin');
    await ensureAllDemoAccounts();

    // 4. Generate Seat Layouts and Screens
    console.log('[Seed] Creating screens with Standard, Premium, and Recliner rows...');
    const buildSeatLayout = (colsPerRow = 12) => {
      // Rows: A, B = Recliner; C, D, E, F = Premium; G, H, J, K = Standard
      const rowConfigs = [
        { rowLabel: 'A', category: 'Recliner' },
        { rowLabel: 'B', category: 'Recliner' },
        { rowLabel: 'C', category: 'Premium' },
        { rowLabel: 'D', category: 'Premium' },
        { rowLabel: 'E', category: 'Premium' },
        { rowLabel: 'F', category: 'Premium' },
        { rowLabel: 'G', category: 'Standard' },
        { rowLabel: 'H', category: 'Standard' },
        { rowLabel: 'J', category: 'Standard' },
        { rowLabel: 'K', category: 'Standard' },
      ];

      return rowConfigs.map((cfg) => ({
        rowLabel: cfg.rowLabel,
        category: cfg.category,
        seats: Array.from({ length: colsPerRow }, (_, i) => {
          const colIndex = i + 1;
          const isAisle = colIndex === 3 || colIndex === colsPerRow - 2;
          return {
            seatNumber: `${cfg.rowLabel}${colIndex}`,
            colIndex,
            isAisle,
            isActive: true,
          };
        }),
      }));
    };

    const screensToInsert = [];
    insertedTheatres.forEach((th) => {
      screensToInsert.push(
        {
          theatreId: th._id,
          screenNumber: 1,
          name: 'Audi 1 - IMAX Laser',
          projectionType: 'IMAX Laser',
          soundSystem: 'IMAX 12-Track Sound',
          totalCapacity: 120,
          rows: buildSeatLayout(12),
        },
        {
          theatreId: th._id,
          screenNumber: 2,
          name: 'Audi 2 - Dolby Atmos',
          projectionType: 'Laser 4K',
          soundSystem: 'Dolby Atmos 7.1',
          totalCapacity: 120,
          rows: buildSeatLayout(12),
        }
      );
    });

    const insertedScreens = await Screen.insertMany(screensToInsert);
    console.log(`[Seed] Inserted ${insertedScreens.length} cinema screens with interactive seat grids.`);

    // 5. Insert Movies with full Tamil catalogue
    console.log('[Seed] Upserting rich Tamil movie catalogue & blockbusters...');
    const moviesData = [
      {
        title: 'Leo',
        slug: 'leo-2023',
        synopsis: 'A mild-mannered café owner in Himachal Pradesh becomes the target of a ruthless cartel syndicate who suspect him of being a legendary former gangster.',
        posterUrl: '/images/movies/leo-poster.jpg',
        bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=Po3jStA673E',
        genre: ['Action', 'Thriller', 'Crime'],
        language: ['Tamil', 'Telugu', 'Hindi'],
        duration: 164,
        certification: 'UA',
        releaseDate: new Date('2023-10-19'),
        status: 'now_showing',
        formats: ['2D', '3D', 'IMAX 2D'],
        director: 'Lokesh Kanagaraj',
        cast: [
          { name: 'Vijay', role: 'Parthiban / Leo Das' },
          { name: 'Trisha Krishnan', role: 'Sathya' },
          { name: 'Sanjay Dutt', role: 'Antony Das' },
          { name: 'Arjun Sarja', role: 'Harold Das' },
        ],
        rating: 8.8,
        reviewCount: 4200,
        isTrending: true,
        isFeatured: true,
      },
      {
        title: 'Jailer',
        slug: 'jailer-2023',
        synopsis: 'Retired jail warden Tiger Muthuvel Pandian springs back into unstoppable action when a ruthless antiquities smuggling gang threatens his peaceful family.',
        posterUrl: '/images/movies/jailer-poster.jpg',
        bannerUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=xenOE1Tma0A',
        genre: ['Action', 'Comedy', 'Drama'],
        language: ['Tamil', 'Telugu', 'Hindi'],
        duration: 168,
        certification: 'UA',
        releaseDate: new Date('2023-08-10'),
        status: 'now_showing',
        formats: ['2D', 'Dolby Atmos'],
        director: 'Nelson Dilipkumar',
        cast: [
          { name: 'Rajinikanth', role: 'Tiger Muthuvel Pandian' },
          { name: 'Vinayakan', role: 'Varman' },
          { name: 'Ramya Krishnan', role: 'Vijaya' },
          { name: 'Mohanlal', role: 'Mathew' },
        ],
        rating: 8.6,
        reviewCount: 3800,
        isTrending: true,
        isFeatured: true,
      },
      {
        title: 'Vikram',
        slug: 'vikram-2022',
        synopsis: 'A covert black-ops investigator takes on a masked vigilante group and a vicious drug cartel kingpin seeking to retrieve a lost narcotics consignment.',
        posterUrl: '/images/movies/vikram-poster.jpg',
        bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=OKBMCL-frPU',
        genre: ['Action', 'Thriller', 'Mystery'],
        language: ['Tamil', 'Telugu', 'Hindi'],
        duration: 175,
        certification: 'UA',
        releaseDate: new Date('2022-06-03'),
        status: 'now_showing',
        formats: ['2D', 'Dolby Atmos', 'IMAX 2D'],
        director: 'Lokesh Kanagaraj',
        cast: [
          { name: 'Kamal Haasan', role: 'Agent Vikram / Karnan' },
          { name: 'Vijay Sethupathi', role: 'Santhanam' },
          { name: 'Fahadh Faasil', role: 'Amar' },
          { name: 'Suriya', role: 'Rolex' },
        ],
        rating: 8.9,
        reviewCount: 5400,
        isTrending: true,
        isFeatured: true,
      },
      {
        title: 'Master',
        slug: 'master-2021',
        synopsis: 'An alcoholic professor is assigned to a juvenile correctional facility where he locks horns with a ruthless gangster using children as fall guys for crimes.',
        posterUrl: '/images/movies/master-poster.jpg',
        bannerUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=UTiXQcrLlv4',
        genre: ['Action', 'Thriller', 'Drama'],
        language: ['Tamil', 'Telugu', 'Hindi'],
        duration: 178,
        certification: 'UA',
        releaseDate: new Date('2021-01-13'),
        status: 'now_showing',
        formats: ['2D', 'Dolby Atmos'],
        director: 'Lokesh Kanagaraj',
        cast: [
          { name: 'Vijay', role: 'John Durairaj (JD)' },
          { name: 'Vijay Sethupathi', role: 'Bhavani' },
          { name: 'Malavika Mohanan', role: 'Charulatha' },
          { name: 'Arjun Das', role: 'Das' },
        ],
        rating: 8.7,
        reviewCount: 4900,
        isTrending: true,
        isFeatured: true,
      },
      {
        title: 'Ponniyin Selvan: Part I',
        slug: 'ponniyin-selvan-part-1-2022',
        synopsis: 'Vandiyathevan sets out to cross the Chola kingdom with a crucial message while a conspiracy brews to overthrow Emperor Sundara Chola.',
        posterUrl: '/images/movies/ponniyin-selvan-1-poster.jpg',
        bannerUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=D4qAQYlgZQs',
        genre: ['Action', 'Adventure', 'Drama'],
        language: ['Tamil', 'Telugu', 'Hindi', 'Malayalam'],
        duration: 167,
        certification: 'UA',
        releaseDate: new Date('2022-09-30'),
        status: 'now_showing',
        formats: ['2D', 'IMAX 2D'],
        director: 'Mani Ratnam',
        cast: [
          { name: 'Vikram', role: 'Aditha Karikalan' },
          { name: 'Aishwarya Rai Bachchan', role: 'Nandini' },
          { name: 'Karthi', role: 'Vallavaraiyan Vandiyathevan' },
          { name: 'Jayam Ravi', role: 'Arulmozhi Varman' },
          { name: 'Trisha Krishnan', role: 'Kundavai' },
        ],
        rating: 8.5,
        reviewCount: 3900,
        isTrending: false,
        isFeatured: false,
      },
      {
        title: 'Ponniyin Selvan: Part II',
        slug: 'ponniyin-selvan-part-2-2023',
        synopsis: 'Arulmozhi Varman continues his journey to reclaim the Chola crown as secrets of the past unfold and the empire faces internal rebellion.',
        posterUrl: '/images/movies/ponniyin-selvan-2-poster.jpg',
        bannerUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=EnhS3matIoU',
        genre: ['Action', 'Adventure', 'Drama'],
        language: ['Tamil', 'Telugu', 'Hindi', 'Malayalam'],
        duration: 164,
        certification: 'UA',
        releaseDate: new Date('2023-04-28'),
        status: 'now_showing',
        formats: ['2D', 'IMAX 2D'],
        director: 'Mani Ratnam',
        cast: [
          { name: 'Vikram', role: 'Aditha Karikalan' },
          { name: 'Aishwarya Rai Bachchan', role: 'Nandini / Mandakini' },
          { name: 'Karthi', role: 'Vallavaraiyan Vandiyathevan' },
          { name: 'Jayam Ravi', role: 'Arulmozhi Varman' },
        ],
        rating: 8.4,
        reviewCount: 3600,
        isTrending: false,
        isFeatured: false,
      },
      {
        title: 'Maharaja',
        slug: 'maharaja-2024',
        synopsis: 'A quiet barber files an unusual police complaint when his metal dustbin Lakshmi is stolen during a burglary, unraveling a shocking web of retribution.',
        posterUrl: '/images/movies/maharaja-poster.jpg',
        bannerUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=z37hCm4eges',
        genre: ['Action', 'Thriller', 'Drama'],
        language: ['Tamil', 'Telugu', 'Hindi'],
        duration: 140,
        certification: 'UA',
        releaseDate: new Date('2024-06-14'),
        status: 'now_showing',
        formats: ['2D', 'Dolby Atmos'],
        director: 'Nithilan Saminathan',
        cast: [
          { name: 'Vijay Sethupathi', role: 'Maharaja' },
          { name: 'Anurag Kashyap', role: 'Selvam' },
          { name: 'Mamta Mohandas', role: 'Aasifa' },
          { name: 'Natty (Natraj)', role: 'Inspector S. Varadhan' },
        ],
        rating: 9.0,
        reviewCount: 6100,
        isTrending: true,
        isFeatured: true,
      },
      {
        title: 'Amaran',
        slug: 'amaran-2024',
        synopsis: 'A biographical action drama depicting the courage and sacrifice of Major Mukund Varadarajan of the Rajputana Rifles during counter-terror operations in Kashmir.',
        posterUrl: '/images/movies/amaran-poster.jpg',
        bannerUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=hylIXfZeB4c',
        genre: ['Action', 'Biography', 'Drama'],
        language: ['Tamil', 'Telugu', 'Hindi'],
        duration: 169,
        certification: 'UA',
        releaseDate: new Date('2024-10-31'),
        status: 'now_showing',
        formats: ['2D', 'Dolby Atmos'],
        director: 'Rajkumar Periasamy',
        cast: [
          { name: 'Sivakarthikeyan', role: 'Major Mukund Varadarajan' },
          { name: 'Sai Pallavi', role: 'Indu Rebecca Varghese' },
          { name: 'Bhuvan Arora', role: 'Sepoy Vikram Singh' },
        ],
        rating: 8.7,
        reviewCount: 4800,
        isTrending: true,
        isFeatured: true,
      },
      {
        title: 'Dragon',
        slug: 'dragon-2025',
        synopsis: 'A young college graduate navigates ambition, career chaos, and unexpected romance while taking on life with unstoppable wit and grit.',
        posterUrl: '/images/movies/dragon-poster.jpg',
        bannerUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=qIBZlbJ7NUE',
        genre: ['Action', 'Comedy', 'Drama'],
        language: ['Tamil', 'Telugu'],
        duration: 152,
        certification: 'UA',
        releaseDate: new Date('2025-02-21'),
        status: 'coming_soon',
        formats: ['2D', '3D'],
        director: 'Ashwath Marimuthu',
        cast: [
          { name: 'Pradeep Ranganathan', role: 'Dragon / Dheena' },
          { name: 'Anupama Parameswaran', role: 'Keerthi' },
          { name: 'Kayadu Lohar', role: 'Nivetha' },
        ],
        rating: 8.5,
        reviewCount: 1200,
        isTrending: false,
        isFeatured: false,
      },
      {
        title: 'Retro',
        slug: 'retro-2025',
        synopsis: 'A stylized romantic gangster saga set against vintage coastal landscapes, exploring love, laughter, and high-octane warfare.',
        posterUrl: '/images/movies/retro-poster.jpg',
        bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=i4H6OzfnBwI',
        genre: ['Action', 'Drama', 'Romance'],
        language: ['Tamil', 'Telugu', 'Hindi'],
        duration: 155,
        certification: 'UA',
        releaseDate: new Date('2025-05-01'),
        status: 'coming_soon',
        formats: ['2D', 'Dolby Atmos'],
        director: 'Karthik Subbaraj',
        cast: [
          { name: 'Suriya', role: 'The Renegade' },
          { name: 'Pooja Hegde', role: 'Vennila' },
          { name: 'Joju George', role: 'Anthony' },
          { name: 'Jayaram', role: 'Varadhan' },
        ],
        rating: 8.6,
        reviewCount: 1800,
        isTrending: true,
        isFeatured: false,
      },
      {
        title: 'Good Bad Ugly',
        slug: 'good-bad-ugly-2025',
        synopsis: 'An explosive action thriller where three morally conflicted operatives collide in an epic heist across international underworld syndicates.',
        posterUrl: '/images/movies/good-bad-ugly-poster.jpg',
        bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=jl-sgSDwJHs',
        genre: ['Action', 'Comedy', 'Thriller'],
        language: ['Tamil', 'Telugu', 'Hindi'],
        duration: 158,
        certification: 'UA',
        releaseDate: new Date('2025-04-10'),
        status: 'coming_soon',
        formats: ['2D', 'IMAX 2D'],
        director: 'Adhik Ravichandran',
        cast: [
          { name: 'Ajith Kumar', role: 'The Maverick' },
          { name: 'Trisha Krishnan', role: 'Tara' },
          { name: 'Prasanna', role: 'Vikram' },
        ],
        rating: 8.8,
        reviewCount: 2900,
        isTrending: true,
        isFeatured: false,
      },
      {
        title: 'Viduthalai: Part 1',
        slug: 'viduthalai-part-1-2023',
        synopsis: 'A rookie police constable stationed at a remote outpost is caught in a moral conflict between institutional brutality and a separatist rebel leader.',
        posterUrl: '/images/movies/viduthalai-poster.jpg',
        bannerUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=GYeSfq_bj_M',
        genre: ['Crime', 'Drama', 'Thriller'],
        language: ['Tamil'],
        duration: 150,
        certification: 'A',
        releaseDate: new Date('2023-03-31'),
        status: 'now_showing',
        formats: ['2D'],
        director: 'Vetrimaaran',
        cast: [
          { name: 'Soori', role: 'Kumaresan' },
          { name: 'Vijay Sethupathi', role: 'Perumal Vaathiyaar' },
          { name: 'Bhavani Sre', role: 'Tamizharasi' },
        ],
        rating: 8.7,
        reviewCount: 3100,
        isTrending: false,
        isFeatured: false,
      },
      {
        title: 'Kalki 2898 AD',
        slug: 'kalki-2898-ad-2024',
        synopsis: 'A modern avatar emerges in the city of Kasi as myth and futuristic technology converge in a battle between darkness and divine light.',
        posterUrl: '/images/movies/kalki-2898-ad-poster.jpg',
        bannerUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=y1-w1kUGuz8',
        genre: ['Sci-Fi', 'Mythology', 'Action'],
        language: ['Telugu', 'Tamil', 'Hindi'],
        duration: 180,
        certification: 'UA',
        releaseDate: new Date('2024-06-27'),
        status: 'now_showing',
        formats: ['IMAX 3D', '3D', '2D'],
        director: 'Nag Ashwin',
        cast: [
          { name: 'Prabhas', role: 'Bhairava' },
          { name: 'Amitabh Bachchan', role: 'Ashwatthama' },
          { name: 'Deepika Padukone', role: 'SUM-80' },
        ],
        rating: 8.9,
        reviewCount: 6200,
        isTrending: true,
        isFeatured: true,
      },
    ];

    // Idempotent upsert to avoid duplicate records on multiple runs
    const insertedMovies = [];
    for (const m of moviesData) {
      const vid = Movie.extractYouTubeVideoId ? Movie.extractYouTubeVideoId(m.trailerUrl) : '';
      const movieDoc = {
        ...m,
        trailerVideoId: vid,
        trailerThumbnail: vid ? `https://i.ytimg.com/vi/${vid}/maxresdefault.jpg` : '',
        trailerStatus: vid ? 'verified' : 'missing',
        trailerSource: vid ? 'official_curated' : 'none',
        trailerVerifiedAt: vid ? new Date() : null,
        trailerLastCheckedAt: new Date(),
      };
      const savedMovie = await Movie.findOneAndUpdate(
        { slug: m.slug },
        { $set: movieDoc },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      insertedMovies.push(savedMovie);
    }
    console.log(`[Seed] Successfully seeded ${insertedMovies.length} movies with verified trailers (Idempotent - 0 duplicates).`);

    // 6. Generate Shows for Today, Tomorrow, and Next 3 Days
    console.log('[Seed] Creating dynamic showtimes across multiple dates...');
    const nowShowingMovies = insertedMovies.filter((m) => m.status === 'now_showing');
    const showtimesList = ['10:30 AM', '02:15 PM', '06:45 PM', '10:00 PM'];
    const showsToInsert = [];

    // 0 = Today, 1 = Tomorrow, 2, 3, 4 = Upcoming
    for (let dayOffset = 0; dayOffset <= 4; dayOffset++) {
      const dateStr = getLocalDateString(dayOffset);

      insertedTheatres.forEach((theatre) => {
        const theatreScreens = insertedScreens.filter((s) => s.theatreId.toString() === theatre._id.toString());

        nowShowingMovies.forEach((movie, mIdx) => {
          // Select screen based on movie index
          const screen = theatreScreens[mIdx % theatreScreens.length];
          const timeSlot = showtimesList[mIdx % showtimesList.length];

          // Differentiate pricing based on format and theatre brand
          const isImax = screen.name.includes('IMAX') || movie.formats.includes('IMAX 2D');
          const pricing = isImax
            ? { standard: 220, premium: 350, recliner: 550 }
            : { standard: 160, premium: 250, recliner: 420 };

          showsToInsert.push({
            movieId: movie._id,
            theatreId: theatre._id,
            screenId: screen._id,
            date: dateStr,
            startTime: timeSlot,
            format: isImax ? 'IMAX 2D' : '2D',
            language: movie.language[0] || 'Tamil',
            pricing,
            status: 'scheduled',
            isDemoData: true,
          });
        });
      });
    }

    const insertedShows = await Show.insertMany(showsToInsert);
    console.log(`[Seed] Inserted ${insertedShows.length} dynamic showtimes spanning today, tomorrow, and upcoming dates.`);

    // 7. Insert Promotional Coupons
    console.log('[Seed] Inserting promotional coupons...');
    const couponsData = [
      {
        code: 'CINEVERSE50',
        description: 'Get 50% discount up to ₹150 on your ticket subtotal',
        discountType: 'percentage',
        discountValue: 50,
        minOrderValue: 200,
        maxDiscount: 150,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      {
        code: 'WEEKEND100',
        description: 'Flat ₹100 OFF on orders above ₹400',
        discountType: 'flat',
        discountValue: 100,
        minOrderValue: 400,
        maxDiscount: 100,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        code: 'FIRSTSHOW',
        description: '20% OFF for first-time CineVerse movie lovers',
        discountType: 'percentage',
        discountValue: 20,
        minOrderValue: 150,
        maxDiscount: 80,
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    ];

    const insertedCoupons = await Coupon.insertMany(couponsData);
    console.log(`[Seed] Inserted ${insertedCoupons.length} coupons.`);

    // 8. Synchronize 38-district Tamil Nadu Theatre Directory
    try {
      console.log('[Seed] Synchronizing 38-district Tamil Nadu theatre directory...');
      const theatreImportService = require(path.resolve(__dirname, '../backend/src/services/theatreImportService'));
      await theatreImportService.importCuratedTheatres();
      const totalTheatres = await Theatre.countDocuments();
      console.log(`[Seed] Total verified theatres in system: ${totalTheatres}`);
    } catch (e) {
      console.warn('[Seed] Notice on directory sync:', e.message);
    }

    console.log('====================================================');
    console.log('🎉 CineVerse AI Database Seed Completed Successfully!');
    console.log(`   Movies:    ${insertedMovies.length}`);
    console.log(`   Theatres:  ${insertedTheatres.length}`);
    console.log(`   Screens:   ${insertedScreens.length}`);
    console.log(`   Shows:     ${insertedShows.length}`);
    console.log(`   Coupons:   ${insertedCoupons.length}`);
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
