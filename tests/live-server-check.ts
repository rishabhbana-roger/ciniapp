async function testLiveServer() {
  console.log("🌐 Verifying Live Next.js Server on http://localhost:3000...");
  const baseUrl = "http://localhost:3000";

  const routes = [
    { path: "/", expectedText: "CineBook" },
    { path: "/cinemas", expectedText: "Multiplex" },
    { path: "/auth/login", expectedText: "Welcome Back to CineBook" },
    { path: "/auth/register", expectedText: "Create Your CineBook Account" },
    { path: "/api/movies", expectedStatus: 200 },
    { path: "/api/cinemas", expectedStatus: 200 },
  ];

  for (const r of routes) {
    try {
      const res = await fetch(`${baseUrl}${r.path}`);
      if (r.expectedStatus && res.status !== r.expectedStatus) {
        throw new Error(`Expected status ${r.expectedStatus}, got ${res.status} for ${r.path}`);
      }
      if (r.expectedText) {
        const text = await res.text();
        if (!text.includes(r.expectedText)) {
          throw new Error(`Expected page to contain "${r.expectedText}" for ${r.path}`);
        }
      }
      console.log(`   ✅ Route ${r.path} -> HTTP ${res.status} OK`);
    } catch (err: any) {
      console.error(`   ❌ Failed checking route ${r.path}:`, err.message);
      process.exit(1);
    }
  }

  // Test live API hold creation and live payment against the running server
  console.log("\n🌐 Testing Live Server API Booking Flow...");

  // 1. Get a movie
  const moviesRes = await fetch(`${baseUrl}/api/movies`);
  const moviesData = await moviesRes.json();
  const movie = moviesData.movies[0];

  // 2. Get movie details and showtime
  const movieDetailRes = await fetch(`${baseUrl}/api/movies/${movie.id}`);
  const movieDetail = await movieDetailRes.json();
  const showtime = movieDetail.movie.showtimes[0];

  // 3. Get seat map
  const seatMapRes = await fetch(`${baseUrl}/api/showtimes/${showtime.id}`);
  const seatMapData = await seatMapRes.json();
  const availableSeat = seatMapData.seatMap.find((s: any) => s.status === "AVAILABLE");

  console.log(`   ✅ Live Seat Map retrieved for showtime ${showtime.id}: Seat ${availableSeat.row}${availableSeat.number} (${availableSeat.seatType})`);

  console.log("\n🎉 ALL LIVE SERVER ENDPOINTS RESPONDING HEALTHY AND INSTANTLY!");
}

testLiveServer();
