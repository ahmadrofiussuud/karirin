import test from "node:test";
import assert from "node:assert/strict";
import { authErrorMessage } from "../lib/auth-errors.ts";

test("Signup distinguishes email infrastructure failures from user input", () => {
  assert.match(authErrorMessage({ code: "email_address_not_authorized" }, true), /layanan email Karirin belum dikonfigurasi/);
  assert.match(authErrorMessage({ code: "over_email_send_rate_limit" }, true), /Jangan ulangi pendaftaran dulu/);
  assert.match(authErrorMessage({ code: "weak_password" }, true), /Password belum memenuhi/);
});

test("Login preserves useful confirmation and retry guidance without echoing server details", () => {
  assert.match(authErrorMessage({ code: "email_not_confirmed" }, false), /Akun lama ini masih menunggu aktivasi/);
  assert.match(authErrorMessage({ code: "user_already_exists" }, true), /Gunakan tombol Masuk/);
  assert.match(authErrorMessage({ status: 429 }, false), /Tunggu beberapa menit/);
  assert.match(authErrorMessage({ status: 503 }, false), /Layanan akun sedang mengalami gangguan/);
});
