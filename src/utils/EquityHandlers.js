const amountAfterFee = (amount) => {};
const equityFromAmount = (amount, equityPrice) => {};
const amountFromEquity = (equity, equityPrice) => {};
const equityLeftAfterInvestment = (equity, amount, equityPrice) => {};
// Function to encrypt data
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

// Function to decrypt data
function decrypt(text) {
  const parts = text.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encryptedText = Buffer.from(parts[1], "hex");
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(SECRET_KEY),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

module.exports = {
  amountAfterFee,
  equityFromAmount,
  amountFromEquity,
  equityLeftAfterInvestment,
};
