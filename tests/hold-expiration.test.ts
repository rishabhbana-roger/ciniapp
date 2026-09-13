import { repository, getStore } from "../src/db/repository";

export async function runHoldExpirationTest() {
  console.log("\n🧪 Running Test Suite: Hold Expiration & Automatic Release Engine");

  const store = getStore();

  const showtime = store.showtimes[1];
  const availableSeats = store.showtimeSeats.filter(
    (ss) => ss.showtimeId === showtime.id && ss.status === "AVAILABLE"
  );

  if (availableSeats.length < 2) {
    throw new Error("Insufficient seats for hold expiration test");
  }

  const seatToHold = availableSeats[0];
  const userA = store.users[1]; // Alex
  const userB = store.users[2]; // Sarah

  console.log(`   1. User A holds seat ${seatToHold.id}...`);
  const holdResult = await repository.holdSeats(showtime.id, [seatToHold.id], userA.id);

  let heldSeat = store.showtimeSeats.find((ss) => ss.id === seatToHold.id)!;
  if (heldSeat.status !== "HELD" || heldSeat.heldByUserId !== userA.id) {
    throw new Error("❌ Seat hold initialization failed");
  }
  console.log(`   ✅ Seat successfully held until: ${heldSeat.heldUntil}`);

  console.log(`   2. Simulating 10-minute timeout by advancing held_until into the past...`);
  heldSeat.heldUntil = new Date(Date.now() - 60 * 1000).toISOString(); // 1 minute in the past

  const pendingBooking = store.bookings.find((b) => b.id === holdResult.bookingId)!;
  pendingBooking.expiresAt = new Date(Date.now() - 60 * 1000).toISOString();

  console.log(`   3. Triggering server-side releaseExpiredHolds() cron job...`);
  const releaseRes = await repository.releaseExpiredHolds();

  console.log(`   ✅ Released count: ${releaseRes.releasedCount}`);
  if (releaseRes.releasedCount < 1) {
    throw new Error("❌ Release cron did not catch expired hold");
  }

  heldSeat = store.showtimeSeats.find((ss) => ss.id === seatToHold.id)!;
  if (heldSeat.status !== "AVAILABLE" || heldSeat.heldByUserId !== null) {
    throw new Error(`❌ Seat status expected 'AVAILABLE', got ${heldSeat.status}`);
  }

  console.log(`   4. Verifying User B can now immediately hold the newly released seat...`);
  const userBHold = await repository.holdSeats(showtime.id, [seatToHold.id], userB.id);

  if (!userBHold || !userBHold.bookingId) {
    throw new Error("❌ User B could not book seat after expiration release");
  }

  console.log("   ✅ Hold Expiration Test PASSED: Expired holds are released and re-bookable!");
  return true;
}

if (require.main === module) {
  runHoldExpirationTest().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
