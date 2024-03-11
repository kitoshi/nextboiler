import { Argon2id } from 'oslo/password';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { generateId } from 'lucia';
import { lucia, sql } from '@/utilities/lucia/auth';
import { error } from 'console';

export default async function SignUp() {
  return (
    <>
      <h1>Create an account</h1>
      <form action={signup}>
        <label htmlFor='username'>Username</label>
        <input name='username' id='username' />
        <br />
        <label htmlFor='password'>Password</label>
        <input type='password' name='password' id='password' />
        <br />
        <button>Continue</button>
      </form>
    </>
  );
}

interface ActionResult {
  error: string;
  redirect?: string;
}

async function signup(formData: FormData): Promise<ActionResult | undefined> {
  'use server';
  const username = formData.get('username');
  // username must be between 4 ~ 31 characters, and only consists of lowercase letters, 0-9, -, and _
  // keep in mind some database (e.g. mysql) are case insensitive
  if (
    typeof username !== 'string' ||
    username.length < 3 ||
    username.length > 31 ||
    !/^[a-z0-9_-]+$/.test(username)
  ) {
    return {
      error: 'Invalid username'
    };
  }
  const password = formData.get('password');
  if (
    typeof password !== 'string' ||
    password.length < 6 ||
    password.length > 255
  ) {
    return {
      error: 'Invalid password'
    };
  }

  const hashedPassword = await new Argon2id().hash(password);
  const userId = generateId(15);

  await sql`
  INSERT INTO "auth_user" ("id", "username", "hashedpassword")
  VALUES (${userId}, ${username}, ${hashedPassword});
`;
  const existingUser: Record<string, any>[] = await sql`SELECT *
FROM "auth_user"
WHERE LOWER(username) = ${username.toLowerCase()}`;
  console.log(existingUser);

  if (!existingUser || existingUser.length === 0) {
    // NOTE:
    // Returning immediately allows malicious actors to figure out valid usernames from response times,
    // allowing them to only focus on guessing passwords in brute-force attacks.
    // As a preventive measure, you may want to hash passwords even for invalid usernames.
    // However, valid usernames can be already be revealed with the signup page among other methods.
    // It will also be much more resource intensive.
    // Since protecting against this is none-trivial,
    // it is crucial your implementation is protected against brute-force attacks with login throttling etc.
    // If usernames are public, you may outright tell the user that the username is invalid.
    throw error;
  }
  const session = await lucia.createSession(existingUser[0].id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  return redirect('/');
}
