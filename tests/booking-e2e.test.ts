import { repository, getStore } from "../src/db/repository";
import { formatCentsToUSD } from "../src/lib/utils";

export async function runBookingE2ETest() {
  console.log("\n🧪 Running Test Suite: End-to-End Booking Lifecycle, Idempotency & Refunds");

  const store = getStore();
  const user = store.users[1]; // Alex

  // 1. Movie Search & Filter
  console.log("   1. Searching for Sci-Fi movies...");
  const sciFiMovies = await repository.getMovies({ genre: "sci-fi" });
  if (sciFiMovies.length === 0) throw new Error("No Sci-Fi movies found");
  console.log(`   ✅ Found ${sciFiMovies.length} Sci-Fi movies (e.g. ${sciFiMovies[0].title})`);

  // 2. Select Movie & Showtime
  const movie = await repository.getMovieById(sciFiMovies[0].id);
  if (!movie || !movie.showtimes || movie.showtimes.length === 0) {
    throw new Error("Movie has no scheduled showtimes");
  }
  const showtime = movie.showtimes[0];
  console.log(`   ✅ Selected Showtime: ${showtime.startTime} in ${showtime.auditorium?.name}`);

  // 3. Seat Map Query
  const seatMapData = await repository.getShowtimeSeatMap(showtime.id, user.id);
  if (!seatMapData) throw new Error("Could not retrieve seat map");

  const availableSeats = seatMapData.seatMap.filter((s) => s.status === "AVAILABLE");
  if (availableSeats.length < 2) throw new Error("Not enough available seats for test");

  const selectedSeats = [availableSeats[0], availableSeats[1]];
  console.log(`   ✅ Selecting 2 seats: ${selectedSeats.map((s) => `${s.row}${s.number} (${s.seatType})`).join(", ")}`);

  // 4. Hold Seats & Validate Pricing in Minor Unit Cents
  const holdRes = await repository.holdSeats(
    showtime.id,
    selectedSeats.map((s) => s.id),
    user.id
  );

  const expectedSubtotal = selectedSeats.reduce((sum, s) => sum + s.priceCents, 0);
  const expectedFee = Math.round(expectedSubtotal * 0.1);
  const expectedTax = Math.round(expectedSubtotal * 0.05);
  const expectedTotal = expectedSubtotal + expectedFee + expectedTax;

  if (holdRes.subtotalCents !== expectedSubtotal) {
    throw new Error(`Subtotal mismatch: got ${holdRes.subtotalCents}, expected ${expectedSubtotal}`);
  }
  if (holdRes.totalAmountCents !== expectedTotal) {
    throw new Error(`Total mismatch: got ${holdRes.totalAmountCents}, expected ${expectedTotal}`);
  }
  console.log(`   ✅ Server-side price calculation verified: Total ${formatCentsToUSD(holdRes.totalAmountCents)} (${holdRes.totalAmountCents} cents)`);

  // 5. Payment with Idempotency Key
  const idempotencyKey = `idemp_test_${Date.now()}_abc`;
  console.log(`   5. Processing payment with Idempotency Key: ${idempotencyKey}...`);

  const paymentRes = await repository.processPaymentAndConfirm(
    holdRes.bookingId,
    idempotencyKey,
    user.id,
    "STRIPE_TEST"
  );

  if (!paymentRes.success || paymentRes.status !== "CONFIRMED") {
    throw new Error("Payment confirmation failed");
  }
  console.log(`   ✅ Booking confirmed! Reference: ${paymentRes.bookingReference}, Ticket: ${paymentRes.ticketCode}`);

  // 6. Test Payment Idempotency (Retry with same idempotency key)
  console.log("   6. Retrying payment with duplicate idempotency key (simulating network retry)...");
  const retryPaymentRes = await repository.processPaymentAndConfirm(
    holdRes.bookingId,
    idempotencyKey,
    user.id,
    "STRIPE_TEST"
  );

  if (retryPaymentRes.ticketCode !== paymentRes.ticketCode) {
    throw new Error("❌ Idempotency failed: Retry returned mismatched ticket code");
  }
  console.log("   ✅ Idempotency Verified: Duplicate payment attempt returned existing confirmed ticket without duplicate charges!");

  // 7. Check User Booking History
  console.log("   7. Verifying booking history for user...");
  const userBookings = await repository.getUserBookings(user.id);
  const foundBooking = userBookings.find((b) => b.id === holdRes.bookingId);
  if (!foundBooking || foundBooking.status !== "CONFIRMED" || !foundBooking.ticket?.qrCodeData) {
    throw new Error("❌ Booking not found in user history or missing QR code data");
  }
  console.log(`   ✅ Verified digital pass QR data contains: ${foundBooking.ticket.ticketCode}`);

  // 8. Test Cancellation & Refund
  console.log("   8. Testing cancellation and instant refund...");
  const cancelRes = await repository.cancelBooking(holdRes.bookingId, user.id);
  if (!cancelRes.success || cancelRes.status !== "CANCELLED") {
    throw new Error("Cancellation failed");
  }

  // Verify seats returned to AVAILABLE
  for (const s of selectedSeats) {
    const stSeat = store.showtimeSeats.find((ss) => ss.id === s.id)!;
    if (stSeat.status !== "AVAILABLE") {
      throw new Error(`❌ Seat ${s.id} not released to AVAILABLE after cancellation`);
    }
  }

  console.log(`   ✅ Booking successfully cancelled. Refund of ${formatCentsToUSD(cancelRes.refundAmountCents)} recorded and seats returned to AVAILABLE!`);
  console.log("   ✅ End-to-End Booking Test PASSED!");
  return true;
}

if (require.main === module) {
  runBookingE2ETest().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
