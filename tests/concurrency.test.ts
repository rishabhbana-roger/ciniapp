import { repository, getStore } from "../src/db/repository";

export async function runConcurrencyTest() {
  console.log("\n🧪 Running Test Suite: Concurrent Seat Booking & Race Condition Locks");

  const store = getStore();

  // Pick a showtime with available seats
  const showtime = store.showtimes[0];
  const availableSeats = store.showtimeSeats.filter(
    (ss) => ss.showtimeId === showtime.id && ss.status === "AVAILABLE"
  );

  if (availableSeats.length === 0) {
    throw new Error("No available seats found in seed data for concurrency test");
  }

  const targetSeat = availableSeats[0];
  const userA = store.users[1]; // Alex
  const userB = store.users[2]; // Sarah

  console.log(`   🎯 Target Seat: ID ${targetSeat.id} for Showtime ${showtime.id}`);
  console.log(`   👥 Firing simultaneous requests from User A (${userA.email}) & User B (${userB.email})...`);

  // Fire simultaneous requests
  const promiseA = repository.holdSeats(showtime.id, [targetSeat.id], userA.id)
    .then((res) => ({ success: true, user: "A", res }))
    .catch((err) => ({ success: false, user: "A", error: err.message, status: (err as any).status }));

  const promiseB = repository.holdSeats(showtime.id, [targetSeat.id], userB.id)
    .then((res) => ({ success: true, user: "B", res }))
    .catch((err) => ({ success: false, user: "B", error: err.message, status: (err as any).status }));

  const [resA, resB] = await Promise.all([promiseA, promiseB]);

  console.log(`   Result A: ${resA.success ? "✅ SUCCESS (Held Seat)" : `❌ CONFLICT: ${resA.error}`}`);
  console.log(`   Result B: ${resB.success ? "✅ SUCCESS (Held Seat)" : `❌ CONFLICT: ${resB.error}`}`);

  // Assertions:
  const successCount = (resA.success ? 1 : 0) + (resB.success ? 1 : 0);
  const failureCount = (!resA.success ? 1 : 0) + (!resB.success ? 1 : 0);

  if (successCount !== 1 || failureCount !== 1) {
    throw new Error(
      `❌ Concurrency lock assertion failed: Expected exactly 1 success and 1 conflict, got ${successCount} successes and ${failureCount} conflicts.`
    );
  }

  // Verify DB state
  const updatedSeat = store.showtimeSeats.find((ss) => ss.id === targetSeat.id);
  if (updatedSeat?.status !== "HELD") {
    throw new Error(`❌ Database state assertion failed: Seat status is ${updatedSeat?.status}, expected 'HELD'.`);
  }

  console.log("   ✅ Concurrency Test PASSED: Exactly 1 reservation succeeded, duplicate concurrent request rejected with Conflict!");
  return true;
}

if (require.main === module) {
  runConcurrencyTest().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
