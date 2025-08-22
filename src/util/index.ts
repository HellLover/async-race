const brandNames = [
  "Tesla",
  "Ford",
  "Chevrolet",
  "BMW",
  "Toyota",
  "Nissan",
  "Honda",
  "Audi",
  "Kia",
  "Hyundai",
];

const modelNames = [
  "Model S",
  "Mustang",
  "Civic",
  "A4",
  "Corolla",
  "Leaf",
  "Cruze",
  "Elantra",
  "Sportage",
  "i8",
];

export function getRandomName() {
  const brand = brandNames[Math.floor(Math.random() * brandNames.length)];
  const model = modelNames[Math.floor(Math.random() * modelNames.length)];
  return `${brand} ${model}`;
}

export function getRandomColor() {
  const r = Math.floor(Math.random() * 255).toString(16).padStart(2, "0");
  const g = Math.floor(Math.random() * 255).toString(16).padStart(2, "0");
  const b = Math.floor(Math.random() * 255).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`;
}