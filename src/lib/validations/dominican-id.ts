// Validación del dígito verificador de RNC (9 dígitos, persona jurídica) y
// cédula (11 dígitos) dominicana, según el algoritmo estándar publicado por la DGII.
// Nota: si alguna empresa con RNC real y válido es rechazada, es señal de que
// el algoritmo necesita un ajuste — avisar para revisarlo, no lo canjees por un
// regex permisivo otra vez.

function digitSum(n: number): number {
  return n > 9 ? Math.floor(n / 10) + (n % 10) : n;
}

function validateCedula(digits: string): boolean {
  const weights = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digitSum(Number(digits[i]) * weights[i]);
  }
  const check = (10 - (sum % 10)) % 10;
  return check === Number(digits[10]);
}

function validateRnc(digits: string): boolean {
  const weights = [7, 9, 8, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += Number(digits[i]) * weights[i];
  }
  const remainder = sum % 11;
  const check = remainder === 0 ? 2 : remainder === 1 ? 1 : 11 - remainder;
  return check === Number(digits[8]);
}

export function isValidDominicanTaxId(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 9) return validateRnc(digits);
  if (digits.length === 11) return validateCedula(digits);
  return false;
}
