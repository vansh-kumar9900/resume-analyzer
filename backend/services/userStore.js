// Tiny in-memory user DB for demo / local dev (no external database)
const usersByEmail = new Map();

export function findUserByEmail(email) {
  return usersByEmail.get(email.toLowerCase()) || null;
}

export function createUser({ name, email, passwordHash }) {
  const key = email.toLowerCase();
  if (usersByEmail.has(key)) {
    return null;
  }
  const user = {
    id: String(usersByEmail.size + 1),
    name,
    email: key,
    passwordHash,
  };
  usersByEmail.set(key, user);
  return user;
}

export function getUserById(id) {
  for (const u of usersByEmail.values()) {
    if (u.id === id) return u;
  }
  return null;
}
