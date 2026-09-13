import { runConcurrencyTest } from "./concurrency.test";
import { runHoldExpirationTest } from "./hold-expiration.test";
import { runBookingE2ETest } from "./booking-e2e.test";
import { runAuthSecurityTest } from "./auth-security.test";

async function runAllQATests() {
  console.log("==========================================================");
  console.log("🎬 CINEBOOK AUTOMATED QA & INTEGRITY TEST SUITE (AGENT 3)");
  console.log("==========================================================");

  const startTime = Date.now();
  let passed = 0;
  let failed = 0;

  const suites = [
    { name: "Concurrency & Race Condition Locks", fn: runConcurrencyTest },
    { name: "Hold Expiration & Cron Seat Release", fn: runHoldExpirationTest },
    { name: "End-to-End Booking, Idempotency & Refund", fn: runBookingE2ETest },
    { name: "Authentication, Isolation & Role Security", fn: runAuthSecurityTest },
  ];

  for (const suite of suites) {
    try {
      await suite.fn();
      passed++;
    } catch (error: any) {
      console.error(`\n❌ SUITE FAILED: ${suite.name}`);
      console.error(error);
      failed++;
    }
  }

  const durationMs = Date.now() - startTime;
  console.log("\n==========================================================");
  console.log(`📊 TEST RESULTS: ${passed} Passed | ${failed} Failed (${durationMs}ms)`);
  console.log("==========================================================");

  if (failed > 0) {
    console.error("❌ Some QA test suites failed.");
    process.exit(1);
  } else {
    console.log("🎉 ALL AGENT 3 QA VERIFICATION TESTS PASSED SUCCESSFULLY!\n");
    process.exit(0);
  }
}

runAllQATests();
