import { repository, getStore } from "../src/db/repository";
import { verifyPassword } from "../src/lib/auth";

export async function runAuthSecurityTest() {
  console.log("\n🧪 Running Test Suite: Authentication, Cross-Tenant Security & Role Isolation");

  const store = getStore();
  const admin = store.users.find((u) => u.role === "ADMIN")!;
  const userA = store.users.find((u) => u.email === "alex@cinebook.com")!;
  const userB = store.users.find((u) => u.email === "sarah@cinebook.com")!;

  // 1. Verify bcrypt hash
  console.log("   1. Testing bcrypt password hash verification...");
  const validAdmin = await verifyPassword("AdminPass123!", admin.passwordHash);
  const invalidAdmin = await verifyPassword("WrongPassword!", admin.passwordHash);

  if (!validAdmin || invalidAdmin) {
    throw new Error("❌ Password hash verification failed");
  }
  console.log("   ✅ Password hashing and bcrypt verification secure");

  // 2. Cross-user booking cancellation isolation
  console.log("   2. Testing cross-user isolation: User B attempting to cancel User A's booking...");

  // Create a confirmed booking for User A
  const showtime = store.showtimes[2];
  const seat = store.showtimeSeats.find((ss) => ss.showtimeId === showtime.id && ss.status === "AVAILABLE")!;
  const hold = await repository.holdSeats(showtime.id, [seat.id], userA.id);
  await repository.processPaymentAndConfirm(hold.bookingId, `idemp_sec_${Date.now()}`, userA.id);

  let crossCancelBlocked = false;
  try {
    await repository.cancelBooking(hold.bookingId, userB.id, false);
  } catch (err: any) {
    crossCancelBlocked = true;
    console.log(`   ✅ Cross-user cancellation successfully blocked: ${err.message}`);
  }

  if (!crossCancelBlocked) {
    throw new Error("❌ Security violation: User B was able to cancel User A's booking!");
  }

  // 3. Admin Override authorization
  console.log("   3. Testing Admin authorized cancellation...");
  const adminCancelRes = await repository.cancelBooking(hold.bookingId, admin.id, true);
  if (!adminCancelRes.success) {
    throw new Error("❌ Admin could not cancel booking");
  }
  console.log("   ✅ Admin override cancellation authorized");

  console.log("   ✅ Auth & Security Test PASSED: Isolation and role-based permissions enforced!");
  return true;
}

if (require.main === module) {
  runAuthSecurityTest().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
